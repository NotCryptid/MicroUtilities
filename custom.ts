/**
 * Utilities for querying system metrics and controlling the micro:bit LED matrix.
 * LED helpers become no-ops on targets without a built-in 5x5 matrix (e.g. Arcade boards).
 */

// Access runtime services dynamically so this package compiles across targets
declare const globalThis: any;

function getControl(): any {
    return globalThis && globalThis.control;
}

// Access the LED matrix dynamically without hard references so this package
// compiles on Arcade devices where the `led` namespace isn't available.
function getLed(): any {
    const matrix = globalThis && globalThis.led;
    return matrix && typeof matrix.plot === "function" ? matrix : undefined;
}

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
        const ctrl = getControl();
        const bytes = ctrl && ctrl.getConfigValue ? ctrl.getConfigValue(DAL.CFG_FLASH_BYTES, 0) : 0;
        return convertStorage(bytes, unit);
    }

    /**
     * Flash used by the program.
     */
    //% block="storage usage in %unit" unit.defl=StorageUnit.Bytes
    export function storageUsage(unit: StorageUnit = StorageUnit.Bytes): number {
        const ctrl = getControl();
        const bytes = ctrl && ctrl.programSize ? ctrl.programSize() : 0;
        return convertStorage(bytes, unit);
    }

    /**
     * RAM currently used.
     */
    //% block="RAM usage in %unit" unit.defl=DataUnit.Bytes
    export function ramUsage(unit: DataUnit = DataUnit.Bytes): number {
        const ctrl = getControl();
        if (ctrl && ctrl.getConfigValue) {
            const total = ctrl.getConfigValue(DAL.CFG_RAM_BYTES, 0);
            const heap = ctrl.heapUsed as (() => number) | undefined;
            if (total && heap) {
                const used = heap();
                return convertData(used, unit);
            }
        }
        return 0;
    }

    /**
     * Approximate CPU speed in MHz.
     */
    //% block
    export function cpuUsage(): number {
        const ctrl = getControl();
        return ctrl && ctrl.getConfigValue ? ctrl.getConfigValue(DAL.CFG_CPU_MHZ, 0) : 0;
    }

    /**
     * Toggle an individual LED pixel.
     */
    //% block
    export function togglePixel(x: number, y: number): void {
        const matrix = getLed();
        if (!matrix) return;
        if (matrix.point(x, y)) matrix.unplot(x, y);
        else matrix.plot(x, y);
    }

    /**
     * Turn an individual pixel on or off.
     */
    //% block
    export function setPixel(x: number, y: number, on: boolean): void {
        const matrix = getLed();
        if (!matrix) return;
        if (on) matrix.plot(x, y);
        else matrix.unplot(x, y);
    }

    /**
     * Set brightness of a single pixel (0-255).
     */
    //% block
    export function setPixelBrightness(x: number, y: number, brightness: number): void {
        const matrix = getLed();
        if (!matrix) return;
        matrix.plotBrightness(x, y, brightness);
    }

    /**
     * Display an image represented by a 5x5 brightness array.
     * Each entry should be "0"-"255" or "#" for full brightness.
     * The outer array contains rows and the inner arrays contain columns.
     */
    //% block
    export function showImage(image: (string | number)[][]): void {
        const matrix = getLed();
        if (!matrix) return;
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
                if (v) matrix.plotBrightness(x, y, v);
                else matrix.unplot(x, y);
            }
        }
    }
}