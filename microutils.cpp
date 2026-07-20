// Report flash, RAM and CPU info, and (on micro:bit only) drive the LED matrix.
//
// Three build configurations reach this file:
//  1. Plain pxt-microbit target: MicroBit.h is available and safe to include
//     directly; the LED functions use the normal uBit.display API.
//  2. Arcade compiled against a micro:bit board (e.g. the Newbit shield,
//     hw---n3): the hw variant sets ARCADE_MBIT_CODAL=1. Arcade's own
//     core---nrf52/platform.h typedefs a global PinName as uint8_t and
//     #defines raw pin macros (P0_0, P0_1, ...), which directly conflicts
//     with codal-microbit-v2's own enum PinName in MicroBitIO.h, so
//     MicroBit.h cannot be included in this translation unit at all (tried:
//     reordering the includes only trades that conflict for a "expected
//     identifier" parse error; wrapping the include in a namespace avoids
//     the PinName clash but breaks libstdc++, since MicroBit.h pulls in
//     <cstdlib> and namespacing that hides ::abs/::malloc/etc from it).
//     Instead we drive the same physical LED matrix hardware directly,
//     using the micro:bit V2's known row/column GPIO wiring (lifted from
//     codal-microbit-v2's own MicroBitIO.cpp) and the low-level
//     NRF52LEDMatrix driver class, which depends only on generic codal-core
//     types and never touches PinName.
//  3. Any other Arcade hardware (samd21, stm32, ...): no micro:bit present.
#if defined(ARCADE_MBIT_CODAL) && ARCADE_MBIT_CODAL
#define MICROUTILITIES_HAS_MICROBIT 1
#define MICROUTILITIES_ARCADE_MBIT 1
#elif defined(__has_include) && __has_include("MicroBit.h")
#define MICROUTILITIES_HAS_MICROBIT 1
#define MICROUTILITIES_ARCADE_MBIT 0
#include "MicroBit.h"
#else
#define MICROUTILITIES_HAS_MICROBIT 0
#define MICROUTILITIES_ARCADE_MBIT 0
#endif

#include "pxt.h"

#if MICROUTILITIES_ARCADE_MBIT
#include "NRF52LedMatrix.h"
#include "NRF52Pin.h"
#include "NRFLowLevelTimer.h"

using namespace codal;

// Row/column GPIO wiring for the micro:bit V2's 5x5 LED matrix, as wired up
// by codal-microbit-v2's MicroBitIO.cpp. P0_xx/P1_xx here are the plain
// integer pin-index macros Arcade's own core---nrf52/platform.h defines
// (port*32 + pin), which is exactly the raw codal::PinNumber NRF52Pin expects
// -- no PinName enum involved.
static NRF52Pin mbitRowPins[5] = {
    NRF52Pin(6001, P0_21, PIN_CAPABILITY_AD),
    NRF52Pin(6002, P0_22, PIN_CAPABILITY_AD),
    NRF52Pin(6003, P0_15, PIN_CAPABILITY_AD),
    NRF52Pin(6004, P0_24, PIN_CAPABILITY_AD),
    NRF52Pin(6005, P0_19, PIN_CAPABILITY_AD),
};
static NRF52Pin mbitColPins[5] = {
    NRF52Pin(6006, P0_28, PIN_CAPABILITY_AD),
    NRF52Pin(6007, P0_11, PIN_CAPABILITY_AD),
    NRF52Pin(6008, P0_31, PIN_CAPABILITY_AD),
    NRF52Pin(6009, P1_5, PIN_CAPABILITY_AD),
    NRF52Pin(6010, P0_30, PIN_CAPABILITY_AD),
};
static Pin *mbitRowPinPtrs[5] = {&mbitRowPins[0], &mbitRowPins[1], &mbitRowPins[2], &mbitRowPins[3],
                                 &mbitRowPins[4]};
static Pin *mbitColPinPtrs[5] = {&mbitColPins[0], &mbitColPins[1], &mbitColPins[2], &mbitColPins[3],
                                 &mbitColPins[4]};
static const MatrixPoint mbitMatrixPositions[5 * 5] = {
    {0, 0}, {0, 1}, {0, 2}, {0, 3}, {0, 4}, {1, 0}, {1, 1}, {1, 2}, {1, 3}, {1, 4},
    {2, 0}, {2, 1}, {2, 2}, {2, 3}, {2, 4}, {3, 0}, {3, 1}, {3, 2}, {3, 3}, {3, 4},
    {4, 0}, {4, 1}, {4, 2}, {4, 3}, {4, 4},
};
static const MatrixMap mbitMatrixMap = {5, 5, 5, 5, mbitRowPinPtrs, mbitColPinPtrs, mbitMatrixPositions};

static NRF52LEDMatrix &arcadeMbitDisplay() {
    // Lazily constructed: NRF_TIMER4/TIMER4_IRQn matches what codal-microbit-v2's
    // own MicroBitDisplay hardcodes on the plain micro:bit target. Arcade's
    // generic timer allocator (core---nrf52/platform.cpp) only pulls from
    // TIMER0-3 by default, so TIMER4 is left free for this.
    static NRFLowLevelTimer timer(NRF_TIMER4, TIMER4_IRQn);
    static NRF52LEDMatrix display(timer, mbitMatrixMap, 6011, DisplayMode::DISPLAY_MODE_GREYSCALE);
    return display;
}
#endif

namespace pxt {
Buffer getGCStats();
}

// getConfig() only hands back a signed 32-bit int, so a config value whose
// top bit is set (i.e. between 2GB and 4GB) comes back negative; reinterpret
// it as uint32_t rather than clamping it away, and hand it back as double so
// the TS side can represent the full 0..4GB range exactly (doubles are exact
// for all integers up to 2^53).
static inline double getFlashSize() {
    int32_t flash = pxt::getConfig(CFG_FLASH_BYTES, 0);
    if (flash == 0) {
#if MICROUTILITIES_HAS_MICROBIT
        return 512.0 * 1024;
#else
        return 256.0 * 1024;
#endif
    }
    return (double)(uint32_t)flash;
}

static inline double getRamSize() {
    int32_t ram = pxt::getConfig(CFG_RAM_BYTES, 0);
    if (ram == 0) {
#if MICROUTILITIES_HAS_MICROBIT
        return 128.0 * 1024;
#else
        return 16.0 * 1024;
#endif
    }
    return (double)(uint32_t)ram;
}

namespace microUtilities {
//%
double _storageCapacity() {
    return getFlashSize();
}

//%
double _storageUsage() {
    // programSize() is `unsigned`; cast straight to double instead of
    // int32_t so program sizes past 2GB don't wrap negative.
    return (double)pxt::programSize();
}

//%
double _ramCapacity() {
    return getRamSize();
}

//%
double _ramUsage() {
    Buffer stats = pxt::getGCStats();
    if (!stats || PXT_BUFFER_LENGTH(stats) < 24)
        return 0;
    const uint32_t *fields = (const uint32_t *)PXT_BUFFER_DATA(stats);
    uint32_t totalBytes = fields[2];
    uint32_t lastFreeBytes = fields[3];
    if (lastFreeBytes > totalBytes)
        return 0;
    // Subtract as uint32_t, then widen to double -- casting the difference
    // to int32_t instead would flip negative once usage passed 2GB.
    return (double)(totalBytes - lastFreeBytes);
}

//%
int32_t _cpuSpeed() {
    int32_t cpu = pxt::getConfig(CFG_CPU_MHZ, 0);
    if (cpu <= 0) {
#if MICROUTILITIES_HAS_MICROBIT
        cpu = 64;
#else
        cpu = 120;
#endif
    }
    return cpu;
}

//%
int _isMicrobit() {
    return MICROUTILITIES_HAS_MICROBIT;
}

#if MICROUTILITIES_ARCADE_MBIT
//%
void _togglePixel(int32_t x, int32_t y) {
    auto &img = arcadeMbitDisplay().image;
    auto v = img.getPixelValue(x, y);
    img.setPixelValue(x, y, v ? 0 : 255);
}

//%
void _setPixel(int32_t x, int32_t y, int32_t on) {
    arcadeMbitDisplay().image.setPixelValue(x, y, on ? 255 : 0);
}

//%
void _setPixelBrightness(int32_t x, int32_t y, int32_t brightness) {
    if (brightness < 0)
        brightness = 0;
    else if (brightness > 255)
        brightness = 255;
    arcadeMbitDisplay().image.setPixelValue(x, y, brightness);
}
#elif MICROUTILITIES_HAS_MICROBIT
//%
void _togglePixel(int32_t x, int32_t y) {
    auto img = uBit.display.image;
    auto v = img.getPixelValue(x, y);
    img.setPixelValue(x, y, v ? 0 : 255);
}

//%
void _setPixel(int32_t x, int32_t y, int32_t on) {
    uBit.display.image.setPixelValue(x, y, on ? 255 : 0);
}

//%
void _setPixelBrightness(int32_t x, int32_t y, int32_t brightness) {
    if (brightness < 0)
        brightness = 0;
    else if (brightness > 255)
        brightness = 255;
    uBit.display.image.setPixelValue(x, y, brightness);
}
#else
// No LED matrix on non-micro:bit Arcade hardware; these become harmless no-ops.
//%
void _togglePixel(int32_t x, int32_t y) {}
//%
void _setPixel(int32_t x, int32_t y, int32_t on) {}
//%
void _setPixelBrightness(int32_t x, int32_t y, int32_t brightness) {}
#endif
}
