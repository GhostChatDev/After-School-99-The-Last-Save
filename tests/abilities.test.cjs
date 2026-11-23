const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

function level(map) { return L.parse({ title: 'test', map }); }
function move(s, dirs) { for (const d of dirs) { assert.equal(s.status, 'play', s.cause); s = L.step(s, d); } return s; }

test('normal movement grows on a spark and permits entering a departing tail', () => {
  const s = L.newGame(level(['#####','#PoE#','#####']));
  assert.equal(L.step(s, 'right').body.length, 2);
  const grown = L.step(s, 'right');
  assert.equal(grown.got, 1);
  assert.equal(L.step(grown, 'left').status, 'play', 'the departing tail is legal');
  assert.equal(L.step(L.step(grown, 'left'), 'right').status, 'won', 'the return route reaches the exit');
});

test('Brake toggles and its deterministic meter exhausts and recovers', () => {
  let s = L.newGame(level(['#####','#PoE#','#####']));
  s = L.ability(s, 'brake');
  assert.equal(s.braking, true);
  s = L.step(s, 'right');
  assert.equal(s.brake, 88);
  assert.equal(L.step(s, 'right').status, 'won');
  const meter = { status: 'play', brake: 5, braking: true, events: [] };
  assert.equal(L.ability(meter, 'brake').braking, false);
});

test('Phase is armed explicitly, consumed by one gate, and recharged by a spark', () => {
  let s = L.newGame(level(['#######','#PG.oE#','#######']));
  s = L.ability(s, 'phase');
  assert.equal(s.phaseArmed, true);
  s = L.step(s, 'right');
  assert.equal(s.phase, 0);
  assert.equal(s.phaseArmed, false);
  assert.equal(L.ability(s, 'phase'), s);
  s = move(s, ['right', 'right']);
  assert.equal(s.phase, 1);
  assert.equal(L.step(s, 'right').status, 'won');
});

test('unarmed Phase gates are fatal', () => {
  const s = L.step(L.newGame(level(['#####','#PGE#','#####'])), 'right');
  assert.equal(s.cause, 'phase');
});

test('Echo only activates switches after recording ends and can open an exit on entry', () => {
  let s = L.newGame(level(['######','#P.sE#','######']));
  s = L.ability(s, 'echo');
  s = L.step(s, 'right');
  assert.equal(s.echoActive, false);
  s = L.ability(s, 'echo');
  s = L.step(s, 'right');
  assert.equal(s.echoActive, true);
  assert.equal(L.step(s, 'right').status, 'won');
});

test('Anchor toggles only on a pad, freezes its point, and opens A doors', () => {
  let s = L.newGame(level(['######','#PaAE#','######']));
  assert.equal(L.ability(s, 'anchor'), s);
  s = L.step(s, 'right');
  s = L.ability(s, 'anchor');
  assert.deepEqual(s.anchor, [2,1]);
  s = L.step(s, 'right');
  assert.equal(s.status, 'play');
  s = L.ability(s, 'anchor');
  assert.equal(s.anchor, null);
});

test('reverse into a longer body and stale state are rejected', () => {
  const L0 = level(['#####','#PoE#','#####']);
  let s = L.step(L.newGame(L0), 'right');
  assert.equal(L.step(s, 'left'), s);
  const won = L.step(s, 'right');
  assert.equal(L.step(won, 'left'), won);
});
