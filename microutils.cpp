#include "pxt.h"

using namespace pxt;

namespace microUtilities {

// Returns total flash storage in bytes
//%
int _storageCapacity() {
    return getConfig(CFG_FLASH_BYTES, 0);
}

// Returns program size in bytes
//%
int _storageUsage() {
    return programSize();
}

// Returns RAM usage in bytes
//%
int _ramUsage() {
    int total = getConfig(CFG_RAM_BYTES, 0);
    if (!total)
        return 0;
    int free = getFreeMemory();
    if (free < 0) free = 0;
    return total - free;
}

// Returns CPU speed in MHz
//%
int _cpuUsage() {
    return getConfig(CFG_CPU_MHZ, 0);
}

// Toggle pixel state
//%
void _togglePixel(int x, int y) {
    auto img = uBit.display.image;
    int v = img.getPixelValue(x, y);
    img.setPixelValue(x, y, v ? 0 : 255);
}

// Set pixel on/off
//%
void _setPixel(int x, int y, bool on) {
    uBit.display.image.setPixelValue(x, y, on ? 255 : 0);
}

// Set pixel brightness 0-255
//%
void _setPixelBrightness(int x, int y, int b) {
    if (b < 0) b = 0;
    if (b > 255) b = 255;
    uBit.display.image.setPixelValue(x, y, b);
}

}
