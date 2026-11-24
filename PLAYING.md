# After School ’99: The Last Save

A Snake-style nostalgia adventure: 16 missions in three acts, a short story and an ending. Pip is a glowing ribbon that grows with every memory spark. Collect all sparks, then reach the floppy disk. Walls, Pip's own body, corrupt sectors, locked doors, dust bunnies, viruses, glitches, and the exit before all sparks are collected end the run.

## Enemies
- Dust bunnies (h, v): walk in a straight line and turn round at walls.
- Viruses (r): crawl along the walls, keeping a wall on their left.
- Glitches (g): every second move, step one square toward Pip's head. Pip's body blocks them.

## Run
Keep `index.html`, `style.css`, `css/`, `js/`, `sw.js`, `manifest.webmanifest` and `icon.svg` together. Serve the folder (for example `python3 -m http.server 8000`) and open `http://localhost:8000/`. Controls: arrow keys or WASD, swipe, or the on-screen pad. Progress is saved in the browser on this device.

## Tests
`node --test tests/missions.test.cjs` proves every mission can be won (a search for a winning route, replayed through the real rules) and checks how each enemy moves.

## Limits
Offline play and installing to a home screen haven't been tried on real devices. The manifest uses an SVG icon only; some browsers want PNG icons before offering install.
