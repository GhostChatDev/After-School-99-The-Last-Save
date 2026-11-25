const { test } = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/desktop.js');
const { missions, acts } = require('../js/missions.js');

test('the desktop clock is frozen at 11:02 PM, NOV 23 1999', () => {
  assert.equal(D.CLOCK, '11:02 PM');
  assert.equal(D.DATE, 'NOV 23, 1999');
  assert.equal(D.windowTitle('memories'), 'C:\\MY MEMORIES');
  assert.equal(D.windowTitle('folder', 'act ii'), 'C:\\ACT II');
});

test('the level select is one folder per act, holding all 16 missions with their locks', () => {
  const best = { 0: 26, 1: 30 };
  const f = D.folders(acts, missions, 4, best);
  assert.equal(f.length, 3, 'three folders');
  assert.deepEqual(f.map((a) => a.total), [4, 4, 8]);
  assert.equal(f.reduce((n, a) => n + a.items.length, 0), 16, 'every mission is on the desktop');
  assert.deepEqual(f.map((a) => a.cleared), [2, 0, 0]);
  assert.equal(f[0].items[0].locked, false);
  assert.equal(f[0].items[3].locked, false, 'mission 4 is the last unlocked one');
  assert.equal(f[1].items[0].locked, true, 'Act II is locked while only 4 are open');
  assert.equal(f[2].open, false);
  assert.equal(f[0].items[0].cleared, true);
  assert.equal(f[0].items[2].cleared, false);
  assert.equal(f[1].subtitle, 'THE FOLDERS');
});

test('My Memories collects the memory card of every cleared mission, and says when it is empty', () => {
  assert.equal(D.memories(missions, {}).length, 0);
  assert.ok(D.emptyFolderText(0).length > 0);
  assert.equal(D.emptyFolderText(1), '');
  const got = D.memories(missions, { 0: 20, 15: 40 });
  assert.deepEqual(got.map((m) => m.number), [1, 16]);
  assert.equal(got[0].text, missions[0].outro);
});

test('Act III counts down to 00:00 01/01/2000, one second per step, and never goes below zero', () => {
  assert.equal(D.isActThree(7), false);
  assert.equal(D.isActThree(8), true);
  assert.equal(D.isActThree(15), true);
  // Finale: 90 seconds to midnight. Worked by hand: 86400 - 90 = 86310 s = 23:58:30.
  assert.equal(D.startSeconds(15), 90);
  assert.equal(D.countdownTo2000(15, 0).clock, '23:58:30');
  assert.equal(D.countdownTo2000(15, 0).text, '23:58:30 · 12/31/1999');
  assert.equal(D.countdownTo2000(15, 30).clock, '23:59:00');
  assert.equal(D.countdownTo2000(15, 89).clock, '23:59:59');
  const hit = D.countdownTo2000(15, 90);
  assert.equal(hit.midnight, true);
  assert.equal(hit.clock, '00:00:00');
  assert.equal(hit.date, '01/01/2000');
  assert.equal(hit.text, '00:00:00 · 01/01/2000');
  assert.equal(D.countdownTo2000(15, 500).secondsLeft, 0, 'it stops at midnight');
  // Act III opens at 720 s (12 minutes): 86400 - 720 = 85680 s = 23:48:00.
  assert.equal(D.countdownTo2000(8, 0).clock, '23:48:00');
  assert.equal(D.countdownTo2000(8, -5).moves, 0, 'a bad move count is treated as zero');
});

test('the final mission is themed as the Millennium Bug, the others are not', () => {
  assert.equal(D.isMillenniumBug(15, missions), true);
  for (const i of [0, 7, 8, 13, 14]) assert.equal(D.isMillenniumBug(i, missions), false);
});
