// Native shims implemented in C++. Each keeps a plain TS body as a generic
// placeholder for the web simulator: pxt only swaps in the native shim when
// compiling for real hardware, so these values are what the browser sim
// shows instead of an "unimplemented" stub.
const _simPixels: boolean[][] = [[false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false]];

//% shim=microUtilities::_storageCapacity
function _storageCapacity(): number {
    return 512 * 1024;
}
//% shim=microUtilities::_storageUsage
function _storageUsage(): number {
    return 128 * 1024;
}
//% shim=microUtilities::_ramUsage
function _ramUsage(): number {
    return 32 * 1024;
}
//% shim=microUtilities::_ramCapacity
function _ramCapacity(): number {
    return 128 * 1024;
}
//% shim=microUtilities::_cpuSpeed
function _cpuSpeed(): number {
    return 64;
}
//% shim=microUtilities::_togglePixel
function _togglePixel(x: number, y: number): void {
    _simPixels[y][x] = !_simPixels[y][x];
}
//% shim=microUtilities::_setPixel
function _setPixel(x: number, y: number, on: boolean): void {
    _simPixels[y][x] = on;
}
//% shim=microUtilities::_setPixelBrightness
function _setPixelBrightness(x: number, y: number, brightness: number): void {
    _simPixels[y][x] = brightness > 0;
}
//% shim=microUtilities::_isMicrobit
function _isMicrobit(): boolean {
    return false;
}

enum StorageUnit {
    Bytes,
    Kilobytes,
    Megabytes
}

//% weight=100 color=#2F5597 icon="\uf0a0"
namespace microUtilities {
    /**
     * Total non-volatile storage capacity.
     * @param unit unit of measurement
     */
    //% blockId=microUtilities_storageCapacity block="storage capacity in %unit"
    //% unit.defl=StorageUnit.Megabytes
    export function storageCapacity(unit: StorageUnit): number {
        const cap = _storageCapacity();
        switch (unit) {
            case StorageUnit.Bytes: return cap;
            case StorageUnit.Kilobytes: return cap / 1024;
            case StorageUnit.Megabytes: return cap / (1024 * 1024);
            default: return cap;
        }
    }

    /**
     * Used non-volatile storage.
     * @param unit unit of measurement
     */
    //% blockId=microUtilities_storageUsage block="storage usage in %unit"
    //% unit.defl=StorageUnit.Megabytes
    export function storageUsage(unit: StorageUnit): number {
        const used = _storageUsage();
        switch (unit) {
            case StorageUnit.Bytes: return used;
            case StorageUnit.Kilobytes: return used / 1024;
            case StorageUnit.Megabytes: return used / (1024 * 1024);
            default: return used;
        }
    }

    /**
     * Total RAM capacity.
     * @param unit unit of measurement
     */
    //% blockId=microUtilities_ramCapacity block="RAM capacity in %unit"
    //% unit.defl=StorageUnit.Kilobytes
    export function ramCapacity(unit: StorageUnit): number {
        const total = _ramCapacity();
        switch (unit) {
            case StorageUnit.Bytes: return total;
            case StorageUnit.Kilobytes: return total / 1024;
            case StorageUnit.Megabytes: return total / (1024 * 1024);
            default: return total;
        }
    }

    /**
     * Used RAM.
     * @param unit unit of measurement
     */
    //% blockId=microUtilities_ramUsage block="RAM usage in %unit"
    //% unit.defl=StorageUnit.Kilobytes
    export function ramUsage(unit: StorageUnit): number {
        const used = _ramUsage();
        switch (unit) {
            case StorageUnit.Bytes: return used;
            case StorageUnit.Kilobytes: return used / 1024;
            case StorageUnit.Megabytes: return used / (1024 * 1024);
            default: return used;
        }
    }

    /**
     * CPU speed in megahertz.
     */
    //% blockId=microUtilities_cpuSpeed block="CPU speed"
    export function cpuSpeed(): number {
        return _cpuSpeed();
    }

    /**
     * Toggle a pixel at x,y on the LED matrix. Has no effect on devices
     * that aren't a micro:bit; use isMicrobit to check first.
     */
    //% blockId=microUtilities_togglePixel block="toggle pixel at x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function togglePixel(x: number, y: number): void {
        _togglePixel(x | 0, y | 0);
    }

    /**
     * Set the state of a pixel at x,y. Has no effect on devices that
     * aren't a micro:bit; use isMicrobit to check first.
     */
    //% blockId=microUtilities_setPixel block="set pixel at x %x y %y to %on"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function setPixel(x: number, y: number, on: boolean): void {
        _setPixel(x | 0, y | 0, on ? true : false);
    }

    /**
     * Set the brightness of a pixel at x,y. Has no effect on devices
     * that aren't a micro:bit; use isMicrobit to check first.
     */
    //% blockId=microUtilities_setPixelBrightness block="set pixel at x %x y %y brightness %brightness"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% brightness.min=0 brightness.max=255
    export function setPixelBrightness(x: number, y: number, brightness: number): void {
        _setPixelBrightness(x | 0, y | 0, brightness | 0);
    }

    /**
     * True if this device is a BBC micro:bit, false for other Arcade hardware.
     */
    //% blockId=microUtilities_isMicrobit block="is micro:bit"
    export function isMicrobit(): boolean {
        return _isMicrobit();
    }
}