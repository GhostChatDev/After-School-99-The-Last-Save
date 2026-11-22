const { test } = require('node:test');
const assert = require('node:assert/strict');
const Logic = require('../js/logic.js');
const { missions, ending } = require('../js/missions.js');

test('the campaign has 24 distinct missions and an ending', () => {
  assert.equal(missions.length, 24);
  assert.equal(new Set(missions.map(m => m.title)).size, 24);
  assert.ok(ending.length > 0);
  for (const mission of missions) {
    assert.ok(mission.intro && mission.outro);
    assert.ok(mission.map.length && mission.map.every(row => row.length === mission.map[0].length));
    const cells = mission.map.join('');
    assert.equal([...cells].filter(c => c === 'P').length, 1);
    assert.equal([...cells].filter(c => c === 'E').length, 1);
    assert.equal([...cells].filter(c => c === '1').length, [...cells].filter(c => c === '2').length);
  }
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
