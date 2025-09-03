/**
 * Utilities for querying system metrics and controlling the micro:bit LED matrix.
 * LED helpers become no-ops on targets without a built-in 5x5 matrix (e.g. Arcade boards).
 */

// Native shims implemented in C++
//% shim=microUtilities::_storageCapacity
declare function _storageCapacity(): number;
//% shim=microUtilities::_storageUsage
declare function _storageUsage(): number;
//% shim=microUtilities::_ramUsage
declare function _ramUsage(): number;
//% shim=microUtilities::_cpuUsage
declare function _cpuUsage(): number;
//% shim=microUtilities::_togglePixel
declare function _togglePixel(x: number, y: number): void;
//% shim=microUtilities::_setPixel
declare function _setPixel(x: number, y: number, on: boolean): void;
//% shim=microUtilities::_setPixelBrightness
declare function _setPixelBrightness(x: number, y: number, brightness: number): void;

//% weight=90 color=#6d009c icon=""
namespace microUtilities {
    export enum DataUnit {
        //% block="bytes"
        Bytes,
        //% block="KB"
        Kilobytes,
        //% block="MB"
        Megabytes
    }

    export enum StorageUnit {
        //% block="bytes"
        Bytes,
        //% block="KB"
        Kilobytes,
        //% block="MB"
        Megabytes,
        //% block="GB"
        Gigabytes
    }

    function convertData(value: number, unit: DataUnit): number {
        switch (unit) {
            case DataUnit.Kilobytes: return value / 1024;
            case DataUnit.Megabytes: return value / (1024 * 1024);
            default: return value;
        }
    }

    function convertStorage(value: number, unit: StorageUnit): number {
        switch (unit) {
            case StorageUnit.Kilobytes: return value / 1024;
            case StorageUnit.Megabytes: return value / (1024 * 1024);
            case StorageUnit.Gigabytes: return value / (1024 * 1024 * 1024);
            default: return value;
        }
    }

    /**
     * Total flash storage capacity.
     */
    //% block="storage capacity in %unit" unit.defl=StorageUnit.Bytes
    export function storageCapacity(unit: StorageUnit = StorageUnit.Bytes): number {
        const bytes = _storageCapacity();
        return convertStorage(bytes, unit);
    }

    /**
     * Flash used by the program.
     */
    //% block="storage usage in %unit" unit.defl=StorageUnit.Bytes
    export function storageUsage(unit: StorageUnit = StorageUnit.Bytes): number {
        const bytes = _storageUsage();
        return convertStorage(bytes, unit);
    }

    /**
     * RAM currently used.
     */
    //% block="RAM usage in %unit" unit.defl=DataUnit.Bytes
    export function ramUsage(unit: DataUnit = DataUnit.Bytes): number {
        const used = _ramUsage();
        return convertData(used, unit);
    }

    /**
     * Approximate CPU speed in MHz.
     */
    //% block
    export function cpuUsage(): number {
        return _cpuUsage();
    }

    /**
     * Toggle an individual LED pixel.
     */
    //% block
    export function togglePixel(x: number, y: number): void {
        _togglePixel(x, y);
    }

    /**
     * Turn an individual pixel on or off.
     */
    //% block
    export function setPixel(x: number, y: number, on: boolean): void {
        _setPixel(x, y, on);
    }

    /**
     * Set brightness of a single pixel (0-255).
     */
    //% block
    export function setPixelBrightness(x: number, y: number, brightness: number): void {
        _setPixelBrightness(x, y, brightness);
    }

    /**
     * Display an image represented by a 5x5 brightness array.
     * Each entry should be "0"-"255" or "#" for full brightness.
     * The outer array contains rows and the inner arrays contain columns.
     */
    //% block
    export function showImage(image: (string | number)[][]): void {
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                const row = image[y];
                const cell = row ? row[x] : undefined;
                let v = 0;
                if (cell !== undefined && cell !== null) {
                    if (cell === "#") v = 255;
                    else {
                        const n = typeof cell === "string" ? parseInt(cell) : cell;
                        v = isNaN(n) ? 0 : Math.max(0, Math.min(255, n));
                    }
                }
                _setPixelBrightness(x, y, v);
            }
        }
    }
}
