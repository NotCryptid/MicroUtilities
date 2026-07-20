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

These run as native code, so they only report real values on actual hardware
(micro:bit or other Arcade boards) — the browser simulator has no native
implementation to fall back to.

## Planned features
- Rotating sprites in 90 degree intervals
- Obtaining the micro:bit's serial number
- Reading and writing to the usb port
- Unrestricted bitradio usage

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/notcryptid/microutilities** and import

#### Metadata

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
