const { test } = require('node:test');
const assert = require('node:assert/strict');
const Logic = require('../js/logic.js');
const original = require('../js/missions.js');
const later = require('../js/campaign.js');

test('the complete campaign contains 24 missions across five chapters', () => {
  const all = original.missions.concat(later);
  assert.equal(all.length, 24);
  assert.deepEqual([...new Set(all.filter(m => m.chapter).map(m => m.chapter))], [2, 3, 4, 5]);
});

later.forEach((def, i) => {
  test('campaign mission ' + (i + 13) + ' replays its route to a win', () => {
    let state = Logic.newGame(Logic.parse(def));
    const path = Logic.solveActions(state.L);
    assert.ok(path, 'no winning route');
    for (const action of path) state = Logic.step(state, action);
    assert.equal(state.status, 'won');
  });
});

test('action objects and legacy direction strings share the movement API', () => {
  const state = Logic.newGame(Logic.parse(later[0]));
  assert.deepEqual(Logic.step(state, { kind: 'step', value: 'down' }).body, Logic.step(state, 'down').body);
});
