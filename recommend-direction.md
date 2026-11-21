**Build an original Snake-inspired adventure—not just a prettier Snake clone.** Keep the satisfying 90s movement and arcade sounds, but add a story campaign, imaginative environments, boss encounters, smooth animation, and proper mobile controls.

My concept: **AFTER SCHOOL ’99: The Last Save** — a nostalgic adventure about recovering a lost childhood game before an old family computer shuts down forever.

Below are:

1. A **complete development prompt**, including the story and campaign.
2. A downloadable **`README.md` starter**.
3. A realistic build plan.

**Important:** Four hours means the intended **player’s campaign length**, not development time. A prompt can specify that target, but actual playtime needs playtesting.

## Recommended direction

Use **Phaser + TypeScript + Vite**, delivered as an installable web app. Phaser is designed for 2D games in desktop and mobile browsers, and its scaling tools support fitting the game into different screen sizes. [4][1]

Target Android, iPhone/iPad, tablets, and desktop browsers—not literally every device. Installation options vary by browser, and offline play requires the game’s assets to be cached first. [7][8]

---

# 1. Complete prompt to paste into Ghost Code

In **Ghost Code**, select your repository, then choose **+ → App type → Web app**. Paste this prompt:

```text
Build a complete, original, production-minded 2D browser game named:

AFTER SCHOOL ’99: THE LAST SAVE

Tagline:
“Some things are worth saving twice.”

Work as a game developer, gameplay designer, narrative designer, UI designer,
and QA engineer.

IMPLEMENT THE GAME. Do not stop at a design document, landing page,
animated mockup, or a single endless Snake arena.

Read the repository first. Preserve unrelated work. If this is an empty
repository, initialize the project.

Never claim something is implemented or tested unless it actually is.

==================================================
1. PRODUCT GOAL
==================================================

Create a nostalgic, premium-feeling, single-player Snake-inspired adventure
with a complete beginning, middle, and ending.

The intended audience is people who remember after-school computer games,
CRT monitors, computer labs, floppy disks, dial-up sounds, arcade cabinets,
video rental stores, and sharing a keyboard with a friend.

The presentation should feel like a carefully polished modern indie game
with a 1990s soul—not an old game with a neon filter.

Primary platform:
A responsive browser game, installable as a PWA where supported.

Target:
- Android Chrome and Samsung Internet.
- iOS/iPadOS Safari.
- Desktop Chrome, Edge, Firefox, and Safari.
- Touchscreen tablets and laptops.

Do not promise universal compatibility.
Document actual tested browsers and limitations.

Estimated first-play campaign:
Approximately 4 hours on Normal difficulty.

This is a design target, not a guaranteed duration.
Do not inflate playtime through forced waiting, repetitive grinding,
unskippable dialogue, or excessively punishing restarts.

No accounts, backend, ads, loot boxes, subscriptions, multiplayer,
runtime AI calls, API keys, or required external services.

The complete campaign must remain playable offline after a successful
initial download and an explicit “Offline ready” confirmation.

==================================================
2. TECHNOLOGY AND ARCHITECTURE
==================================================

Use:
- TypeScript with strict checking.
- Vite.
- A current stable Phaser release verified against its official docs.
- Vitest for pure game-logic tests.
- Playwright for browser integration tests.
- A production PWA setup with a real manifest and service worker.

Pin dependency versions and commit the lockfile.
Do not mix incompatible Phaser-version APIs.

Use Phaser for gameplay rendering.
Accessible HTML/CSS overlays are encouraged for menus, settings, dialogue,
save management, and touch controls.

Separate deterministic gameplay simulation from rendering and UI.
Keep levels and dialogue data-driven.
Avoid a giant monolithic game file.

Suggested structure, adjustable where justified:

src/
  main.ts
  game/
    scenes/
    simulation/
    systems/
    rendering/
    input/
    audio/
    save/
    ui/
  content/
    chapters/
    levels/
    dialogue/
    music/
  styles/
public/
  icons/
tests/
  unit/
  integration/
docs/
  STORY.md
  CAMPAIGN.md
  CONTROLS.md
  TESTING.md
  ASSET_LICENSES.md
README.md

The game must not depend on CDN-loaded scripts, remote fonts,
remote textures, or runtime network requests for normal gameplay.

Use original generated textures, small local sprite assets,
procedural visual effects, and locally bundled audio.

Generate original assets programmatically if external art is unavailable.
The shipped game must still look coherent and finished.

==================================================
3. VISUAL DIRECTION
==================================================

Art direction:
“A childhood computer remembers the world outside.”

Combine:
- Crisp pixel art.
- Warm CRT-inspired color.
- Soft, restrained glow.
- Smooth movement interpolation.
- Layered backgrounds.
- Small environmental animations.
- Strong visual hierarchy.
- Modern, readable interface typography.

Palette progression:
1. Bedroom: amber, warm cream, deep navy.
2. Computer lab: mint, blue, pale fluorescent white.
3. Arcade: violet, coral, electric cyan.
4. Rainy neighborhood: teal, indigo, warm window light.
5. Memory archive: faded peach, silver, washed-out blue.
6. Shutdown core: dark charcoal, warning red, returning golden light.

The player is a small luminous ribbon-like program named Pip.
Pip should look expressive through eye sprites, posture, and animation,
without making collision boundaries ambiguous.

Use:
- Direction-aware head animation.
- Distinct head and tail.
- Subtle collection particles.
- Brief optional impact shake.
- Clear hazard telegraphs.
- Satisfying exit-door activation.
- Short scene transitions.
- A polished title screen showing an old bedroom and a glowing monitor.

Do not obscure obstacles with bloom, scanlines, particles, or UI.
CRT effects, shake, flashes, and motion must be independently reducible.

Do not copy copyrighted game sprites, music, characters, maps, or branding.

==================================================
4. CORE GAMEPLAY
==================================================

Foundation:
Pip automatically moves on a grid.
The player steers at right angles, gathers numbered memory packets,
manages ribbon length, solves spatial challenges, and reaches an exit.

Use a fixed simulation timestep.
Render movement smoothly between logical cells.
Gameplay must not depend on rendering frame rate.

Input:
- Keyboard arrows and WASD.
- Touch D-pad.
- Optional swipe steering.
- Gamepad support as progressive enhancement.

Rules:
- Reject immediate 180-degree reversals.
- Use a small bounded direction queue.
- Validate queued turns against the last queued direction.
- Consume at most one turn per simulation tick.
- Prevent duplicate keyboard-repeat turns from filling the queue.
- Clear pending input when pausing, restarting, or changing scenes.
- Define and test whether entering a vacating tail cell is legal.
- Correctly account for growth when resolving that collision.
- Resolve each tick atomically.
- Never spawn items inside walls, hazards, or the player.
- Never place a required item in an unreachable region.
- Handle a board with no valid spawn locations explicitly.

Campaign missions use authored layouts and authored objective sequences.
Randomness may vary optional pickups or cosmetic details, but must not
make required paths impossible.

Numbered packets:
Collect packets 1 through 9 in the indicated order.
Show the next required number clearly.
Required packets are visually distinct from optional pickups.

Do not rely on collecting 1–9 as the only objective in every mission.

Mission types:
- Collection routes.
- Switch and gate puzzles.
- Escorting a short-lived friendly signal.
- Routing power between terminals.
- Surviving readable hazard patterns.
- Navigating one-way conveyor lanes.
- Timed sequences with generous checkpoints.
- Boss arenas based on spatial routing rather than shooting.

Length:
Normal memory packets grow Pip.
Clearly marked spool stations can shorten the tail to solve puzzles.
Never silently shorten the tail.

Failure:
No campaign-wide limited lives.
Failure returns to the current mission checkpoint.
Target a restart flow under two seconds after player confirmation.
Do not erase completed missions or collectibles on death.

Difficulty:
- Story: slower movement, more generous hazard windows,
  optional collision shield, no score penalties.
- Normal: intended campaign balance.
- Arcade: faster and stricter, unlocked immediately or after a clear warning.

Difficulty can be changed without deleting progress.
Do not shame players for using assists.

==================================================
5. ABILITIES AND PROGRESSION
==================================================

Unlock only a few abilities and make them matter.

Ability 1 — Brake
Unlocked in Chapter 1.
Hold to reduce movement speed for a limited rechargeable duration.
Show an obvious meter.
It cannot stop movement completely.

Ability 2 — Echo
Unlocked in Chapter 2.
Record a short route, then replay it as a non-colliding ghost ribbon.
The ghost can activate marked echo switches.
Define recording length, playback rules, and reset behavior clearly.

Ability 3 — Phase
Unlocked in Chapter 3.
Pass through one explicitly marked data gate when charged.
Never phase through ordinary walls or the body.
Charge is deterministic and shown in the HUD.

Ability 4 — Anchor
Unlocked in Chapter 4.
Activate marked anchor pads to preserve one switch state while moving away.
Only one anchor can be active.
Replacing it clearly releases the previous one.

Chapter 5 combines abilities.
Chapter 6 tests learned mechanics without introducing another ability.

Abilities must be useful on touchscreens without requiring three
simultaneous finger gestures.

No mandatory XP grinding.
No randomized upgrade tree.
Optional cassette collectibles unlock journal entries and cosmetic
ribbon colors only.

==================================================
6. COMPLETE STORY
==================================================

SETTING

The real-world framing takes place in the present.

Alex, now an adult, returns to the house where they grew up.
Their family is moving out. In a box under the old desk, Alex finds the
computer they shared with their older sister, June.

June is alive, but the siblings have drifted apart.
Avoid a surprise death or tragedy twist.

In 1999, they tried to create a small game together.
Alex drew the little ribbon creature.
June wrote the movement code.
They never finished the final level.

The computer still starts, but its storage is failing.
One folder is readable:

AFTER_SCHOOL / FINAL_FINAL / REALLY_FINAL

Alex opens it.

Inside the computer, Pip wakes to a warning:
“ARCHIVE FAILURE. FINAL SHUTDOWN PENDING.”

Pip believes saving every file will restore the world exactly as it was.

A maintenance program called Null is clearing corrupted sections.
Null initially appears to be the villain.

A helper program named Dot guides Pip.
Dot represents the ordinary warmth of childhood:
a cursor with personality, not a magical all-knowing narrator.

ACT I — THE ROOM THAT REMEMBERED

Pip wakes in a digital reconstruction of Alex and June’s bedroom.
The wallpaper is made of old desktop patterns.
Stars from the bedroom ceiling float behind the windows.

Dot explains that six archive sectors contain fragments of an unfinished
game. Reassembling the fragments may create a transferable save.

Pip finds an early drawing of itself with the note:
“Give him a friend so he doesn’t get lonely.”

Null seals the bedroom exit to contain corruption.
Pip interprets this as an attack.

At the chapter’s end, Pip restores a recording:

June: “It doesn’t have to be perfect.”
Alex: “It has to be finished.”
June: “Those aren’t the same thing.”

ACT II — THE SHARED KEYBOARD

The computer lab contains echoes of school afternoons.
Two glowing workstations sit next to each other.
One keyboard has a broken arrow key.

Pip learns Echo.
Two routes must cooperate to open doors.

The recovered memory reveals that June often stayed late to help Alex
finish projects, even when Alex thought June was embarrassed by them.

Null speaks directly:
“I cannot preserve a room that no longer exists.”

Dot dismisses this as a maintenance error, but becomes less certain.

ACT III — ONE MORE CREDIT

The arcade sector is bright, noisy, and unstable.
Its machines loop the same winning moments.
Scoreboards contain impossible numbers.

A local guardian, High Score, refuses to let anyone leave without
setting another record.

Pip learns Phase and defeats High Score by opening a path out,
not by earning infinite points.

The recovered memory shows Alex ignoring June’s request to go home
because Alex wants “one more try.”

The emotional idea:
A good moment does not become better by refusing to let it end.

ACT IV — RAIN ON THE WAY HOME

Pip enters a neighborhood reconstructed from bus windows,
rainy pavements, corner shops, and warm house lights.

Dot begins losing pieces of its dialogue.

Pip learns Anchor and keeps small islands of the archive stable while
guiding a message through the rain.

The recovered memory reveals the siblings’ argument.
June was leaving for college.
Alex accused her of abandoning their game.
June left a note in the unfinished project, but Alex never opened it.

Null protects Pip from a large corruption surge.

Null explains that shutdown is not punishment.
The damaged system cannot keep running indefinitely.

ACT V — THE THINGS WE KEPT

The archive contains unfinished drawings, discarded music,
abandoned levels, and small ordinary memories.

Pip discovers that reconstructing the entire old computer would consume
the remaining readable data and destroy the transferable save.

Dot admits:
“I was written to help you find things.
I wasn’t written to know when to stop looking.”

Pip and Dot assemble a compact archive containing the game,
its source, the important recordings, and June’s unread note.

June’s note:
“Sorry we didn’t finish it before I left.
I made you an exit door.
You can decide where it goes.
Call me when you get there.”

Pip realizes the goal is not to keep the past running forever.
The goal is to carry something meaningful forward.

ACT VI — THE LAST SAVE

Null escorts Pip toward the export port.
The failing system mistakes the moving archive for corruption.

The final opponent is THE OVERWRITE:
a malfunctioning cleanup process, not a secretly evil Null.

The last missions combine all learned mechanics:
slow precise movement, Echo switches, Phase gates, and Anchor routing.

Dot uses its remaining working memory to hold open the export route.
Do not force melodramatic prolonged dialogue during active hazards.

Dot’s final line before the export:
“Leave the door where you can find it.”

Pip routes the save through the exit June made years ago.
The old computer shuts down.

EPILOGUE

On Alex’s modern device, a recovered folder opens.
A tiny playable room appears.
Pip is waiting beside an unfinished exit.

Alex opens June’s note, smiles, and calls her.

Alex: “I found our game.”
June: “Does it still work?”
Alex: “Almost.”
June: “Then I guess we should finish it.”

After credits, the title screen changes.
The room is still nostalgic, but the desk now has a modern device beside
the old computer.

A cursor blinks.
Dot appears as a tiny recovered helper icon:

“NEW SAVE CREATED.”

One complete canonical ending.
Do not lock emotional resolution behind collectibles.

All story scenes must be written and shipped.
No lorem ipsum, “dialogue goes here,” or truncated ending.

Use short scenes, environmental storytelling, and optional journals.
Dialogue should feel warm and restrained rather than constantly sentimental.

Every cutscene:
- Supports tap/click/keyboard advance.
- Has a skip option.
- Can be reread from the journal.
- Cannot permanently block progression if skipped.
- Offers readable text sizing and reduced typewriter animation.

==================================================
7. CAMPAIGN: SIX CHAPTERS, 24 MISSIONS
==================================================

Create 24 distinct, complete, authored missions.

Each chapter contains four missions.
Mission four is a chapter finale or boss encounter.

CHAPTER 1 — BEDROOM BOOT
1. Wake the Monitor
   Safe movement tutorial; restore a terminal; introduce numbered packets.
2. Under the Desk
   Cable corridors, shortening stations, and the Brake tutorial.
3. Glow-in-the-Dark Stars
   Route power to three ceiling-star terminals.
4. The Dust Guardian
   A sweeping cleanup brush with clearly telegraphed lanes.
   Open the exit during safe intervals.

CHAPTER 2 — COMPUTER LAB
5. Broken Arrow Key
   Introduce one-way lanes and alternate routes.
6. Seat Beside Mine
   Teach Echo with a short, forgiving two-switch puzzle.
7. Shared Keyboard
   Multi-room cooperation between Pip and recorded Echo paths.
8. The Hall Monitor
   Patrol beams, cover zones, and Echo-operated gates.

CHAPTER 3 — ARCADE AFTER DARK
9. Insert Memory
   Distinct arcade lanes with risk/reward optional pickups.
10. Behind the Cabinet
    Teach Phase through marked data gates.
11. One More Try
    Rotating arena sectors with safe pauses between changes.
12. High Score
    Three-phase routing boss.
    Break the repeating score loop and open an escape route.

CHAPTER 4 — RAINY WAY HOME
13. Last Bus
    Escort a friendly signal between protected bus-stop nodes.
14. Puddle Signals
    Readable timed electrical hazards; no surprise damage.
15. Porch Light
    Teach Anchor while restoring safe neighborhood routes.
16. The Storm Router
    Combine Anchor and Echo to maintain power through a storm.

CHAPTER 5 — MEMORY ARCHIVE
17. Unfinished Drawings
    Traverse hand-drawn rooms with different route geometries.
18. Things We Never Said
    Route message fragments to the correct terminals.
19. Keep / Let Go
    Preserve essential archive nodes while optional scenery fades.
    Never delete the player's real save or use deceptive file deletion.
20. The Collector
    A guardian hoarding duplicate fragments.
    Open release valves with all previously learned tools.

CHAPTER 6 — FINAL SHUTDOWN
21. Safe Mode
    A quiet, precise reconstruction of earlier mechanics.
22. Carry the Light
    Escort the assembled save through failing sectors.
23. The Door You Made
    A multi-room final puzzle using Brake, Echo, Phase, and Anchor.
24. The Last Save
    Final three-phase Overwrite encounter, export, ending, and credits.

Distinct means:
Different geometry, objective structure, hazard sequencing, and story purpose.
Do not duplicate one map 24 times with new colors.

Every mission needs:
- Stable ID.
- Chapter association.
- Display name.
- Tile layout and objective data.
- Clear entry state.
- Valid player spawn.
- Required ability list.
- Checkpoints.
- Failure/restart behavior.
- Exit condition.
- Optional collectible placements.
- A tested completion route.
- Unique narrative content or environmental storytelling.
- Target duration metadata.

Bosses must be fair, readable, and achievable with the same controls
used elsewhere in the game.

==================================================
8. FOUR-HOUR PACING TARGET
==================================================

Initial design allocation:
- 24 missions averaging approximately 8 minutes: 192 minutes.
- Mandatory story and transitions: approximately 30 minutes total.
- Natural exploration and short hub interactions: approximately 18 minutes.
- Total target: approximately 240 minutes.

These are estimates to validate, not artificial timers.
Some missions should be shorter and some longer.

Record locally:
- Active mission time.
- Death count.
- Restarts.
- Assist usage.
- Completion state.

Pause timing while:
- App is hidden.
- Game is paused.
- Settings or menus are open.

Keep cutscene time separate from active mission time.

Do not send analytics to a server.

Provide a development report that exposes duration by mission.
Adjust geometry and objective depth based on human playtests.
Do not describe automated bot speedruns as representative human playtime.

Optional collectibles and Arcade mode are additional replay value,
not required padding for the main campaign estimate.

==================================================
9. MOBILE AND ACCESSIBILITY
==================================================

Portrait:
- HUD at top.
- Board centered.
- Controls below the board.
- Never let the D-pad hide a required route.

Landscape:
- Board centered with controls in side gutters where practical.

Support:
- Safe-area insets.
- Browser toolbar resizing.
- Orientation changes without losing progress.
- Multi-touch.
- pointercancel.
- Focus loss and visibility changes.
- Audio unlock after user interaction.

Touch controls:
- Minimum approximately 48 CSS pixel targets.
- Left-handed layout option.
- Adjustable opacity.
- D-pad or swipe selection.
- Clear pressed state.
- Prevent page scrolling only inside the active game/control surface.
- Do not disable zoom globally for menu text.

Accessibility:
- Remappable keyboard controls.
- Scalable dialogue and menu text.
- High-contrast option.
- Color plus shapes/patterns for important state.
- Reduced motion.
- Independent music and effects volume.
- Mono audio option.
- Optional haptics where supported.
- No audio-only puzzle clues.
- No rapid flashing effects.
- Story difficulty and optional collision shield.

Use semantic, keyboard-navigable menu controls.
Document any gameplay accessibility limitations honestly.

==================================================
10. SAVES AND RECOVERY
==================================================

Use IndexedDB for versioned local campaign saves.
Use localStorage only for small preferences if appropriate.

Save:
- Completed missions.
- Current mission checkpoint.
- Unlocked abilities.
- Collectibles.
- Journal entries.
- Difficulty and assists.
- Settings.
- Accumulated playtime.

Save after meaningful progression and checkpoints,
not on every rendered frame.

Implement:
- Schema validation.
- Save migrations.
- Previous valid save backup.
- Recovery after malformed data or interrupted writes.
- Readable warning when storage is unavailable.
- Explicit warning that private browsing or clearing site data may erase saves.
- Export save JSON.
- Import save JSON with size limits and strict schema validation.
- Confirmation before replacing existing progress.
- Confirmation before starting a new campaign.

Never insert imported strings as raw HTML.
Never trust imported level IDs, numbers, or arbitrary object fields.

No fake cloud-save claims.

==================================================
11. AUDIO
==================================================

Create original restrained chiptune-inspired audio.

Provide:
- Title theme.
- Distinct chapter themes or motifs.
- Boss variation.
- Ending theme.
- Collection, switch, gate, checkpoint, failure, and UI sounds.

Use Web Audio synthesis or bundled original audio.
Do not rely on external streaming.

Prevent:
- Audio starting before a user gesture.
- Multiple music tracks stacking after restarts.
- Leaking audio nodes.
- Music continuing unexpectedly while the game is suspended.

The game must remain fully playable muted.

==================================================
12. PWA AND PERFORMANCE
==================================================

Ship:
- Valid web app manifest.
- Correct local icons.
- Service worker.
- Versioned asset cache.
- Offline-ready state based on successful caching.
- Update notification.
- User-controlled update/reload at a safe moment.
- Relative/base-path-aware asset URLs.

Do not activate an update mid-mission.
Do not claim the game is offline-ready while chapters are missing
from the local cache.

Handle:
- First visit without connectivity.
- Interrupted download.
- Cache eviction or missing assets.
- Unsupported installation prompts.
- Unsupported fullscreen or orientation APIs.

Always allow ordinary browser play when install is unavailable.

Performance targets, not unverified claims:
- Aim for 60 FPS on representative mid-range devices.
- Preserve game correctness at lower rendering rates.
- Provide low-effects mode.
- Bound particle counts.
- Cap rendering resolution/device-pixel-ratio sensibly.
- Clean up listeners, timers, textures, and audio on scene shutdown.
- No runaway catch-up simulation after a backgrounded tab returns.

Prefer a compact initial build.
Measure compressed build size and report actual numbers.

==================================================
13. MENUS AND COMPLETE GAME FLOW
==================================================

Implement:
- Boot/loading screen.
- Title screen.
- New Game.
- Continue.
- Chapter select for unlocked missions.
- Settings.
- Controls tutorial.
- Journal.
- Pause.
- Restart checkpoint.
- Mission complete.
- Chapter transition.
- Ending.
- Credits.
- Save import/export.
- Install/help screen.

Every visible button must work.
Do not show disabled-looking promises for unfinished features.

After finishing:
Unlock chapter replay and a simple Arcade survival mode using an existing
polished arena, without delaying the campaign's completion.

If schedule pressure occurs, cut Arcade mode, extra cosmetic skins,
and bonus art before cutting campaign missions, saves, mobile controls,
ending, or tests.

==================================================
14. QUALITY ASSURANCE
==================================================

Unit tests:
- Direction queue and reversal rejection.
- Growth and tail-vacating collisions.
- Wall and gate collisions.
- Required item reachability.
- Empty spawn candidate handling.
- Checkpoint restoration.
- Ability cooldowns and reset behavior.
- Echo playback.
- Anchor replacement.
- Save validation and migration.
- Import limits and malformed input.
- Pause/resume simulation timing.
- Consistent results across render frame rates.

Content validation:
- All 24 mission IDs exist and are unique.
- Every campaign link resolves.
- No ability is required before it is unlocked.
- All required dialogue IDs exist.
- Every mission has an exit and checkpoint policy.
- All assets resolve.
- No TODO or placeholder story content in release content.

Use deterministic input replays or solver-assisted checks where feasible.
A simple flood-fill does not prove a dynamic Snake puzzle is solvable.
Test actual timed routes for key puzzles and boss encounters.

Browser tests:
- New Game through first checkpoint.
- Save and refresh.
- Continue.
- Mission restart.
- Settings persistence.
- Touch steering.
- Portrait/landscape resize.
- Pause on background.
- Mute.
- Save export/import.
- Offline reload after full caching.
- Safe update behavior.
- Ending and credits using a clearly isolated test fixture.
- No uncaught console errors.

Take and inspect screenshots at:
- 360 × 800.
- 390 × 844.
- 844 × 390.
- 768 × 1024.
- 1440 × 900.

Do not count browser emulation as real Android or iPhone testing.
List physical-device tests separately.

==================================================
15. DEVELOPMENT PROCESS
==================================================

Work in verified milestones:

1. Foundation and movement.
2. One complete polished vertical-slice mission with mobile controls.
3. Save system and content pipeline.
4. All six chapters and their mechanics.
5. Complete story, ending, and credits.
6. PWA, audio, accessibility, and performance.
7. Full testing and release documentation.

At each milestone:
- Run typecheck, tests, and production build.
- Inspect browser output when tools allow.
- Fix errors before adding more scope.
- Summarize implemented work and remaining work truthfully.

Use a task checklist so implementation can resume across sessions.
If you must stop, leave a working build and precise continuation notes.
Do not silently replace the requested campaign with a demo.

Use repository CI where available.
Keep development cheats and completion fixtures out of ordinary release UI.

==================================================
16. DELIVERABLES AND ACCEPTANCE
==================================================

Deliver:
- Complete source.
- All original/local assets.
- Lockfile.
- Working development and production build.
- Automated test suite.
- CI workflow.
- README.md.
- STORY.md with the complete narrative and dialogue.
- CAMPAIGN.md with all 24 mission specifications.
- TESTING.md with commands, results, and untested platforms.
- ASSET_LICENSES.md.
- Clear static-host deployment instructions.

README must distinguish:
- Implemented.
- Tested.
- Targeted but not yet verified.
- Known issues.

The release is not complete unless:
- A fresh checkout installs, typechecks, tests, and builds.
- New Game can reach the final ending without development cheats.
- All 24 missions exist and are actually playable.
- Saves survive reload.
- Touch controls work without hiding the board.
- No essential asset requires a remote server.
- Offline play works after verified full caching.
- No blocking placeholder or dead button remains.
- Playtime is reported as an estimate until human playtested.

Final response:
1. What was built.
2. How to run it.
3. What was actually tested.
4. Known limitations.
5