
/**
 * Utilities for querying system metrics and controlling the micro:bit LED matrix.
 * LED helpers become no-ops on targets without a built-in 5x5 matrix (e.g. Arcade boards).
 */

// Expose program size and configuration from the runtime
declare namespace control {
    //% shim=pxt::programSize
    function programSize(): number;
    //% shim=pxt::getConfig
    function getConfigValue(key: number, defl: number): number;
}

// Access the LED matrix dynamically without hard references so this package
// compiles on Arcade devices where `led` is undefined.
declare function eval(code: string): any;
function getLed(): any {
    return eval('typeof led === "undefined" ? undefined : led');
}

//% weight=90 color=#0fbc11 icon=""
namespace microUtilities {
    /**
     * Total flash storage capacity in bytes.
     */
    //% block
    export function storageCapacity(): number {
        return control.getConfigValue(DAL.CFG_FLASH_BYTES, 0);
    }

    /**
     * Bytes of flash currently used by the program.
     */
    //% block
    export function storageUsage(): number {
        return control.programSize();
    }

    /**
     * Total RAM available in bytes.
     */
    //% block
    export function ramUsage(): number {
        return control.ramSize();
    }

    /**
     * Approximate CPU speed in MHz.
     */
    //% block
    export function cpuUsage(): number {
        return control.getConfigValue(DAL.CFG_CPU_MHZ, 0);
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
     */
    //% block
    export function showImage(image: number[][]): void {
        const matrix = getLed();
        if (!matrix) return;
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                const v = image[x][y] || 0;
                if (v) matrix.plotBrightness(x, y, v);
                else matrix.unplot(x, y);
            }
        }
    }
}
