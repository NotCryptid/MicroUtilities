#include "pxt.h"

// Report flash, RAM and CPU info, and (on micro:bit only) drive the LED matrix.
//
// MICROUTILITIES_HAS_MICROBIT is true when this file is being compiled against
// a micro:bit core (classic DAL or codal-microbit-v2), both of which ship a
// top-level "MicroBit.h". Other Arcade hardware targets (samd21, stm32, ...)
// never provide that header, so this reliably tells the two apart at compile
// time without depending on internal target build flags.
#if defined(__has_include)
#if __has_include("MicroBit.h")
#define MICROUTILITIES_HAS_MICROBIT 1
#include "MicroBit.h"
#endif
#endif
#ifndef MICROUTILITIES_HAS_MICROBIT
#define MICROUTILITIES_HAS_MICROBIT 0
#endif

namespace pxt {
Buffer getGCStats();
}

static inline int32_t getFlashSize() {
    int32_t flash = pxt::getConfig(CFG_FLASH_BYTES, 0);
    if (flash <= 0) {
#if MICROUTILITIES_HAS_MICROBIT
        flash = 512 * 1024;
#else
        flash = 256 * 1024;
#endif
    }
    return flash;
}

static inline int32_t getRamSize() {
    int32_t ram = pxt::getConfig(CFG_RAM_BYTES, 0);
    if (ram <= 0) {
#if MICROUTILITIES_HAS_MICROBIT
        ram = 128 * 1024;
#else
        ram = 16 * 1024;
#endif
    }
    return ram;
}

namespace microUtilities {
int32_t _storageCapacity() {
    return getFlashSize();
}

int32_t _storageUsage() {
    return (int32_t)pxt::programSize();
}

int32_t _ramCapacity() {
    return getRamSize();
}

int32_t _ramUsage() {
    Buffer stats = pxt::getGCStats();
    if (!stats || PXT_BUFFER_LENGTH(stats) < 24)
        return 0;
    const uint32_t *fields = (const uint32_t *)PXT_BUFFER_DATA(stats);
    uint32_t totalBytes = fields[2];
    uint32_t lastFreeBytes = fields[3];
    if (lastFreeBytes > totalBytes)
        return 0;
    return (int32_t)(totalBytes - lastFreeBytes);
}

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

int _isMicrobit() {
    return MICROUTILITIES_HAS_MICROBIT;
}

#if MICROUTILITIES_HAS_MICROBIT
void _togglePixel(int32_t x, int32_t y) {
    auto img = uBit.display.image;
    auto v = img.getPixelValue(x, y);
    img.setPixelValue(x, y, v ? 0 : 255);
}

void _setPixel(int32_t x, int32_t y, int32_t on) {
    uBit.display.image.setPixelValue(x, y, on ? 255 : 0);
}

void _setPixelBrightness(int32_t x, int32_t y, int32_t brightness) {
    if (brightness < 0)
        brightness = 0;
    else if (brightness > 255)
        brightness = 255;
    uBit.display.image.setPixelValue(x, y, brightness);
}
#else
// No LED matrix on non-micro:bit Arcade hardware; these become harmless no-ops.
void _togglePixel(int32_t x, int32_t y) {}
void _setPixel(int32_t x, int32_t y, int32_t on) {}
void _setPixelBrightness(int32_t x, int32_t y, int32_t brightness) {}
#endif
}
