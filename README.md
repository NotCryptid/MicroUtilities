# MicroUtilities
A set of useful tools for MakeCode Arcade

## Implemented features
- Obtaining storage capacity
- Obtaining taken up storage
- Obtaining CPU clock speed
- Obtaining RAM amount
- Obtaining RAM usage
- Writing to the micro:bit LED matrix
- Detecting if device is a micro:bit
- Obtaining the device's serial number
- Unrestricted radio string length (send/receive strings of any length, not just a single packet's worth)
- `SimpleMenu`: a lightweight scrollable text-list menu sprite
- Rotating sprites in 90 degree intervals

## Planned features
- Reading and writing to the usb port

## API

### Device info

```ts
microUtilities.storageCapacity(StorageUnit.Megabytes)   // total non-volatile storage
microUtilities.storageUsage(StorageUnit.Megabytes)       // used non-volatile storage
microUtilities.ramCapacity(StorageUnit.Kilobytes)        // total RAM
microUtilities.ramUsage(StorageUnit.Kilobytes)           // used RAM
microUtilities.cpuSpeed()                                // CPU speed, in MHz
microUtilities.isMicrobit()                              // true if running on a BBC micro:bit
microUtilities.serialNumber()                            // device's hardware serial number, as an 8-char hex string
```

`StorageUnit` is `Bytes`, `Kilobytes`, or `Megabytes` — pass whichever you want the result converted to.

### micro:bit LED matrix

These only have an effect on an actual micro:bit; check `isMicrobit()` first if you need to know.

```ts
microUtilities.togglePixel(x, y)                  // flip a pixel (0-4, 0-4) on/off
microUtilities.setPixel(x, y, on)                 // set a pixel on/off
microUtilities.setPixelBrightness(x, y, 0-255)    // set a pixel's brightness
```

### Unrestricted radio strings

`radio.sendString` silently truncates anything longer than one packet's payload (19 bytes). These functions split longer strings across as many packets as needed and reassemble them on the other end.

```ts
microUtilities.sendUnrestrictedString("a very long string")

microUtilities.onUnrestrictedStringReceived(function (value) {
    // value is the full reassembled string
})

microUtilities.onUnrestrictedStringLost(function (receivedChunks, totalChunks) {
    // fires if a message stops arriving mid-transfer (4s with no new chunk);
    // there's no automatic retry, so it's up to you to ask the sender to resend
})
```

Don't mix these with the stock `radio.sendString`/`onReceivedString` (or the other `radio.send*`/`onReceived*` pairs) in the same project — both read from the same underlying packet queue, so whichever handler runs first can steal packets meant for the other.

### SimpleMenu

A lightweight scrollable text-list menu sprite: a single column of fixed-height (12px) rows, each either selected or not, with separate colors for each state. It draws itself but does **not** handle input — your code is responsible for moving the selection and reacting to clicks/buttons.

```ts
const items = [
    microUtilities.createMenuItem("New Game"),
    microUtilities.createMenuItem("Options"),
    microUtilities.createMenuItem("Quit"),
];
const menu = microUtilities.createMenuFromArray(items);
menu.setPosition(80, 60);
menu.setDimensions(80, 60);  // rows below this height just aren't drawn
menu.selectedIndex = 0;      // -1 (the default) means nothing is highlighted
```

- `menu.items` — the array of `{ text }` items being shown. Swap in a different array (or mutate this one) and the menu redraws from it next frame.
- `menu.selectedIndex` — index of the highlighted row, or `-1` for no selection. Plain public field; set it directly to move the selection.
- `menu.setColors(defaultForeground, defaultBackground, selectedForeground, selectedBackground)` — colors for unselected vs. selected rows. Pass `0` for a background to leave it transparent instead of filled.
- `menu.setScroll(enabled, delayMs?, speedPxPerSec?)` — controls the marquee scroll for the selected row's text when it's too long to fit. `delayMs` (default 700) is how long a row must stay selected/paused-at-an-end before it scrolls; `speedPxPerSec` (default 20) is how fast. Pass `enabled: false` to disable scrolling entirely — overflowing text is truncated instead, same as any unselected row.
- `menu.close()` — destroys the sprite (alias for `.destroy()`).

Text that doesn't fit a row is truncated when unselected (or when scrolling is disabled); the selected row scrolls back and forth to reveal the rest instead, if scrolling is enabled.

### Sprite rotation

Rotates a sprite's image in-place, snapped to the nearest 90-degree step. Non-square sprites change width/height (and hitbox) accordingly, since the underlying image itself is rotated.

```ts
microUtilities.setSpriteRotation(mySprite, 90)   // 0, 90, 180, or 270
microUtilities.getSpriteRotation(mySprite)       // last rotation set; 0 if never set
```

## Credits

`SimpleMenu` is a small, purpose-built reimplementation of the list-menu
functionality from [arcade-mini-menu](https://github.com/riknoll/arcade-mini-menu)
by [riknoll](https://github.com/riknoll), rewritten here to include only the
subset of features needed by this project's consumers and to avoid pulling
in the original's full feature set (icons, grids, controller navigation,
scroll animation) which can't be tree-shaken out of a single class. All
credit for the original design goes to riknoll.

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/notcryptid/microutilities** and import

#### Metadata

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
