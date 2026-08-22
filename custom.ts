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
//% shim=microUtilities::_boardRevision
function _boardRevision(): string {
    return "";
}
//% shim=microUtilities::_boardRevisionDebug
function _boardRevisionDebug(): Buffer {
    return Buffer.create(0);
}
//% shim=microUtilities::_isSerialSupported
function _isSerialSupported(): boolean {
    return false;
}
//% shim=microUtilities::_serialBackend
function _serialBackend(): number {
    return 0;
}
//% shim=microUtilities::_serialWriteBuffer
function _serialWriteBuffer(buffer: Buffer): void {
}
//% shim=microUtilities::_serialAvailable
function _serialAvailable(): number {
    return 0;
}
//% shim=microUtilities::_serialReadBuffer
function _serialReadBuffer(): Buffer {
    return Buffer.create(0);
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

    /**
     * The micro:bit board hardware revision, like "2.0" or "2.2" -- empty
     * string on non-micro:bit hardware, or if the revision can't be read.
     * V2.2 and V2.21 boards both report "2.2": the interface chip's board ID
     * didn't change between those two revisions, so they can't be told apart
     * from software.
     */
    //% blockId=microUtilities_boardRevision block="board revision"
    export function boardRevision(): string {
        return _boardRevision();
    }

    /**
     * TEMPORARY diagnostic -- hex dump of the raw state from the last
     * boardRevision() I2C query (Arcade-on-micro:bit builds only): write
     * status, whether/when the IRQ line was seen asserted, read status, and
     * the full raw 12-byte response. Remove once boardRevision() is
     * confirmed reading V2.0/V2.2 correctly.
     */
    //% blockId=microUtilities_boardRevisionDebug block="board revision debug"
    export function boardRevisionDebug(): string {
        return _boardRevisionDebug().toHex();
    }

    /**
     * True if this device supports reading and writing over USB serial.
     * Currently only the BBC micro:bit (including a micro:bit running
     * Arcade, e.g. on a Newbit shield) supports this; other Arcade hardware
     * ignores the serial functions below.
     */
    //% blockId=microUtilities_isSerialSupported block="is serial supported"
    export function isSerialSupported(): boolean {
        return _isSerialSupported();
    }

    /**
     * Diagnostic: which USB-serial backend this build was actually compiled
     * with. isSerialSupported() alone can't distinguish "not supported" from
     * a genuine runtime problem in a supported backend -- this can.
     * 0 = no serial backend compiled in (isSerialSupported() will be false)
     * 1 = Arcade-on-micro:bit backend (hand-rolled NRF52Serial on UARTE0)
     * 2 = plain pxt-microbit target's uBit.serial
     */
    //% blockId=microUtilities_serialBackend block="serial backend"
    export function serialBackend(): number {
        return _serialBackend();
    }

    /**
     * Write a string over USB serial. Has no effect if isSerialSupported()
     * is false.
     */
    //% blockId=microUtilities_writeSerialString block="write serial string %text"
    export function writeSerialString(text: string): void {
        if (!text) return;
        _serialWriteBuffer(control.createBufferFromUTF8(text));
    }

    /**
     * Write a buffer over USB serial. Has no effect if isSerialSupported()
     * is false.
     */
    //% blockId=microUtilities_writeSerialBuffer block="write serial buffer %buffer"
    export function writeSerialBuffer(buffer: Buffer): void {
        _serialWriteBuffer(buffer);
    }

    /**
     * Number of bytes currently waiting in the USB serial receive buffer.
     */
    //% blockId=microUtilities_serialBytesAvailable block="serial bytes available"
    export function serialBytesAvailable(): number {
        return _serialAvailable();
    }

    /**
     * Reads whatever data is currently waiting in the USB serial receive
     * buffer, as a string. Returns immediately -- if nothing has arrived
     * yet, this returns an empty string rather than waiting for data.
     */
    //% blockId=microUtilities_readSerialString block="read serial string"
    export function readSerialString(): string {
        return _serialReadBuffer().toString();
    }

    /**
     * Reads whatever data is currently waiting in the USB serial receive
     * buffer, as a buffer. Returns immediately -- if nothing has arrived
     * yet, this returns an empty buffer rather than waiting for data.
     */
    //% blockId=microUtilities_readSerialBuffer block="read serial buffer"
    export function readSerialBuffer(): Buffer {
        return _serialReadBuffer();
    }

    /**
     * The device's unique hardware serial number, as an 8-character hex string.
     */
    //% blockId=microUtilities_serialNumber block="serial number"
    export function serialNumber(): string {
        const buf = Buffer.create(4);
        buf.setNumber(NumberFormat.UInt32BE, 0, control.deviceSerialNumber());
        return buf.toHex().toUpperCase();
    }

    /**
     * Rotate a sprite's image, snapped to the nearest 90-degree step.
     */
    //% blockId=microUtilities_setSpriteRotation block="set %sprite rotation to %rotation"
    //% rotation.min=0 rotation.max=270
    export function setSpriteRotation(sprite: Sprite, rotation: number): void {
        rotation = (Math.round(rotation / 90) * 90 % 360 + 360) % 360;
        const steps = (rotation - getSpriteRotation(sprite) + 360) % 360 / 90;
        let img = sprite.image;
        for (let i = 0; i < steps; i++) {
            const rotated = image.create(img.height, img.width);
            for (let x = 0; x < img.width; x++)
                for (let y = 0; y < img.height; y++)
                    rotated.setPixel(img.height - 1 - y, x, img.getPixel(x, y));
            img = rotated;
        }
        sprite.setImage(img);
        sprite.data["microUtilitiesRotation"] = rotation;
    }

    /**
     * A sprite's current rotation (0, 90, 180, or 270), as last set by setSpriteRotation.
     */
    //% blockId=microUtilities_getSpriteRotation block="%sprite rotation"
    export function getSpriteRotation(sprite: Sprite): number {
        const r = sprite.data["microUtilitiesRotation"];
        return r === undefined ? 0 : r;
    }
}