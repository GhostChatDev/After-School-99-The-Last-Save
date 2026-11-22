const { test } = require('node:test');
const assert = require('node:assert/strict');
const Logic = require('../js/logic.js');
const { missions, ending } = require('../js/missions.js');

test('Chapter 1 is included and the full story has an ending', () => {
  assert.equal(missions.length, 8);
  assert.ok(ending.length > 0);
});

missions.slice(0, 4).forEach((def, i) => {
  test('Chapter 1 mission ' + (i + 1) + ' (' + def.title + ') can be won', () => {
    const L = Logic.parse(def);
    const path = Logic.solve(L);
    assert.ok(path, 'no winning route');
    let s = Logic.newGame(L);
    for (const d of path) s = Logic.step(s, d);
    assert.equal(s.status, 'won');
  });
});

test('walking into a wall is fatal', () => {
  const L = Logic.parse(missions[0]);
  const s = Logic.step(Logic.newGame(L), 'up');
  assert.equal(s.status, 'dead');
});
