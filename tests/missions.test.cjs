const { test } = require('node:test');
const assert = require('node:assert/strict');
const Logic = require('../js/logic.js');
const { missions, ending } = require('../js/missions.js');

test('there are 12 missions and an ending', () => {
  assert.equal(missions.length, 12);
  assert.ok(ending.length > 0);
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

test('walking into a wall is fatal', () => {
  const L = Logic.parse(missions[0]);
  const s = Logic.step(Logic.newGame(L), 'up');
  assert.equal(s.status, 'dead');
});
