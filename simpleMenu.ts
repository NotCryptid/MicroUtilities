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

        constructor(items: MenuItem[]) {
            super(img`.`, SpriteKind.SimpleMenu);
            this.items = items || [];
            this.selectedIndex = -1;
            this.defaultForeground = 15;
            this.defaultBackground = 0;
            this.selectedForeground = 1;
            this.selectedBackground = 15;
        }

        draw(drawLeft: number, drawTop: number) {
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
                if (foreground && item.text) {
                    screen.print(item.text, drawLeft + 2, rowTop + 2, foreground);
                }
            }
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
