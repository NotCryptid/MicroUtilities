// A minimal, purpose-built replacement for the "arcade-mini-menu" extension
// (github:riknoll/arcade-mini-menu by riknoll), ported in to shrink compiled
// size for the micro:bit target. That extension's MenuSprite is one big
// class supporting icons, multi-column grids, controller/d-pad navigation,
// scroll-tick text animation and disabled items; because it's all one class,
// pulling in any of it pulls in all of it, and none of that gets dropped by
// dead-code elimination. SimpleMenu below only implements the actual subset
// used by callers of this package: a single column of fixed-height text
// rows with two-color theming. Navigation, scrolling and hit-testing are
// expected to be driven entirely by the host app (e.g. by rebuilding the
// item array to change what's visible, and hit-testing clicks against the
// fixed row layout below), not by this class.
namespace SpriteKind {
    export const SimpleMenu = SpriteKind.create();
}

namespace microUtilities {
    // Rows are always exactly this tall, starting at this offset within the
    // sprite's local space. Callers that hit-test clicks against the list
    // (rather than going through selectedIndex) depend on this exact
    // layout, so it isn't configurable.
    const _MENU_ROW_HEIGHT = 12;
    const _MENU_ROW_START_Y = 0;

    /** A single row of text in a SimpleMenu list. */
    export interface MenuItem {
        text: string;
    }

    /** Creates a menu item with the given text. */
    export function createMenuItem(text: string): MenuItem {
        return { text };
    }

    /** Creates a scrollable list menu from an array of menu items. */
    export function createMenuFromArray(items: MenuItem[]): SimpleMenu {
        return new SimpleMenu(items);
    }

    /**
     * A single column of plain-text rows, fixed at 12px tall starting at
     * y=0, with no icons, no built-in scrolling, and no controller
     * navigation. Only the leading rows that fit within the sprite's
     * current height are drawn; the host is expected to swap in whichever
     * slice of items it wants visible and drive scrolling/selection itself.
     */
    export class SimpleMenu extends sprites.ExtendableSprite {
        items: MenuItem[];
        selectedIndex: number;

        private defaultForeground: number;
        private defaultBackground: number;
        private selectedForeground: number;
        private selectedBackground: number;

        // Marquee-scroll state for the currently selected row's text. Only
        // the selected row ever scrolls; unselected rows are simply
        // truncated to fit so their text never overflows the row.
        private scrollEnabled: boolean;
        private scrollDelay: number;
        private scrollSpeed: number;
        private scrollTrackedIndex: number;
        private scrollStartTime: number;

        constructor(items: MenuItem[]) {
            super(img`.`, SpriteKind.SimpleMenu);
            this.items = items || [];
            this.selectedIndex = -1;
            this.defaultForeground = 15;
            this.defaultBackground = 0;
            this.selectedForeground = 1;
            this.selectedBackground = 15;
            this.scrollEnabled = true;
            this.scrollDelay = 700;
            this.scrollSpeed = 20;
            this.scrollTrackedIndex = -1;
            this.scrollStartTime = 0;
        }

        /**
         * Controls whether the selected row's text scrolls when it doesn't
         * fit within the menu's width. delayMs is how long a row must stay
         * selected before it starts scrolling; speedPxPerSec is how fast it
         * scrolls once started.
         */
        setScroll(enabled: boolean, delayMs?: number, speedPxPerSec?: number) {
            this.scrollEnabled = enabled;
            if (delayMs !== undefined) this.scrollDelay = delayMs;
            if (speedPxPerSec !== undefined) this.scrollSpeed = speedPxPerSec;
        }

        draw(drawLeft: number, drawTop: number) {
            if (this.selectedIndex !== this.scrollTrackedIndex) {
                this.scrollTrackedIndex = this.selectedIndex;
                this.scrollStartTime = control.millis();
            }

            const visibleRows = Math.min(
                this.items.length,
                Math.max(0, ((this.height - _MENU_ROW_START_Y) / _MENU_ROW_HEIGHT) | 0)
            );

            for (let i = 0; i < visibleRows; i++) {
                const item = this.items[i];
                const rowTop = drawTop + _MENU_ROW_START_Y + i * _MENU_ROW_HEIGHT;
                const selected = i === this.selectedIndex;
                const background = selected ? this.selectedBackground : this.defaultBackground;
                const foreground = selected ? this.selectedForeground : this.defaultForeground;

                if (background) {
                    screen.fillRect(drawLeft, rowTop, this.width, _MENU_ROW_HEIGHT, background);
                }
                if (!foreground || !item.text) continue;

                const availableWidth = this.width - 4;
                const font = image.getFontForText(item.text);
                const textWidth = item.text.length * font.charWidth;

                if (selected && this.scrollEnabled && textWidth > availableWidth) {
                    const offset = this.scrollOffset(textWidth - availableWidth);
                    // Printed into a buffer sized to exactly the visible interior:
                    // glyph draws are bounds-checked against the buffer itself, so
                    // whatever falls outside [0, availableWidth) is simply never
                    // drawn, instead of relying on the scroll offset alone to keep
                    // the text from poking past the row's edge.
                    const clip = image.create(availableWidth, _MENU_ROW_HEIGHT);
                    clip.print(item.text, -offset, 2, foreground, font);
                    screen.drawTransparentImage(clip, drawLeft + 2, rowTop);
                } else {
                    const maxChars = Math.max(0, (availableWidth / font.charWidth) | 0);
                    const text = item.text.length > maxChars ? item.text.slice(0, maxChars) : item.text;
                    screen.print(text, drawLeft + 2, rowTop + 2, foreground);
                }
            }
        }

        /**
         * Ticks a bounce (there-and-back) scroll animation for the selected
         * row's text: paused, travel to fully reveal the overflowing end,
         * paused, travel back. Bouncing rather than wrapping means the
         * printed text never has to move past the row's own bounds, so it
         * stays naturally clipped without needing any off-row drawing.
         */
        private scrollOffset(overflow: number): number {
            const elapsed = control.millis() - this.scrollStartTime;
            const pause = this.scrollDelay;
            const travel = Math.max(1, (overflow * 1000) / this.scrollSpeed);
            const cycle = pause * 2 + travel * 2;
            const t = elapsed % cycle;

            if (t < pause) return 0;
            if (t < pause + travel) return (((t - pause) / travel) * overflow) | 0;
            if (t < pause * 2 + travel) return overflow;
            return (overflow - ((t - pause * 2 - travel) / travel) * overflow) | 0;
        }

        /** Sets the default (unselected) and selected foreground/background colors. */
        setColors(defaultForeground: number, defaultBackground: number, selectedForeground: number, selectedBackground: number) {
            this.defaultForeground = defaultForeground;
            this.defaultBackground = defaultBackground;
            this.selectedForeground = selectedForeground;
            this.selectedBackground = selectedBackground;
        }

        /** Alias for destroy(). */
        close() {
            this.destroy();
        }
    }
}
