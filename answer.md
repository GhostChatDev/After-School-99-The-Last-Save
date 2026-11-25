```text
PROJECT: AFTER SCHOOL ’99: THE LAST SAVE
Tagline: “Some things are worth saving twice.”

REPOSITORY
https://github.com/GhostChatDev/After-School-99-The-Last-Save

YOUR JOB
Build and test the actual game in this repository. Do not merely write a proposal, generate a mockup, or replace the README.

Evolve the existing project into a polished, original, story-driven snake adventure with approximately four hours of first-play campaign content and beautiful HD presentation inspired by 1990s computer games.

Read the current repository before changing anything. Inspect its README, PLAYING document, source files, tests, deployment configuration, and workflows. Treat existing story details as canon unless they directly conflict with these requirements. Do not assume the current code matches an earlier conversation.

Preserve working features and compatible saved progress where practical. Prefer extending good existing code over rewriting everything.

Use the repository’s existing stack unless there is a concrete technical reason to change it. Keep deployment compatible with its existing hosting, including GitHub Pages if configured.

This is a local single-player game. It does not need a backend, authentication, subscriptions, an AI API, or paid external services.

==================================================
1. THE EXPERIENCE
==================================================

Make this feel like discovering a lost premium PC game from 1999, lovingly remastered for modern screens.

The emotional ingredients:
- The school bell at the end of the day.
- A quiet bedroom and a warm CRT monitor.
- Computer labs, forgotten floppy disks, and shared keyboards.
- An arcade with one last credit.
- Rain on the bus ride home.
- Old drawings, saved messages, and the feeling of growing up.
- A satisfying ending about preserving what matters without refusing to move on.

This must remain a SNAKE GAME:
- A continuously moving head.
- A growing ribbon-like body.
- Direction planning.
- Spatial puzzles.
- Self-collision.
- Collecting memories.
- Navigating hazards and reaching exits.

Do not turn it into a generic platformer, an endless runner, or an unrelated collection of minigames.

Use “Pip” for the ribbon protagonist if the repository does not already establish another identity. Preserve June and other established characters where present. Explain their roles clearly through short scenes rather than assuming players know them.

The game must be enjoyable before it is difficult.

==================================================
2. GEOMETRY DASH INSPIRATION — ORIGINAL EXECUTION
==================================================

Borrow these design principles:
- Music gives challenges a readable cadence.
- Introduce a mechanic safely before testing it.
- Build from individual rules into satisfying combinations.
- Make failure understandable.
- Make retry fast.
- Use portals and environmental transitions to communicate rule changes.
- Offer practice and optional mastery challenges.
- Give each chapter a distinctive soundtrack and visual identity.

Do NOT copy:
- Geometry Dash levels or obstacle arrangements.
- Characters, icons, branding, UI, or names.
- Songs, sound recordings, sprites, or other copyrighted assets.

Do not implement literal versions of every Geometry Dash vehicle. Adapt only mechanics that remain coherent in a top-down snake game.

Important corrections:
- A four-hour campaign does not mean one continuous four-hour level.
- Do not pad playtime with waiting, excessive grinding, long unskippable scenes, or unfair restarts.
- Do not claim four hours has been verified without playtest evidence.

==================================================
3. ART DIRECTION: 90s NOSTALGIA, BUT HD
==================================================

This is a major requirement, not optional polish.

VISUAL TARGET
A premium 2D pixel-art adventure with the atmosphere of a late-1990s computer game, rendered cleanly on modern phones and large displays.

Not:
- A plain black board with colored squares.
- A generic neon dashboard.
- An emoji-based game.
- Blurry pixel art.
- An oversized fake computer window swallowing the playfield.
- A low-effort CRT filter over placeholder graphics.

Use:
- Authored-looking pixel environments.
- Distinct material textures.
- Layered backgrounds.
- Small environmental animations.
- Restrained atmospheric lighting.
- Attractive, readable typography.
- Crisp sprites.
- A clean, modern layout beneath the nostalgic styling.

ENVIRONMENT DETAILS
Bedroom:
Warm desk lamp, beige computer, curled cable, floppy disks, stickers, posters, carpet, evening window.

Computer lab:
CRT rows, checkerboard floor, abandoned chairs, cables, green monitor glow, dust in light beams.

Arcade:
Cabinet silhouettes, patterned carpet, token tray, colorful screen reflections, shuttered snack counter.

Rainy way home:
Bus shelter, wet pavement, streetlights, school fence, puddles, distant houses, porch lights.

Memory archive:
Notebook margins, paper scraps, folder shelves, old drawing motifs, floating file windows integrated into the world.

Final shutdown:
A quiet, fading computer world that gradually resolves into warm morning light.

Keep gameplay silhouettes readable against every background. Decorations must never resemble solid obstacles unless they are actually solid.

PIP
Design a recognizable ribbon/snake character:
- A distinct head with a readable facing direction.
- A segmented body with subtle texture.
- Clear growth feedback.
- Different visual states for abilities.
- Tasteful movement and collection animation.

Use shape and animation as well as color to communicate states.

HD RENDERING
Use a consistent logical pixel-art resolution or tile grid and document the choice.

A suitable baseline is a 480×270 logical scene, adapted to room composition and device orientation rather than stretched.

- Preserve aspect ratio.
- Prefer integer pixel-art scaling where practical.
- Disable canvas image smoothing for pixel-art layers.
- Use pixel-preserving CSS where appropriate.
- Handle devicePixelRatio deliberately.
- Keep text and controls sharp at native display resolution.
- Use a separate lighting/effects layer if helpful.
- Do not apply blur to the gameplay sprite layer.
- Avoid excessive full-resolution buffers on phones.
- Resize without resetting the simulation.

Allow responsive framing, room layouts, or a carefully bounded camera when needed. Never shrink a huge board until it is unreadable on a phone. Never hide an immediately relevant hazard outside the camera without warning.

CRT effects:
- Optional.
- Subtle.
- Off by default on performance-limited devices.
- No mandatory flicker or aggressive screen distortion.
- Separate controls for scanlines, bloom, shake, and reduced motion.

Create original bundled assets. Small sprite sheets or deliberately designed procedural art are acceptable; generic rectangles everywhere are not. The game must run without remote asset dependencies.

==================================================
4. CORE SIMULATION AND CONTROLS
==================================================

Separate deterministic game logic from rendering, sound, and storage.

Movement:
- Fixed simulation timestep, independent of rendering frame rate.
- No immediate 180-degree reversal.
- Small, bounded input queue.
- At most one legal turn consumed per movement step.
- Consistent behavior across keyboard and touch.
- Prevent stuck inputs after pause, blur, or pointer cancellation.

Collision:
- Moving into the cell the tail vacates is legal when the tail actually moves away that step.
- It is illegal if growth prevents that cell from being vacated.
- Define and test hazard, pickup, portal, and exit evaluation order.
- No accidental clipping or ambiguous body positions.

Controls:
Desktop:
- Arrow keys and WASD to steer.
- Space for Brake.
- E or another clearly documented key for the equipped ability.
- Escape to pause.
- R to retry, with protection against accidental destructive restarts.

Mobile:
- Large directional controls.
- Separate Brake and ability buttons.
- Optional swipe steering.
- At least 44 CSS pixel touch targets.
- Safe-area support.
- No page scrolling while interacting with gameplay controls.
- Touch listeners must not disable normal interaction throughout unrelated menus.

Support portrait and landscape without requiring device rotation.

Pause when the page becomes hidden. Resume deliberately rather than surprising the player with immediate movement.

==================================================
5. ABILITIES AND SPECIAL TILES
==================================================

Implement these four core abilities completely. Teach them through gameplay.

BRAKE
- Hold to slow movement, never to stop time entirely.
- Use a visible rechargeable meter.
- Provide explicit recharge rules.
- Make timing and hazard behavior consistent and testable.
- Meter depletion must not produce an unexpected instant collision.

ECHO
- Replays a bounded recent sequence of the player’s logical grid movements.
- Does not physically collide with Pip.
- Can activate clearly marked Echo switches.
- Show the preview/path and remaining duration.
- Define whether it interacts with portals; keep that rule consistent.
- Prevent permanent puzzle softlocks.

PHASE
- Passes through explicitly marked phase gates only.
- Does not allow travel through normal walls or the snake’s body.
- Show availability and activation clearly.
- Never let the effect expire with Pip trapped inside a gate.
- Restore its full state correctly at checkpoints.

ANCHOR
- Places one marker on a valid designated pad.
- Can hold a marked switch.
- A new anchor releases the old one.
- Preview placement and allow safe recall.
- Puzzle layouts must provide recovery from mistakes.

ENVIRONMENTAL MECHANICS
Introduce progressively:
- Keys and doors.
- Optional shortening spools.
- Linked portals.
- One-way lanes.
- Rhythm-pulsing hazards.
- Telegraphing patrols.
- Marked speed changes.
- Conveyors/cable lanes.
- Hop pads across marked gaps.
- Clearly previewed mirror-view sections.
- Marked latch connections.

Keep these compatible with the same snake simulation.

For discontinuous head movement such as portals, hops, and latches:
- Specify entry, exit, body-following behavior, and collision rules.
- Validate the destination.
- Render disconnected body segments honestly rather than drawing a false solid line through walls.
- Do not introduce a mechanic until its edge cases have tests.

Mirror sections should transform the presentation without secretly reversing controls. If camera-relative controls are used, show the mapping and introduce it in a safe area.

Do not cram every mechanic into every mission. Four excellent core abilities are more important than many broken transformations.

==================================================
6. RHYTHM AND AUDIO
==================================================

Compose original looping music and sound effects, using bundled audio or a lightweight original Web Audio score.

Chapter moods:
1. Bedroom: warm, curious chiptune.
2. Computer lab: restrained electronic groove.
3. Arcade: energetic FM-inspired melody.
4. Rain: soft percussion and rainy ambience.
5. Archive: reflective, sparse melody.
6. Shutdown: recurring themes resolving into a hopeful ending.

Rhythm should make hazards easier to read, not require players to hear.

- Synchronize music and gameplay hazard scheduling through a coherent transport.
- Define beat-to-tick timing explicitly.
- Account for pause, resume, and audio suspension.
- Telegraph attacks visually.
- Never use imprecise independent timers for each hazard.
- Muting audio must not alter the simulation.
- The game must remain fully playable silently.
- Start audio only after a user gesture.
- Include separate music and effects volume controls.
- Persist audio settings.

Do not require perfect rhythm input on ordinary movement turns.

==================================================
7. CAMPAIGN: 24 MISSIONS, SIX CHAPTERS
==================================================

Target approximately 3.5–4.5 hours for a typical first-time player on Standard.

This is a target to measure and tune, not a guaranteed minimum for expert players.

Planning budget:
- About 192 minutes across first-clear mission attempts.
- About 24 minutes of additional retries and learning.
- About 24 minutes of story, exploration, and transitions.
- Approximately 240 minutes total.

Measure these categories without double-counting. Do not make players wait to satisfy the budget.

Use several authored rooms or challenge sections per mission where appropriate. These must not be 24 tiny single-screen maps with inflated playtime claims.

Each mission needs:
- A clear objective.
- A distinctive layout.
- A safe teaching opportunity where relevant.
- A meaningful main challenge.
- Fair checkpoints.
- A short narrative beat.
- Three optional star stickers.
- An authored ending/exit.

CHAPTER 1 — BEDROOM BOOT
1. Wake the Monitor
Teach steering, collection, body growth, and reaching an exit. Begin with a safe room and expand into a short journey.

2. Under the Desk
Cable corridors and intentional shortening. Unlock Brake.

3. Glow-in-the-Dark Stars
Activate terminals in a readable order while learning visual beat cues.

4. The Dust Guardian
First set-piece: a sweeping cleaning machine with safe pockets and clear warning signals.

CHAPTER 2 — COMPUTER LAB
5. Broken Arrow Key
One-way routes and recovery loops. A wrong route should initially cost distance rather than cause instant death.

6. Seat Beside Mine
Unlock Echo through a simple two-switch puzzle. Establish the emotional significance of the empty chair.

7. Shared Keyboard
Pip and Echo take complementary routes through connected rooms.

8. The Hall Monitor
Combine patrol beams, cover, and Echo switches in a multi-stage encounter.

CHAPTER 3 — ARCADE AFTER DARK
9. Insert Memory
Introduce conveyor/cable lanes between cabinets and optional risky sticker routes.

10. Behind the Cabinet
Unlock Phase and teach the difference between phase gates and ordinary walls.

11. One More Try
Rhythmic lane hazards, safe pockets, and short escalating sections.

12. High Score
Three authored arcade phases. The objective is to leave with a recovered memory, not grind an endless score.

CHAPTER 4 — RAINY WAY HOME
13. Last Bus
Escort a signal between stops. Introduce clearly marked slow, normal, and rush lanes.

14. Puddle Signals
Telegraphed electrical puddles and deterministic hop pads across marked gaps.

15. Porch Light
Unlock Anchor through a porch-light switch puzzle.

16. The Storm Router
Combine Anchor and Echo to restore a path home while avoiding storm pulses.

CHAPTER 5 — MEMORY ARCHIVE
17. Unfinished Drawings
Distinct paper-and-pencil rooms. Introduce safe, clearly communicated mirror-view presentation.

18. Things We Never Said
Route message scraps through shelves and marked latch connections.

19. Keep / Let Go
A reflective puzzle about choosing what to carry. Never touch or pretend to delete actual device files.

20. The Collector
A multi-stage encounter with a character hoarding duplicate memories. Combine route planning, shortening, Brake, and previously learned environmental rules.

CHAPTER 6 — FINAL SHUTDOWN
21. Safe Mode
A quieter confidence-building remix of earlier mechanics. This mission title is separate from the Practice Mode feature.

22. Carry the Light
Escort the final save through speed changes and phase gates. Failure returns to a sensible checkpoint.

23. The Door You Made
Four compact mastery rooms, one per core ability, followed by a fair combination challenge.

24. The Last Save
A three-stage finale against the Overwrite:
- A readable sweeping hazard phase.
- A route/mirror-view puzzle phase.
- A slower, emotionally focused final passage.

Finish with an in-fiction export/save sequence, a complete ending, credits, and postgame access.

The ending must not require optional collectibles.

OPTIONAL POSTGAME
Unlock a harder “Overwrite” remix after collecting 30 stickers.

- Campaign has 72 optional stickers total.
- The hard remix uses learned rules, not random unavoidable hazards.
- No exclusive essential story ending behind this challenge.

==================================================
8. CHECKPOINTS, PRACTICE, AND FAIRNESS
==================================================

Standard:
- Authored checkpoints.
- Unlimited retries.
- Short failure feedback.
- Retry available immediately.
- No lives or energy system.
- No forced replay of completed dialogue.

Checkpoint snapshots must include all relevant state:
- Full body and facing.
- Movement queue policy.
- Pickups and doors.
- Ability resources.
- Echo and Anchor state.
- Hazard phase.
- Puzzle switches.
- Escort state.
- Camera/room context where necessary.

Practice Mode:
- Player-placeable checkpoints only at valid recoverable states.
- Clearly marked as practice.
- Separate completion and collectible records from Standard.
- Never overwrite Standard progress.

Assist options:
- Slower overall game speed.
- Longer hazard warnings.
- Reduced visual effects.
- Clear high-contrast hazard outlines.
- Optional path/turn preview if feasible.

Do not shame players for using assists.

Every timed hazard needs readable anticipation. No blind attacks from offscreen.

No irreversible mandatory-puzzle softlocks. Provide reset-to-checkpoint and, where appropriate, local puzzle reset.

==================================================
9. MENUS, SAVING, AND PRESENTATION
==================================================

Create finished versions of:
- Title screen.
- New game.
- Continue.
- Chapter/mission select.
- Pause.
- Settings.
- Controls/help.
- Memory journal.
- Mission completion.
- Credits.

Title screen concept:
An animated bedroom at dusk, a softly glowing CRT, drifting dust, and a clearly visible Start/Continue choice. The game world should be the visual focus, not a wall of buttons.

HUD:
- Mission title briefly on entry.
- Required objective progress.
- Three optional sticker slots.
- Ability availability.
- Subtle chapter/section progress where meaningful.

Do not crowd the playfield.

Saving:
- Versioned local save format.
- Validate and sanitize loaded data.
- Gracefully handle corrupted or unavailable storage.
- Preserve unlocked missions, collected stickers, journal entries, settings, and appropriate checkpoint progress.
- Keep practice separate.
- Explain whether an interrupted run resumes from the last durable checkpoint.
- Include confirmed reset-progress action.
- If practical, provide validated JSON save export/import.

No analytics or network telemetry are required. Keep playtime and attempt metrics locally unless the user explicitly chooses otherwise.

==================================================
10. RESPONSIVE WEB APP AND OFFLINE SUPPORT
==================================================

Support:
- Desktop keyboard play.
- Android browsers.
- iPhone browsers.
- Tablets.
- Portrait and landscape.

Include:
- Appropriate viewport configuration.
- Safe-area handling.
- Responsive menus.
- Accessible HTML controls around the 