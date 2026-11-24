'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sandbox = { console, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
for (const file of ['js/logic.js', 'js/missions.js', 'js/progression.js', 'js/shop.js']) {
if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox);
}
const AS = sandbox.window.AS;
test('campaign has 12 distinct missions and each can be completed', () => {
  const { missions } = sandbox.AS.missions;
  assert.equal(missions.length, 12);
  assert.equal(new Set(missions.map(m => m.map.join('\n'))).size, 12);
  for (const mission of missions) {
    const level = sandbox.AS.logic.parseMission(mission);
    let state = sandbox.AS.logic.initialState(level);
    const queue = [{ state, steps: [] }];
    const seen = new Set();
    let won = false;
    for (let i = 0; i < queue.length && i < 15000 && !won; i++) {
      const item = queue[i];
      const key = JSON.stringify(item.state);
      if (seen.has(key)) continue;
      seen.add(key);
      won = sandbox.AS.logic.hasWon(item.state);
      for (const dir of ['up', 'down', 'left', 'right']) {
        const next = sandbox.AS.logic.move(item.state, dir);
        if (next !== item.state) queue.push({ state: next, steps: [...item.steps, dir] });
      }
      const used = sandbox.AS.logic.interact(item.state);
      if (used !== item.state) queue.push({ state: used, steps: [...item.steps, 'interact'] });
    }
    assert.ok(won, `${mission.title} needs a winning route`);
  }
});
test('shop charges once and progress API exists', () => {
  const shop = sandbox.AS.shop;
  assert.equal(shop.FACES.length >= 6, true);
  const state = { stars: 10, ownedFaces: ['classic'], selectedFace: 'classic' };
  assert.equal(shop.buy(state, 'cool'), true);
  assert.equal(state.stars, 7);
  assert.equal(shop.buy(state, 'cool'), false);
  assert.equal(state.stars, 7);
});
