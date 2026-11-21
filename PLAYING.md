# After School ’99: The Last Save — playable milestone

This milestone contains six short grid puzzles and a small ending. It is not the complete planned 24-mission campaign: abilities, hazards, the rest of the story, audio, accessibility settings, and the intended four-hour experience are not included. The Dust Guardian is currently a static obstacle puzzle, not the planned boss encounter. Old saves from the three-mission milestone are preserved, including the original final mission.

## Run

Keep `index.html`, `sw.js`, `manifest.webmanifest`, and `icon.svg` together. In that folder run `python3 -m http.server 8000` and visit `http://localhost:8000/`. Press Start, then use the arrow keys, WASD, or the on-screen arrows to move one tile per press. Find the numbered memories in order and reach the door. Restart returns to the beginning of the current mission. Your current mission, position, collected memories, and completion are stored in the browser on this device; clearing site data removes them.

## Installation and offline use

The service worker caches the game on a successful visit over HTTPS or localhost. Installation support depends on the browser; in Safari on iOS, use Share and Add to Home Screen where available. Installation and offline behavior have not been verified on actual devices.
