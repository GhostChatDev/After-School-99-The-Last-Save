# DESIGN.md — After School ’99: The Last Save (Geometry Dash Neon Upgrade)

## 1. Reference Analysis & Visual Direction
From the attached Geometry Dash reference collage (`IMG_6629.png`):
- **Title / Menu Screen**: Deep cobalt/royal blue tiled grid background (`#003296` to `#00174d`) with glowing lime-green and golden-yellow bevelled 3D block typography (`#8aff1a`, `#ffd819`) and heavy black outlines. Central oversized green-and-gold **Play** button flanked by **Icon Kit** (character face/skin customizer) and **Settings** gear buttons.
- **Gameplay Stage**:
  - High-contrast neon grid floor and glowing white/cyan bordered dark cobalt walls (`#050a24` fill, `#00e5ff` / `#387aff` neon borders).
  - **Spikes & Hazards**: Sharp neon-outlined triangle spikes with pulsing dark cores, glowing portal rings (magenta `#ff3bf7` and cyan `#00f0ff`), and jump/boost rings.
  - **Player Icon (Snake Head & Body)**: Geometry Dash square icon with bold outer border, inner secondary color, and expressive **Snake Faces** (Classic Cube, Happy Grin, Determined Dash, Cyber Visor, Demon Horns, Ghost Wink) plus a glowing particle trail.
  - **Ghost Mascot Enemies**: Patrolling enemies (`h`, `v`) render as glowing Ghost Mascots (classic floating sheet-ghost silhouette with wavy bottom hem, glowing cyan/crimson eyes, mischievous grin, and aura glow) instead of plain circles.
- **Difficulty Faces**: Each of the 12 missions displays an iconic round Geometry Dash-style Difficulty Face SVG/canvas badge:
  - Missions 1–2: **Easy** (Blue smiling face `#25a8ff`)
  - Missions 3–5: **Normal** (Green happy face `#28e645`)
  - Missions 6–8: **Hard** (Orange determined face `#ff8c1a`)
  - Missions 9–10: **Harder / Insane** (Purple/Magenta fierce face `#b833ff`)
  - Missions 11–12: **Demon** (Crimson horned demon face `#ff2442`)
- **Geometry Dash Features Added**:
  1. **Top Progress Bar & Percentage**: Live glowing green progress bar (`0%` to `100%`) at the top of the stage based on collected memories and exit proximity, plus `ATTEMPT #` counter on the canvas and HUD.
  2. **Practice Mode (Green Diamond Checkpoints)**: Toggle between **Normal Mode** and **Practice Mode** (or drop/clear manual checkpoints). In Practice Mode, collecting a memory or pressing the Checkpoint button drops a glowing green diamond (`◆`); dying respawns Pip right at the last checkpoint instead of restarting the mission from scratch!
  3. **Icon Kit (Snake Faces & Neon Skins)**: Dedicated customizer modal to pick from 6 Geometry Dash Snake Faces and 6 Neon Color Palettes (saved in `localStorage`).
  4. **Separate Settings Screen**: Clean HUD during gameplay; tapping the **Settings (⚙)** button opens a dedicated Settings screen with Movement Mode (Step / Classic), Practice Mode toggle, Thumb Controller Layout (Split / Left / Right), Audio/Music & SFX toggle, Speed control, and Fullscreen toggle.
  5. **Full-Screen & Zero Zoom**: Locked `100dvh`/`100vw` full-screen arcade cabinet layout (`overflow: hidden`, `touch-action: none`, `user-scalable=no`, double-tap/gesture zoom blocked, plus Fullscreen API button).

## 2. Color Tokens (CSS Variables)
- `--bg-deep`: `#04081c`
- `--bg-grid`: `#0b1c56`
- `--surface`: `#0d1842`
- `--surface-elevated`: `#142664`
- `--border-neon`: `#00e5ff`
- `--border-gold`: `#ffd819`
- `--text`: `#ffffff`
- `--muted`: `#9cb8ff`
- `--accent-green`: `#76ff03`
- `--accent-gold`: `#ffd819`
- `--accent-cyan`: `#00f0ff`
- `--danger`: `#ff2a55`

## 3. Typography & Spacing Scale
- **Font Stack**: `"Trebuchet MS", "Arial Black", Impact, system-ui, sans-serif` for bold Geometry Dash headers with heavy drop-shadows; `"Courier New", monospace` for tabular counters (`ATTEMPT 1`, `100%`, `12/12`).
- **Spacing**: `4px`, `8px`, `12px`, `16px`, `24px`.
- **Corner Radii**: `10px` buttons, `14px` cards/panels.
