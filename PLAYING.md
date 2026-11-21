# After School ’99: The Last Save — opening milestone

This is a playable opening mission, not the requested complete 24-mission campaign. Collect the three numbered packets in order, then reach the glowing door. The rest of the story, abilities, missions and full ending still need to be built.

## Run locally

Put `index.html`, `manifest.webmanifest`, `icon.svg`, and `sw.js` together in one folder. Run `python3 -m http.server 8000` in that folder, then open `http://localhost:8000/`. Arrow keys or WASD and the on-screen arrows turn Pip; Space or Pause pauses. Collisions restart the mission without a lives limit. Mission completion is saved in local storage on the current browser and device.

## Installation and offline play

The manifest and service worker are intended to allow installation in supporting browsers and cache the opening for offline use after the first successful online visit. Service workers require HTTPS or localhost. Installation support varies by browser; on iOS use Safari’s Share menu and Add to Home Screen if available. Test installation and offline play on the devices you intend to support: neither has been verified here.

## Known limitations

Only the first mission is included. Movement uses a fixed update step but does not interpolate visually. The campaign, additional abilities, accessibility settings, audio, journal, smooth movement, comprehensive tests and four-hour playtime target are not complete. No accounts, paid services, or external assets are needed.
