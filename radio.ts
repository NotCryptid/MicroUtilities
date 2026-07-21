// Sends strings of any length over radio by splitting them across as many
// raw radio packets as needed and reassembling them on the receiving end.
// The stock "radio" extension's radio.sendString silently truncates
// anything longer than a single packet's payload (19 bytes, per its own
// MAX_PAYLOAD_LENGTH - 1) because it packs the whole string into one
// packet; these functions remove that limit.
//
// This talks to the radio hardware through radio.sendRawPacket/
// readRawPacket/onDataReceived -- the same "internal use only" primitives
// the "radio" package's own sendString/onReceivedString/etc are built on.
// Don't mix this API with radio.sendString/sendNumber/sendValue/sendBuffer
// or radio.onReceivedString/Number/Value/Buffer in the same project: both
// sides pop packets off the same native queue when a radio event fires, so
// whichever handler happens to run first can drain packets meant for the
// other one.
namespace microUtilities {
    // Keep in sync with the "radio" package's own RADIO_MAX_PACKET_SIZE --
    // this is the hard cap codal's radio driver accepts per packet.
    const _RADIO_MAX_PACKET_SIZE = 32;
    // Chunk header layout: [0] marker (keeps our packets from being
    // misread as one of the stock package's packet types, which use 0-5)
    // [1] message id [2] chunk index [3] chunk count [4] chunk length
    const _CHUNK_HEADER_SIZE = 5;
    const _CHUNK_MARKER = 0xF0;
    const _CHUNK_PAYLOAD_SIZE = _RADIO_MAX_PACKET_SIZE - _CHUNK_HEADER_SIZE;
    // Chunk index/count are single bytes, so a message can span at most
    // this many chunks (~6.8KB at 27 bytes/chunk) -- longer strings are
    // truncated to fit.
    const _MAX_CHUNKS = 255;
    // Drop reassembly state for a message if a chunk hasn't shown up in
    // this long, in case a sender goes away mid-message.
    const _REASSEMBLY_TIMEOUT_MS = 4000;

    class _PendingMessage {
        chunks: Buffer[] = [];
        received = 0;
        lastSeen = 0;
        constructor(public total: number) { }
    }

    let _nextMessageId = 0;
    let _pending: _PendingMessage[] = [];
    let _onUnrestrictedStringReceived: (value: string) => void;
    let _rawReceiveInitialized = false;

    function _initRawReceive() {
        if (_rawReceiveInitialized) return;
        _rawReceiveInitialized = true;
        radio.onDataReceived(_handleRawPacket);
    }

    function _handleRawPacket() {
        const now = control.millis();
        let buf = radio.readRawPacket();
        while (buf) {
            if (buf.length >= _CHUNK_HEADER_SIZE && buf[0] === _CHUNK_MARKER) {
                const messageId = buf[1];
                const index = buf[2];
                const total = buf[3];
                const len = buf[4];
                const chunk = buf.slice(_CHUNK_HEADER_SIZE, len);

                let pending = _pending[messageId];
                if (!pending || pending.total !== total) {
                    pending = new _PendingMessage(total);
                    _pending[messageId] = pending;
                }
                if (!pending.chunks[index]) {
                    pending.chunks[index] = chunk;
                    pending.received++;
                }
                pending.lastSeen = now;

                if (pending.received >= pending.total) {
                    _pending[messageId] = undefined;
                    if (_onUnrestrictedStringReceived) {
                        _onUnrestrictedStringReceived(Buffer.concat(pending.chunks).toString());
                    }
                }
            }
            buf = radio.readRawPacket();
        }

        for (let id = 0; id < _pending.length; id++) {
            const pending = _pending[id];
            if (pending && now - pending.lastSeen > _REASSEMBLY_TIMEOUT_MS) {
                _pending[id] = undefined;
            }
        }
    }

    /**
     * Sends a string of any length over radio, split across as many
     * packets as it takes. Unlike radio.sendString, it isn't limited to a
     * single packet's worth of bytes.
     */
    //% blockId=microUtilities_sendUnrestrictedString block="radio send unrestricted string %value"
    export function sendUnrestrictedString(value: string): void {
        const chunks = Buffer.chunkedFromUTF8(value, _CHUNK_PAYLOAD_SIZE);
        const total = Math.min(Math.max(chunks.length, 1), _MAX_CHUNKS);
        const messageId = _nextMessageId = (_nextMessageId + 1) % 256;

        for (let i = 0; i < total; i++) {
            const chunk = chunks[i] || Buffer.create(0);
            // sendRawPacket always drops the last 4 bytes of whatever
            // buffer it's given (it expects RSSI padding there), so pad
            // our real payload out by 4 bytes or its tail gets cut off.
            const packet = Buffer.create(_CHUNK_HEADER_SIZE + chunk.length + 4);
            packet[0] = _CHUNK_MARKER;
            packet[1] = messageId;
            packet[2] = i;
            packet[3] = total;
            packet[4] = chunk.length;
            packet.write(_CHUNK_HEADER_SIZE, chunk);
            radio.sendRawPacket(packet);
        }
    }

    /**
     * Registers code to run when a string sent with sendUnrestrictedString
     * has been fully received.
     */
    //% blockId=microUtilities_onUnrestrictedStringReceived block="on radio unrestricted string received"
    //% draggableParameters=reporter
    export function onUnrestrictedStringReceived(cb: (value: string) => void): void {
        _initRawReceive();
        _onUnrestrictedStringReceived = cb;
    }
}
