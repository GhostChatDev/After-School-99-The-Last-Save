"The brief Ghost Code was given for this build, as it restated it back. Kept here as the artifact, not as documentation of the game. The game that shipped is described in the README."

Here’s a complete prompt you can copy and send to your agent. It includes the story, all 24 missions, mobile controls, saving, offline support, testing, and a `README.md`.

> **Note:** This is a sizeable game. The four hours refer to the player’s intended campaign length—not how long it will take the agent to build. If your agent can’t finish in one session, the prompt tells it to leave a working build and continue in milestones.

```text
You are my game development agent. Build a complete, original, 2D web
adventure game called:

AFTER SCHOOL ’99: THE LAST SAVE

Tagline:
“Some things are worth saving twice.”

I want a game that makes players feel the nostalgia of 1990s computer
games, while feeling smooth, polished, and accessible on modern devices.

The game must work as a responsive web app for Android, iPhone, tablets,
and desktop computers. It should be installable where the browser supports
web app installation.

This is not a request for just a game concept, landing page, or demo.
Build the actual game, with a complete campaign, story, ending, saving,
mobile controls, and documentation.

The intended first-play campaign length is approximately 4 hours.
This is a target to validate through playtesting—not a guarantee and not
an excuse to add repetitive grinding.

If the entire project cannot be completed in one task, work in the
milestones described below. Leave the project in a working state and
record exactly what is finished and what remains. Never claim a feature
is complete or tested if it is not.

==================================================
1. CORE CONCEPT
==================================================

Create a story-driven game inspired by the simple movement and satisfying
collection mechanics of classic 1990s Snake games.

The player controls Pip, a small glowing ribbon-like program living inside
an old family computer.

Pip moves on a grid, collects memory fragments, grows longer, solves
environmental puzzles, avoids hazards, unlocks abilities, and travels
through memories stored in the computer.

The game should start with a familiar arcade feeling, then gradually become
a deeper adventure about family, growing up, and preserving memories
without being trapped in the past.

The mood should be:

- Nostalgic.
- Warm and mysterious.
- Sometimes playful.
- Emotional without being overly sad.
- Accessible to casual players.
- Satisfying for players who enjoy clever movement puzzles.

Do not copy the original Nibbles game, its characters, copyrighted art,
music, maps, branding, or code. This must be an original game inspired by
the general feel of 1990s computer games.

==================================================
2. TECHNOLOGY
==================================================

Use an appropriate modern 2D browser-game stack:

- Phaser.
- TypeScript with strict type checking.
- Vite.
- Vitest for unit tests.
- Playwright for browser tests.
- A web app manifest and service worker for PWA functionality.

Check current official documentation and use compatible stable package
versions. Pin dependencies and commit the lockfile.

The project must run as a static web app. No backend is required.

Do not use:

- AI APIs.
- User accounts.
- Online multiplayer.
- Ads.
- Paid subscriptions.
- External assets that the game must download while playing.
- API keys.
- A required internet connection after the game has been successfully
  cached for offline play.

Keep the gameplay simulation separate from rendering and menus so the
rules can be tested reliably.

Use a fixed gameplay timestep and smooth rendering between grid positions.
The simulation must not run faster or slower based on the device’s
rendering frame rate.

Organize the project cleanly. A suggested structure is:

src/
  main.ts
  game/
    scenes/
    simulation/
    systems/
    input/
    audio/
    save/
    rendering/
    ui/
  content/
    chapters/
    levels/
    dialogue/
  styles/

public/
  icons/
  assets/

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

You may improve this structure if you have a good reason, but do not place
the entire game in one giant file.

==================================================
3. DEVICE SUPPORT
==================================================

Design for:

- Android phones and tablets.
- iPhone and iPad.
- Desktop computers.
- Touchscreen laptops.

Support current versions of major browsers where practical:

- Chrome.
- Edge.
- Firefox.
- Safari.
- Samsung Internet.

Do not promise compatibility with every device. Document the devices and
browsers actually tested.

The layout must adapt to:

- Portrait phones.
- Landscape phones.
- Tablets.
- Desktop monitors.
- Changes in screen size and orientation.

Respect safe-area insets and avoid placing important controls under
notches, rounded corners, or browser toolbars.

Do not force fullscreen or landscape mode. If fullscreen is available,
offer it as an optional setting.

==================================================
4. VISUAL DESIGN
==================================================

Make the game feel like a polished indie game with a 1990s soul.

Visual style:

- Original pixel-art-inspired graphics.
- Warm CRT colors.
- Subtle screen glow.
- Smooth movement.
- Layered backgrounds.
- Animated environmental details.
- Clear, readable hazards and objectives.
- Modern menus that remain easy to use on a phone.

Do not make the entire screen overly blurry or dark.

Pip should have:

- A distinct head and tail.
- Small expressive eyes.
- Direction-aware animation.
- A glowing ribbon-like body.
- Clear collision boundaries.

Each chapter should have its own identity:

1. Bedroom:
   Warm amber, dark blue, old computer glow, childhood drawings.

2. Computer Lab:
   Mint green, blue, fluorescent light, desks and old monitors.

3. Arcade:
   Violet, pink, electric cyan, arcade cabinets and neon signs.

4. Rainy Neighborhood:
   Deep blue, teal, rain, bus stops, warm window lights.

5. Memory Archive:
   Faded peach, silver, old papers, unfinished drawings.

6. Shutdown Core:
   Dark charcoal, warning red, broken data, returning golden light.

Add tasteful visual polish:

- Collection particles.
- Door-opening animations.
- Small idle animations.
- Environmental movement.
- Scene transitions.
- Optional CRT scanlines.
- Optional screen shake.
- Reduced-effects mode for slower devices.

CRT effects, flashing, movement effects, and screen shake must be
adjustable or disableable.

Use original local assets or generate suitable original art and sounds.
Do not leave the finished game looking like unstyled debug rectangles.

==================================================
5. GAMEPLAY RULES
==================================================

Basic movement:

- Pip moves automatically on a grid.
- The player changes direction at right angles.
- Pip cannot immediately reverse into its own body.
- Movement must be consistent at different frame rates.
- Smoothly animate between grid cells.

Input:

- Arrow keys.
- WASD.
- Touch D-pad.
- Optional swipe controls.
- Gamepad support where practical.

Use a small input queue so fast players do not lose turns. Validate queued
turns against the previous queued direction, not just the current
direction. Avoid filling the queue with repeated key events.

Collectibles:

- The player collects numbered memory packets.
- Some objectives use packets numbered 1 through 9.
- Required packets must be visually distinct from optional items.
- The next required objective must always be clear.

Growth:

- Certain packets make Pip grow.
- Pip must avoid colliding with walls, hazards, and its own body.
- Clearly marked spool stations let Pip shorten its body when a puzzle
  requires it.
- Never shorten the player silently.

Ensure collectibles never spawn:

- Inside a wall.
- Inside the player.
- Inside an active hazard.
- In a place that cannot be reached.

Campaign levels should use designed, authored layouts rather than relying
on random generation for essential objectives.

If a level uses optional randomized collectibles, make sure randomness
cannot make the level impossible.

Collision and simulation:

- Resolve each movement tick consistently.
- Define and test whether entering a cell vacated by the tail is legal.
- Account for growth when checking tail collisions.
- Handle the case where no valid spawn location exists.

Failure:

- No campaign-wide limited lives.
- A collision returns the player to a checkpoint.
- Completed missions and collected permanent rewards are not erased.
- Restarting should be quick and clear.

==================================================
6. ABILITIES
==================================================

Introduce four abilities gradually.

ABILITY 1: BRAKE

Unlocked in Chapter 1.

- Temporarily slows Pip.
- Does not stop Pip completely.
- Uses a rechargeable meter.
- Show the meter clearly.
- Designed for precise movement.

ABILITY 2: ECHO

Unlocked in Chapter 2.

- Records a short route.
- Replays that route as a ghost ribbon.
- The ghost does not collide with Pip.
- The ghost can activate clearly marked Echo switches.
- Explain how recording, playback, and reset work.

ABILITY 3: PHASE

Unlocked in Chapter 3.

- Allows Pip to pass through one clearly marked Phase gate.
- Uses a visible charge.
- Does not allow passing through ordinary walls or Pip’s body.
- Recharge rules must be predictable.

ABILITY 4: ANCHOR

Unlocked in Chapter 4.

- Lets Pip preserve the state of a marked switch or anchor pad.
- Only one Anchor can be active at a time.
- Placing a new Anchor clearly releases the previous one.

Chapters 5 and 6 combine these abilities.

Make all abilities usable on touchscreens without requiring awkward
three-finger gestures.

Do not add an unnecessary upgrade tree, experience grind, or
pay-to-progress system.

==================================================
7. FULL STORY
==================================================

Title:
AFTER SCHOOL ’99: THE LAST SAVE

MAIN CHARACTERS

Alex:
An adult returning to their childhood home while their family is moving.

June:
Alex’s older sister. She is alive, but the siblings have drifted apart.
When they were young, she helped Alex make a game.

Pip:
The small ribbon-like character Alex and June created together.

Dot:
A friendly helper program represented by a small animated cursor.
Dot is warm and helpful but does not know everything.

Null:
A maintenance program clearing corrupted parts of the old computer.
Null initially appears threatening, but is not secretly evil.

The Overwrite:
A malfunctioning cleanup process and the final threat.

REAL-WORLD SETUP

Alex discovers an old computer in their childhood bedroom.

As children in 1999, Alex and June started making a game together.
Alex drew Pip, and June wrote the movement code.

They never finished the last level.

The old computer still starts, but its storage is failing. Alex finds a
folder named:

AFTER_SCHOOL / FINAL_FINAL / REALLY_FINAL

Alex opens it.

Inside the computer, Pip wakes to a warning:

“ARCHIVE FAILURE. FINAL SHUTDOWN PENDING.”

Pip believes that saving every file will restore the old world exactly as
it was.

DOT explains that six archive sectors contain fragments of the unfinished
game. Reassembling them might make a transferable save.

CHAPTER 1: THE ROOM THAT REMEMBERED

Pip wakes inside a digital version of Alex and June’s old bedroom.

The walls contain childhood drawings and old desktop patterns. Glowing
stars from the bedroom ceiling float behind the windows.

Pip finds an early drawing with a handwritten note:

“Give him a friend so he doesn’t get lonely.”

Null seals the bedroom exit to contain corruption. Pip thinks Null is
attacking the world.

At the end of the chapter, Pip recovers a recording:

June: “It doesn’t have to be perfect.”
Alex: “It has to be finished.”
June: “Those aren’t the same thing.”

CHAPTER 2: THE SHARED KEYBOARD

The computer lab contains memories of school afternoons, old monitors,
and two glowing workstations.

Pip learns Echo and uses it to solve puzzles that require two routes to
work together.

A recovered memory shows that June often stayed late to help Alex with
projects, even when Alex assumed June was embarrassed by them.

Null speaks directly:

“I cannot preserve a room that no longer exists.”

Dot calls it a maintenance error, but begins to question that explanation.

CHAPTER 3: ONE MORE CREDIT

The arcade sector is bright, noisy, and unstable.

Arcade machines endlessly repeat the same winning moments. Their
scoreboards contain impossible numbers.

A guardian called High Score refuses to let anyone leave without setting
another record.

Pip learns Phase and defeats High Score by opening a path out instead of
trying to earn infinite points.

A recovered memory shows Alex ignoring June’s request to go home because
Alex wants “one more try.”

The chapter’s idea:

A good moment does not become better by refusing to let it end.

CHAPTER 4: RAIN ON THE WAY HOME

Pip travels through a neighborhood made from bus windows, rainy streets,
corner shops, and warm house lights.

Dot begins losing pieces of its dialogue as the archive fails.

Pip learns Anchor and keeps small parts of the neighborhood stable.

A memory reveals that June was leaving for college. Alex accused her of
abandoning their game. June left a note in the unfinished project, but
Alex never opened it.

A corruption surge threatens Pip. Null protects Pip from it.

Null explains that shutdown is not punishment. The damaged system cannot
keep running forever.

CHAPTER 5: THE THINGS WE KEPT

The archive contains unfinished drawings, discarded music, abandoned
levels, and ordinary childhood memories.

Pip learns that trying to preserve the entire old computer would consume
the remaining readable data and destroy the transferable save.

Dot admits:

“I was written to help you find things.
I wasn’t written to know when to stop looking.”

Pip and Dot assemble a smaller archive containing:

- The unfinished game.
- Its source files.
- Important recordings.
- June’s unread note.

June’s note says:

“Sorry we didn’t finish it before I left.
I made you an exit door.
You can decide where it goes.
Call me when you get there.”

Pip realizes the goal is not to keep the past running forever. It is to
carry something meaningful forward.

CHAPTER 6: THE LAST SAVE

Null helps Pip reach the export port.

The failing system mistakes the moving archive for corruption and activates
the Overwrite.

The final missions combine Brake, Echo, Phase, and Anchor.

Dot uses its remaining working memory to hold open the export route.

Dot’s final line before the export:

“Leave the door where you can find it.”

Pip carries the save through the exit June made years ago.

The old computer shuts down.

EPILOGUE

A recovered folder opens on Alex’s modern device.

A tiny playable room appears. Pip is waiting beside an unfinished exit.

Alex reads June’s note, smiles, and calls her.

Alex: “I found our game.”
June: “Does it still work?”
Alex: “Almost.”
June: “Then I guess we should finish it.”

After the credits, the title screen changes. The nostalgic room now has a
modern device beside the old computer.

A cursor blinks. Dot appears as a small recovered helper icon:

“NEW SAVE CREATED.”

There should be one complete canonical ending. Do not hide the emotional
resolution behind collectibles.

Write all required dialogue and story scenes. Do not leave placeholders,
unfinished conversations, or “story coming soon” text.

Keep dialogue warm and restrained. Allow players to advance and skip
cutscenes. Add a journal where unlocked story scenes can be reread.

==================================================
8. CAMPAIGN: 24 MISSIONS
==================================================

Create six chapters with four playable missions each.

Each mission must have its own:

- Map and level geometry.
- Objectives.
- Hazards or puzzle mechanics.
- Checkpoint behavior.
- Exit condition.
- Story or environmental detail.
- Tested completion path.
- Optional collectibles where appropriate.

Do not make one map and reuse it 24 times with different colors.

CHAPTER 1: BEDROOM BOOT

Mission 1: Wake the Monitor
- Teach movement in a safe environment.
- Collect the first memory packets.
- Restore a terminal and open the first exit.

Mission 2: Under the Desk
- Navigate cable corridors.
- Introduce spool stations.
- Unlock and teach Brake.

Mission 3: Glow-in-the-Dark Stars
- Route power to three star terminals.
- Introduce more deliberate route planning.

Mission 4: The Dust Guardian
- A sweeping cleanup brush threatens the room.
- Telegraph the brush’s path clearly.
- Activate switches and exit during safe intervals.

CHAPTER 2: COMPUTER LAB

Mission 5: Broken Arrow Key
- Introduce one-way lanes and alternate routes.

Mission 6: Seat Beside Mine
- Unlock Echo.
- Teach a forgiving two-switch puzzle.

Mission 7: Shared Keyboard
- Use recorded Echo paths across multiple rooms.

Mission 8: The Hall Monitor
- Navigate readable patrol beams.
- Use Echo-operated gates and safe cover zones.

CHAPTER 3: ARCADE AFTER DARK

Mission 9: Insert Memory
- Navigate arcade lanes.
- Offer optional risk-and-reward collectibles.

Mission 10: Behind the Cabinet
- Unlock Phase.
- Teach clearly marked Phase gates.

Mission 11: One More Try
- Navigate rotating arena sections.
- Pause safely between changes.

Mission 12: High Score
- A three-phase routing encounter.
- Break the repeating score loop and open an escape route.

CHAPTER 4: RAINY WAY HOME

Mission 13: Last Bus
- Escort a friendly signal between protected bus stops.

Mission 14: Puddle Signals
- Avoid clearly telegraphed electrical hazards.

Mission 15: Porch Light
- Unlock Anchor.
- Restore routes through the neighborhood.

Mission 16: The Storm Router
- Combine Anchor and Echo to maintain power during a storm.

CHAPTER 5: MEMORY ARCHIVE

Mission 17: Unfinished Drawings
- Traverse hand-drawn rooms with different route shapes.

Mission 18: Things We Never Said
- Route message fragments to the correct terminals.

Mission 19: Keep / Let Go
- Preserve essential archive nodes while optional scenery fades.
- Never delete the player’s real files or use deceptive file deletion.

Mission 20: The Collector
- A guardian is hoarding duplicate memories.
- Use learned abilities to open release valves.

CHAPTER 6: FINAL SHUTDOWN

Mission 21: Safe Mode
- A quiet, precise mission revisiting earlier mechanics.

Mission 22: Carry the Light
- Escort the assembled save through failing sectors.

Mission 23: The Door You Made
- A multi-room puzzle using Brake, Echo, Phase, and Anchor.

Mission 24: The Last Save
- A three-phase encounter against the Overwrite.
- Export the archive.
- Show the complete ending and credits.

Boss encounters must be readable, fair, and playable with the normal
movement controls.

==================================================
9. FOUR-HOUR PLAYTIME TARGET
==================================================

Design for approximately four hours of first-time play on Normal
difficulty.

Initial pacing target:

- 24 missions averaging around 8 minutes: approximately 192 minutes.
- Required story and transitions: approximately 30 minutes.
- Natural exploration and hub interactions: approximately 18 minutes.

Total target: approximately 240 minutes.

This is only a planning estimate. Some missions should be shorter and some
longer.

Do not use artificial timers, forced waiting, repetitive grinding,
unskippable dialogue, or unfair difficulty to reach four hours.

Track locally:

- Active mission time.
- Cutscene time separately.
- Deaths.
- Restarts.
- Assist usage.
- Mission completion.

Pause the active timer when the game is paused, the app is hidden, or
menus are open.

Do not send analytics to a server.

Include a development report with estimated mission durations. Clearly
state that real player time n