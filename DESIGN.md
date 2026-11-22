# After School '99: The Last Save - Design Spec

## Reference Photo Breakdown (Region by Region)
1. **Backdrop & Stage Grid**
   - Deep royal/cobalt blue tiled square grid background (`#00329b` to `#001754` gradient with `#0d47c4` architectural grid lines and dark vignette).
   - High-contrast neon cyan/blue glowing ground line and geometric block silhouettes along the floor.
2. **Header & 3D Blocky Logo**
   - Bold, extruded 3D blocky arcade typography: lime-green (`#7dff1e` to `#28c700`) and golden-yellow (`#ffe600` to `#ff9900`) bevelled letters with thick black (`#000000`) outlines and drop shadows, plus a golden-orange "TRY ME!" / "'99 EDITION" sub-badge.
3. **Central Play Cross Button & Secondary Actions**
   - Iconic central green-and-yellow geometric cross/plus button with a glowing yellow play triangle (`▶`) in the center, bevelled metallic/dark-blue frame, and tactile press animation.
   - Flanking round/square neon arcade buttons for Mission Picker (levels/create style icon) and Continue.
4. **Difficulty Faces Row & Mission Badges**
   - Five expressive round difficulty face orbs shown on the title screen and in the mission picker:
     - **Easy (Blue `#1e90ff`)**: wide happy grin.
     - **Normal (Green `#32e832`)**: confident smile.
     - **Hard (Orange `#ff8c1a`)**: determined brows.
     - **Harder/Insane (Indigo/Purple `#3f3fff`)**: fierce angled eyes.
     - **Demon (Crimson Red `#e6192e`)**: horns, jagged teeth, glowing eyes.
   - Progress bar (`100%` neon green bar) showing campaign completion.
5. **Canvas Gameplay Aesthetics (Cube, Spikes, Portals, Pads)**
   - **Player Head (Pip Cube)**: Neon yellow-gold square (`#ffd800`) with a dark inner border, two glowing cyan square eyes (`#00f6ff`), and a rectangular mouth, trailed by a vibrant rainbow/neon cyan-green geometric particle ribbon.
   - **Spikes (`x`)**: Sharp triangular neon spikes with dark fill, bright white/cyan glowing edges (`#ffffff` / `#00f6ff`), and pulsing base glow.
   - **Portals (`1`, `2`) & Jump Rings**: Tall elliptical segmented neon rings in electric magenta (`#ff2ae6`) and cyan (`#00f0ff`).
   - **Walls (`#`)**: Deep blue/indigo geometric blocks with bright cyan/white outer borders (`#00e5ff`) and inner bevels.

## Palette (CSS Variables in `index.html`)
- `--bg`: `#001f6b` (deep royal blue)
- `--panel`: `#051647` (dark navy panel)
- `--border`: `#00d9ff` (neon cyan border)
- `--text`: `#ffffff`
- `--muted`: `#9ec5ff`
- `--accent`: `#ffe600` (electric yellow)
- `--pip`: `#7dff1e` (neon lime green)
- `--danger`: `#ff2a55` (demon crimson)
- `--r`: `12px`

## Layout & Responsive Rules
- Single centred column (`main.shell`), vertically centred on all viewports (`390px`, `820px`, `1280px`), no horizontal overflow, non-zoomable (`touch-action: manipulation`).
- All interactive controls at least `44x44px` with visible `:focus-visible` outlines.
