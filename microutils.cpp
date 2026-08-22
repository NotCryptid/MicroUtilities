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
#include "NRF52Serial.h"
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

// USB TX/RX pins and UARTE peripheral, lifted from codal-microbit-v2's own
// MicroBitIO.cpp/MicroBit.cpp (MICROBIT_PIN_UART_TX/RX = P0_06/P1_08 there --
// same physical pins as Arcade's own P0_6/P1_8 macros used below, just
// without the leading zero), wired straight through to the interface chip's
// USB-serial bridge -- same pins and peripheral (NRF_UARTE0) the plain
// micro:bit target's uBit.serial uses. Unlike TIMER4 for the display above,
// there's no equivalent confirmation that Arcade's own core---nrf52 runtime
// leaves NRF_UARTE0 unclaimed -- this hasn't been verified against actual
// on-device behavior.
static NRF52Serial &arcadeMbitSerial() {
    static NRF52Pin usbTx(6012, P0_6, PIN_CAPABILITY_DIGITAL);
    static NRF52Pin usbRx(6013, P1_8, PIN_CAPABILITY_DIGITAL);
    static NRF52Serial serial(usbTx, usbRx, NRF_UARTE0);
    return serial;
}
#endif

#if MICROUTILITIES_ARCADE_MBIT
#define MICROUTILITIES_SERIAL arcadeMbitSerial()
#elif MICROUTILITIES_HAS_MICROBIT
// MicroBit.h brings in codal's uBit global and (via "using namespace codal")
// the ASYNC etc. symbols used below.
#define MICROUTILITIES_SERIAL uBit.serial
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

// settings.cpp (pxt_modules/settings) carves a fixed slice out of the top of flash for its
// key/value store -- taken out of the program's usable storage whether or not anything has
// actually been written there yet -- plus, on top of that, a separate "large store" region for
// big binary blobs (eg ML models) when one doesn't overlap the program. Neither of those is
// part of pxt::programSize(), so _storageUsage() undercounts real flash usage without them.
// largeStoreStart()/largeStoreSize() have external linkage in settings.cpp already (no `static`),
// so they can be called directly without editing that (gitignored, regenerated) file.
namespace settings {
uintptr_t largeStoreStart();
size_t largeStoreSize();
}

static inline double getSettingsSize() {
#if defined(SAMD21)
    uint32_t deflt = 2 * 1024;
#else
    uint32_t deflt = 32 * 1024;
#endif
    uint32_t size = (uint32_t)pxt::getConfig(CFG_SETTINGS_SIZE_DEFL, deflt);
    uint32_t override_ = (uint32_t)pxt::getConfig(CFG_SETTINGS_SIZE, 0);
    return (double)(override_ > 0 ? override_ : size);
}

namespace microUtilities {
//%
TNumber _storageCapacity() {
    return fromDouble(getFlashSize());
}

//%
TNumber _storageUsage() {
    // programSize() is `unsigned`; cast straight to double instead of
    // int32_t so program sizes past 2GB don't wrap negative.
    double used = (double)pxt::programSize() + getSettingsSize();
    if (settings::largeStoreStart())
        used += (double)settings::largeStoreSize();
    return fromDouble(used);
}

//%
TNumber _ramCapacity() {
    return fromDouble(getRamSize());
}

//%
TNumber _ramUsage() {
    Buffer stats = pxt::getGCStats();
    if (!stats || PXT_BUFFER_LENGTH(stats) < 24)
        return fromDouble(0);
    const uint32_t *fields = (const uint32_t *)PXT_BUFFER_DATA(stats);
    uint32_t totalBytes = fields[2];
    uint32_t lastFreeBytes = fields[3];
    if (lastFreeBytes > totalBytes)
        return fromDouble(0);
    // Subtract as uint32_t, then widen to double -- casting the difference
    // to int32_t instead would flip negative once usage passed 2GB.
    return fromDouble((double)(totalBytes - lastFreeBytes));
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

// Board ID -> revision string mapping lifted from pxt-microbit's own
// control.cpp _hardwareVersion(): uBit.power (MicroBitPowerManager) queries
// the interface/power-management chip for a board ID that changed with the
// V2.2 MEMS microphone swap. It never changed again for V2.21, so that
// revision reports the same ID as V2.2 and can't be told apart here -- nor,
// as far as is publicly documented, anywhere else in software. Only
// available on the plain micro:bit target: the Arcade-on-micro:bit build
// (MICROUTILITIES_ARCADE_MBIT) never includes MicroBit.h, so uBit.power
// doesn't exist there.
//%
String _boardRevision() {
#if MICROUTILITIES_HAS_MICROBIT && !MICROUTILITIES_ARCADE_MBIT
    MicroBitVersion v = uBit.power.getVersion();
    switch (v.board) {
    case 0x9903:
    case 0x9904:
        return mkString("2.0", -1);
    case 0x9905:
    case 0x9906:
        return mkString("2.2", -1);
    default:
        return mkString("", 0);
    }
#else
    return mkString("", 0);
#endif
}

//%
int _isSerialSupported() {
    return MICROUTILITIES_HAS_MICROBIT;
}

// Diagnostic only -- lets a caller tell *which* of the three build
// configurations at the top of this file was actually compiled in, since
// isSerialSupported() alone collapses "not supported" and both supported
// paths down to a single bit. Useful for confirming from on-device (e.g. via
// an LED blink at boot) whether ARCADE_MBIT_CODAL was actually defined for a
// given hw target, without needing a debugger or serial output -- which is
// exactly the thing in question when USB serial itself isn't working yet.
//%
int _serialBackend() {
#if MICROUTILITIES_ARCADE_MBIT
    return 1; // hand-rolled NRF52Serial on UARTE0 (Arcade-on-micro:bit)
#elif MICROUTILITIES_HAS_MICROBIT
    return 2; // plain pxt-microbit target's uBit.serial
#else
    return 0; // no serial backend compiled in at all
#endif
}

#if MICROUTILITIES_HAS_MICROBIT
//%
void _serialWriteBuffer(Buffer buffer) {
    if (!buffer)
        return;
    MICROUTILITIES_SERIAL.send(buffer->data, buffer->length);
}

//%
int32_t _serialAvailable() {
    return MICROUTILITIES_SERIAL.isReadable() ? MICROUTILITIES_SERIAL.rxBufferedSize() : 0;
}

// Drains whatever's currently buffered without blocking (ASYNC mode returns
// immediately with however many bytes were actually ready, rather than
// waiting to fill the whole request) -- mirrors pxt-microbit's own
// libs/core/serial.cpp readBuffer().
//%
Buffer _serialReadBuffer() {
    int32_t length = MICROUTILITIES_SERIAL.getRxBufferSize();
    if (length <= 0)
        return mkBuffer(NULL, 0);
    auto buf = mkBuffer(NULL, length);
    registerGCObj(buf);
    int read = MICROUTILITIES_SERIAL.read(buf->data, buf->length, ASYNC);
    Buffer res = read <= 0 ? mkBuffer(NULL, 0) : read == length ? buf : mkBuffer(buf->data, read);
    unregisterGCObj(buf);
    return res;
}
#else
//%
void _serialWriteBuffer(Buffer buffer) {}

//%
int32_t _serialAvailable() {
    return 0;
}

//%
Buffer _serialReadBuffer() {
    return mkBuffer(NULL, 0);
}
#endif

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
