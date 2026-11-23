# After School '99: The Last Save

> Some things are worth saving twice.

Play it: ghostchatdev.github.io/After-School-99-The-Last-Save/

A small grid game about an old family computer that is about to shut down. You are Pip, a glowing ribbon inside it. Collect the memories on each board, keep off the spikes, and find the way out.

No account, no install, no API key. It runs in a phone browser.

## How to play
Move one square at a time with Arrow keys or WASD, swipe the board, or use the phone controls. In Classic mode Pip keeps moving. Restart, pause, mission select and audio controls are in the top bar; the game also pauses when its tab loses focus.

Later chapters introduce four explicit abilities: **B** toggles Brake, **F** arms Phase for one glowing gate (a spark recharges it), **R** records and releases an Echo, and **Z** toggles Anchor while standing on a pad. The matching on-screen buttons support touch play. A is always Move Left.

## What's in it
Twenty-four deterministic missions across the original story and four later chapters. Each board has memory pickups, hazards and a route to the exit. Progress and settings save locally, completed missions unlock the next mission, and replaying an earlier board cannot erase later progress. Step and Classic modes, music and effects, and offline caching are included.

## Built with
Ghost Code, in a browser, on an Android phone. No laptop, no game engine, no local editor. One brief went in and the game came out, in about an hour, for under $9 of AI.

The brief Ghost Code was given is in docs/PROMPT.md.

## Scope
This is a compact puzzle campaign, not a four-hour adventure. It uses original canvas graphics and synthesized audio; there are no external game services or downloaded level packs.

## Checks
With Node 22, run `node --test tests/missions.test.cjs tests/abilities.test.cjs tests/campaign.test.cjs`. The tests replay every original and later mission through the game's movement API and cover all four abilities.

Art, name and levels are original. Nothing is ported from another game.

---
<img src="https://ghostchat.tech/icons/ghost-code-dev.png" width="20" height="20" alt="" align="top"> Built by [Ghost Code Dev](https://ghostchat.tech)
