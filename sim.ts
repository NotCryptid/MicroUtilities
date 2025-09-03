let led: any;

namespace pxsim.microUtilities {
    export function _storageCapacity(): number {
        return 0;
    }

    export function _storageUsage(): number {
        return 0;
    }

    export function _ramUsage(): number {
        return 0;
    }

    export function _cpuUsage(): number {
        return 0;
    }

    export function _togglePixel(x: number, y: number): void {
        if (led && typeof led.toggle === "function") led.toggle(x, y);
    }

    export function _setPixel(x: number, y: number, on: boolean): void {
        if (!led) return;
        if (on && typeof led.plot === "function") led.plot(x, y);
        else if (!on && typeof led.unplot === "function") led.unplot(x, y);
    }

    export function _setPixelBrightness(x: number, y: number, brightness: number): void {
        if (led && typeof led.plotBrightness === "function") led.plotBrightness(x, y, brightness);
    }
}
