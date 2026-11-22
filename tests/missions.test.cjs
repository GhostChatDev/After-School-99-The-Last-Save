const { test } = require('node:test');
const assert = require('node:assert/strict');
const Logic = require('../js/logic.js');
const { missions, ending } = require('../js/missions.js');

test('Chapter 1 has four missions, three stickers per mission, and an ending', () => {
  assert.equal(missions.length, 4);
  assert.ok(ending.length > 0);
  missions.forEach(m => assert.equal(Logic.parse(m).stickers.length, 3, m.title + ': sticker count'));
});

missions.forEach((def, i) => {
  test('mission ' + (i + 1) + ' (' + def.title + ') can be won through real rules', () => {
    const L = Logic.parse(def);
    const path = Logic.solve(L, 900000);
    assert.ok(path, 'no winning route');
    let s = Logic.newGame(L);
    for (const d of path) s = Logic.step(s, d);
    assert.equal(s.status, 'won');
  });
});

test('walls are fatal and immediate reversal is ignored', () => {
  const L = Logic.parse(missions[0]);
  let s = Logic.step(Logic.newGame(L), 'right');
  assert.equal(Logic.step(s, 'left'), s);
  s = Logic.step(s, 'up');
  assert.equal(s.status, 'dead');
  assert.equal(s.cause, 'wall');
});

test('Brake drains while held, recharges normally, and cannot stop simulation', () => {
  const L = Logic.parse(missions[1]);
  let s = Logic.newGame(L);
  s = Logic.step(s, 'right', true);
  assert.equal(s.brake, 88);
  assert.equal(s.braking, true);
  assert.equal(s.moves, 1);
  s = Logic.step(s, 'right', false);
  assert.equal(s.brake, 93);
  s.brake = 1;
  s = Logic.step(s, 'right', true);
  assert.equal(s.brake, 0);
  assert.equal(s.braking, true);
  s = Logic.step(s, 'right', true);
  assert.equal(s.braking, false);
  assert.equal(s.status, 'play');
});

test('terminals only activate in A B C order', () => {
  const def = { title: 'Terminals', map: ['#######', '#P.ABC#', '#..o.E#', '#######'] };
  const L = Logic.parse(def);
  let s = Logic.step(Logic.newGame(L), 'right');
  assert.equal(s.term, 0);
  s = Logic.step(s, 'right');
  assert.equal(s.term, 1);
  s = Logic.step(s, 'right');
  s = Logic.step(s, 'right');
  assert.equal(s.term, 3);
});

test('spools shorten Pip but never below three segments', () => {
  const def = { title: 'Spool', map: ['########', '#PooS.E#', '########'] };
  const L = Logic.parse(def);
  let s = Logic.newGame(L);
  ['right', 'right', 'right'].forEach(d => { s = Logic.step(s, d); });
  assert.equal(s.body.length, 3);
});

test('Guardian warns while stationary, then sweeps two cells', () => {
  const L = Logic.parse(missions[3]);
  let s = Logic.newGame(L);
  const start = s.bugs[0].x;
  s = Logic.step(s, 'right');
  assert.equal(s.bugs[0].x, start);
  assert.equal(s.bugs[0].warning, true);
  s = Logic.step(s, 'right');
  assert.equal(s.bugs[0].x, start + 2);
  assert.equal(s.bugs[0].warning, false);
});
