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
        }
    }

    /**
     * CPU speed in megahertz.
     */
    //% blockId=microUtilities_cpuSpeed block="CPU speed"
    export function cpuSpeed(): number {
        return _cpuUsage();
    }

    /**
     * Toggle a pixel at x,y on the LED matrix.
     */
    //% blockId=microUtilities_togglePixel block="toggle pixel at x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function togglePixel(x: number, y: number): void {
        _togglePixel(x | 0, y | 0);
    }

    /**
     * Set the state of a pixel at x,y.
     */
    //% blockId=microUtilities_setPixel block="set pixel at x %x y %y to %on"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function setPixel(x: number, y: number, on: boolean): void {
        _setPixel(x | 0, y | 0, on ? 1 : 0);
    }

    /**
     * Set the brightness of a pixel at x,y.
     */
    //% blockId=microUtilities_setPixelBrightness block="set pixel at x %x y %y brightness %brightness"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% brightness.min=0 brightness.max=255
    export function setPixelBrightness(x: number, y: number, brightness: number): void {
        _setPixelBrightness(x | 0, y | 0, brightness | 0);
    }

    /**
     * Set the LED matrix to an image.
     */
    //% blockId=microUtilities_setImage block="set image %img"
    //% imageLiteral=1
    export function setImage(img: string): void {
        const im = (<Image>(<any>img));
        for (let cx = 0; cx < 5; cx++) {
            for (let cy = 0; cy < 5; cy++) {
                const v = im.pixel(cx, cy);
                setPixelBrightness(cx, cy, v);
            }
        }
    }
}