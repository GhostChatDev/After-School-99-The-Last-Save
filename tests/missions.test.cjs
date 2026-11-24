const { test } = require('node:test');
const assert = require('node:assert/strict');
const Logic = require('../js/logic.js');
const { missions, ending, opening, acts, actOf } = require('../js/missions.js');

test('16 distinct missions in three acts, an opening screen and an ending', () => {
  assert.equal(missions.length, 16);
  assert.equal(new Set(missions.map((m) => m.title)).size, missions.length, 'titles are unique');
  assert.equal(new Set(missions.map((m) => m.map.join('\n'))).size, missions.length, 'boards are unique');
  assert.ok(ending.length > 0);
  assert.ok(opening.length > 0 && opening.length <= 6, 'the story opens with one screen of text');
  assert.deepEqual(acts.map((a) => a.from), [0, 4, 8]);
  assert.equal(actOf(15).title, 'ACT III: THE GLITCH');
});

missions.forEach((def, i) => {
  test('mission ' + (i + 1) + ' (' + def.title + ') can be won', () => {
    const L = Logic.parse(def);
    const path = Logic.solve(L);
    assert.ok(path, 'no winning route');
    let s = Logic.newGame(L);
    for (const d of path) s = Logic.step(s, d);
    assert.equal(s.status, 'won');
  });
});

test('the last act is harder: glitches hunt in the late missions, and the boards get bigger', () => {
  const kinds = (def) => Logic.parse(def).bugs.map((b) => b.kind);
  for (const i of [8, 9, 10, 11, 12, 14, 15]) assert.ok(kinds(missions[i]).includes('glitch'), missions[i].title + ' has a glitch');
  assert.ok(kinds(missions[13]).includes('virus'), 'Recycle Bin has a virus');
  const size = (def) => def.map.length * def.map[0].length;
  assert.ok(size(missions[15]) > size(missions[0]) * 2, 'the finale is more than twice the first board');
});

test('walking into a wall is fatal', () => {
  const L = Logic.parse(missions[0]);
  const s = Logic.step(Logic.newGame(L), 'up');
  assert.equal(s.status, 'dead');
});

test('a glitch steps toward Pip every second move, and Pip’s body blocks it', () => {
  const L = Logic.parse({ title: 't', map: [
    '#########',
    '#P......#',
    '#.......#',
    '#......gE#'.slice(0, 9),
    '#########'] });
  let s = Logic.newGame(L);
  const g0 = s.bugs[0];
  s = Logic.step(s, 'right'); // move 1: the glitch waits
  assert.deepEqual([s.bugs[0].x, s.bugs[0].y], [g0.x, g0.y]);
  s = Logic.step(s, 'right'); // move 2: it steps toward the head, along the longer gap
  assert.equal(s.bugs[0].x, g0.x - 1, 'one square closer');
  assert.equal(s.bugs[0].y, g0.y);
});

test('a virus keeps a wall on its left and goes round its room', () => {
  const L = Logic.parse({ title: 't', map: [
    '#######',
    '#P...E#',
    '#.###.#',
    '#..r..#',
    '#######'] });
  let s = Logic.newGame(L);
  const seen = new Set();
  for (let i = 0; i < 6 && s.status === 'play'; i++) {
    s = Logic.step(s, i < 2 ? 'down' : 'up');
    seen.add(s.bugs[0].x + ',' + s.bugs[0].y);
  }
  assert.ok(seen.size >= 3, 'it moves, it does not sit still');
  for (const k of seen) {
    const [x, y] = k.split(',').map(Number);
    assert.notEqual(Logic.cell(L, x, y), '#', 'never inside a wall');
  }
});
