# After School '99: The Last Save

```
 ┌──────────────────────────────────────────────┐
 │ FC-99 TURBO BIOS v1.02                       │
 │ Memory test: 65536K OK                       │
 │ Loading PIP.EXE ...                          │
 │ NOV 23, 1999  11:02 PM   PRESS START         │
 └──────────────────────────────────────────────┘
```

> Some things are worth saving twice.

Play it: ghostchatdev.github.io/After-School-99-The-Last-Save/

A small grid game about an old family computer that is about to shut down. You are Pip, a glowing ribbon inside it. Collect the memories on each board, keep off the spikes, and find the way out.

No account, no install, no API key. It runs in a phone browser.

## How to play
Move one square at a time: arrow keys or WASD, swipe on the screen, or the pad below it (hold to keep moving). A selects, P or Esc pauses, R restarts the mission. Collect every spark, then reach the floppy disk.

## What's in it
- Sixteen missions in three acts, with a short story that opens the game and a twist near the end.
- Four kinds of trouble: corrupt sectors, dust bunnies that patrol, viruses that crawl along the walls, and glitches that hunt you every second step (your own tail blocks them).
- Pixel art drawn in code, a CRT boot screen, smooth movement, sparkles, screen shake, and a colour scheme per act.
- Original chiptune music (a theme per act, a title theme and an ending) and sound effects, all made live in the browser. Sound can be switched off.
- Stars for clearing missions in few steps, and faces for Pip to buy with them. Progress is saved on the device.

## Built with
Ghost Code, in a browser, on an Android phone. No laptop, no game engine, no local editor. One brief went in and the game came out, in about an hour, for under $9 of AI.

The brief Ghost Code was given is in docs/PROMPT.md.

Finished on 23 Nov 2026 with Claude Code on a Mac: the game screen, music and sound, story, the two hunting enemies and the four Act III missions were written there. The rules and the first twelve missions came from Ghost Code.

## Tested: the proof (23 Nov 2026)
Anyone can repeat these. Each line says what was checked, how, and what came out.

**Every mission can be won.** `node tests/report.cjs` makes the table below from the game's own rules. For each mission a search finds the shortest winning route, then that route is replayed move by move through the real rules and must end on the floppy disk with every spark. `node --test tests/missions.test.cjs` runs the same proof plus checks on how each enemy moves: **21 of 21 tests pass**.

| # | Mission | Act | Board | Sparks | Dust | Virus | Glitch | Key | Portals | Shortest win | Replayed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Boot Sector | Act I | 11x9 | 3 | 1 |  |  |  |  | 26 moves | won |
| 2 | The Homework Folder | Act I | 11x9 | 4 | 1 |  |  |  |  | 28 moves | won |
| 3 | The Locked Diary | Act I | 11x9 | 4 | 1 |  |  | yes |  | 29 moves | won |
| 4 | Dust Bunnies | Act I | 11x9 | 3 | 3 |  |  |  |  | 21 moves | won |
| 5 | Floppy Shortcut | Act II | 11x9 | 3 | 2 |  |  |  | yes | 28 moves | won |
| 6 | Birthday Video | Act II | 11x8 | 4 | 2 |  |  | yes |  | 25 moves | won |
| 7 | The Attic Drive | Act II | 13x8 | 5 | 1 |  |  |  |  | 41 moves | won |
| 8 | Playground Echo | Act II | 13x8 | 4 | 2 |  |  | yes |  | 31 moves | won |
| 9 | Cassette Loop | Act III | 13x9 | 4 | 2 |  | 1 |  | yes | 56 moves | won |
| 10 | Chat Room | Act III | 13x10 | 4 | 2 |  | 1 | yes |  | 71 moves | won |
| 11 | Dial-Up | Act III | 13x9 | 4 | 4 |  | 1 |  | yes | 44 moves | won |
| 12 | Shutdown Warning | Act III | 13x10 | 4 | 2 |  | 1 | yes | yes | 45 moves | won |
| 13 | Y2K Countdown | Act III | 15x9 | 5 |  |  | 1 |  |  | 36 moves | won |
| 14 | Recycle Bin | Act III | 15x10 | 5 |  | 1 |  |  |  | 52 moves | won |
| 15 | Safe Mode | Act III | 17x11 | 5 | 1 |  | 1 | yes |  | 72 moves | won |
| 16 | The Last Save | Act III | 19x11 | 6 |  | 1 | 2 |  | yes | 46 moves | won |

16 of 16 missions proved winnable; 651 moves for a perfect run of the whole game; solved in 1.6 s.

Run on an Apple M5 Mac (macOS 27.2.1, Node 26). On GitHub the Mission tests check runs the same tests on every commit: [passed](https://github.com/GhostChatDev/After-School-99-The-Last-Save/actions/runs/45173048693) on this version.

**Played in a browser.** Boot screen → story → title → mission 1 won in 26 moves ("PERFECT ROUTE") → mission 16 → walking into a wall shows "SIGNAL LOST" → TRY AGAIN restarts the same mission. No errors in the browser console.

**The screenshot check (Ghost Code's own check: desktop, tablet and phone, pressing every button on the first screen).** Before this version: failed, with the arrows, ☰, ? and A doing nothing. This version, run on the Mac: no failures, **8 of 8 buttons do something**.

**Not tested yet:** sound and offline play on a real phone; a person playing every mission start to finish (each is proved winnable by the search, not by hand).

## What it cost
| What | Cost | Where the number comes from |
|---|---|---|
| Ghost Code: first build | under $9 of AI | the original build, this README before |
| Ghost Code: "Continue the 90s Snake Game" task, 23 Nov 2026 | about $2.68 of AI | shown on that task's card in Ghost Code |
| Finishing it with Claude Code on a Mac | $0 extra | covered by the owner's Claude Max subscription (a flat monthly price, pay-per-use switched off); the same session also did other work, so no per-game figure exists |
| Pictures and clips made by AI | $0 | none: every picture is drawn in code |
| Checks on GitHub | $0 | public repository: GitHub Actions minutes are free |
| Hosting | $0 | GitHub Pages |

All check runs on this repository so far (most of them Ghost Code's own, while it built and fixed levels): Mission tests 86 runs, 72 passed and 14 failed; screenshot check 85 runs, 73 passed and 11 failed.

## What it isn't yet
The brief asked for a four-hour campaign and four abilities. What's here is sixteen missions (well under an hour for most players) and one movement mode. Offline play is set up but not yet tried on a real phone.

Art, name and levels are original. Nothing is ported from another game.