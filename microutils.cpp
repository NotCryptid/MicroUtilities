#include "pxt.h"

// Provide runtime information about flash, RAM usage and CPU speed.

static inline int32_t getFlashSize() {
    int32_t flash = pxt::getConfig(pxt::CFG_FLASH_BYTES, 0);
    if (flash <= 0) {
#if defined(MICROBIT_V2)
        flash = 512 * 1024;
#else
        flash = 256 * 1024;
#endif
    }
    return flash;
}

extern "C" {
int32_t _storageCapacity() {
    return getFlashSize();
}

int32_t _storageUsage() {
    return (int32_t)pxt::programSize();
}

int32_t _ramUsage() {
    int32_t total = pxt::getConfig(pxt::CFG_RAM_BYTES, 0);
    if (total <= 0) {
#if defined(MICROBIT_V2)
        total = 128 * 1024;
#else
        total = 16 * 1024;
#endif
    }
    int32_t freeMem = (int32_t)pxt::getFreeMemory();
    int32_t used = total - freeMem;
    if (used < 0)
        used = 0;
    return used;
}

int32_t _ramCapacity() {
    int32_t total = pxt::getConfig(pxt::CFG_RAM_BYTES, 0);
    if (total <= 0) {
#if defined(MICROBIT_V2)
        total = 128 * 1024;
#else
        total = 16 * 1024;
#endif
    }
    int32_t freeMem = (int32_t)pxt::getFreeMemory();
    return freeMem;
}

int32_t _cpuUsage() {
    int32_t cpu = pxt::getConfig(pxt::CFG_CPU_MHZ, 0);
    if (cpu <= 0) {
#if defined(MICROBIT_V2)
        cpu = 64;
#else
        cpu = 16;
#endif
    }
    return cpu;
}

void _togglePixel(int32_t x, int32_t y) {
    auto img = uBit.display.image.pixels;
    auto v = img[x + y * MICROBIT_DISPLAY_WIDTH];
    uBit.display.image.setPixelValue(x, y, v ? 0 : 255);
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
}