#include "pxt.h"
using namespace pxt;

namespace microUtilities {

static inline bool inRange(int v) { return (unsigned)v < 5u; }

int _storageCapacity() { return getConfig(CFG_FLASH_BYTES, 0); }
int _storageUsage() { return programSize(); }

int _ramUsage() {
    int total = getConfig(CFG_RAM_BYTES, 0);
    if (!total) return 0;
    int free = getFreeMemory();
    if (free < 0) free = 0;
    return total - free;
}

int _cpuUsage() { return getConfig(CFG_CPU_MHZ, 0); }

void _togglePixel(int x, int y) {
    if (!inRange(x) || !inRange(y)) return;
    auto &img = uBit.display.image;
    int v = img.getPixelValue(x, y);
    img.setPixelValue(x, y, v ? 0 : 255);
}

void _setPixel(int x, int y, bool on) {
    if (!inRange(x) || !inRange(y)) return;
    uBit.display.image.setPixelValue(x, y, on ? 255 : 0);
}

void _setPixelBrightness(int x, int y, int b) {
    if (!inRange(x) || !inRange(y)) return;
    if (b < 0) b = 0; else if (b > 255) b = 255;
    uBit.display.image.setPixelValue(x, y, b);
}

}
