# After School ’99: The Last Save

A Snake-style nostalgia adventure: 12 short missions and an ending. Pip is a glowing ribbon that grows with every memory spark. Collect all sparks, then reach the exit. Walls, Pip's own body, dust bunnies, locked doors and the exit before all sparks are collected end the run.

## Run

Keep `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg` and the `js/` folder together. Run `python3 -m http.server 8000` and open `http://localhost:8000/`. Controls: arrow keys or WASD, swipe, or the on-screen arrows. On the title screen, arrows move the highlight and A (or Enter) activates the highlighted item. `?` opens How to Play; Escape or `M` opens the menu; the `☰` button opens the menu on every screen. Progress is saved in the browser on this device.

## Tests

`node --test tests/missions.test.cjs` searches for a winning route in every mission and replays it through the real rules.

## Limits

Installation, offline play, saving after refresh and touch controls have not been verified on real devices. The manifest uses an SVG icon only; some browsers want PNG icons before offering install. This is a short campaign, not a long game.
