# After School ’99: The Last Save

> Some things are worth saving twice.

## Current milestone

This is a first playable mission, **Wake the Monitor**, not the complete 24-mission campaign described in README.md. It uses plain JavaScript and Canvas rather than the planned Phaser/TypeScript stack. The remaining chapters, full story and ending, sound, additional puzzles and hazards, accessibility options, and campaign-length playtesting have not been implemented.

## Play

Start the adventure, then move Pip with the arrow keys, WASD, or the on-screen direction pad. Each press moves one square. Collect the three numbered packets in order, then enter the door. A collision returns Pip to the starting position while keeping collected packets. Pause or restart using the buttons.

Progress is stored in this browser on this device. Clearing site data removes it; private browsing and storage restrictions may prevent saving.

## Run and install

Serve this folder with a local web server rather than opening the file directly. For example, with Python 3 installed, run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000/`. On other devices, deploy the folder to an HTTPS static host. Use the browser's install or Add to Home Screen menu where supported; availability varies by browser and device.

After the site has loaded and the service worker has installed successfully, the included files are cached for offline visits. The first visit requires a connection. Updates to cached assets require a new service-worker cache version.

## Verification and remaining work

The first mission was checked with the automated browser check before installation assets were added. Offline launch, actual installation, gameplay completion, and device-specific controls require further testing. Complete the full campaign and run gameplay, accessibility, persistence, offline, and real-device playtests before presenting this as a finished game.
