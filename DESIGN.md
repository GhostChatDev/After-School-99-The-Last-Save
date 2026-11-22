# After School '99: The Last Save - Design

## Palette (CSS variables in index.html)
- background `#11172c`, panel `#1b2442`, border `#3a4a86`
- text `#f2f0e6`, muted `#b4bad4`
- accent `#ffd84a`, pip/success `#4dffb5`, danger `#ff6b81`
- radius `10px`

## Type
- `Trebuchet MS`, Verdana, sans-serif; 16px body.

## Layout
- One centred column (`main`), vertically centred on short screens (`justify-content: safe center`).
- Full-screen, non-zoomable: viewport `maximum-scale=1, user-scalable=no`; pinch, double-tap and gesture events are blocked.
- Canvas board scales to the screen; thumb pads below it (Split / Left / Right).
- Checked at 390, 820 and 1280 px wide.

## Neon arcade look (canvas)
- Dark checker floor with a faint neon grid dot per cell.
- Hazards drawn as glowing red ghosts/spikes with a pulsing fill.
- Keys, doors and exit use gold and mint glows; the exit opens when all pips are collected.
- Snake head shows a small face that looks in the move direction; faces get tougher with mission number (missions 1-4, 5-8, 9+).

## Components
- Title screen with Start / Continue.
- Mission picker: finished and current missions open; later ones are labelled Locked.
- Pause, Controls switch, Sound mute, Mode (Step / Classic).
- Mission complete card and credits.

## Saving
- Progress and options in localStorage (`after-school-99-last-save-v1`).
- Offline cache in `sw.js`; raise its version when files change.
