/* SAVE & EXIT must leave the desktop: the desktop draws a full-screen overlay and its
   capture-phase key handler only stops when it is hidden. If the quit hook forgot to
   hide it, the desktop stayed on top of the BIOS/title and kept swallowing arrows
   and Escape while the player was in a mission. This test failed before the fix. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('game.js: the desktop quit hook hides the desktop before booting again', () => {
  const game = read('js/game.js');
  const m = game.match(/quit:\s*function\s*\(\)\s*\{([\s\S]*?)\n\s*\},/);
  assert.ok(m, 'game.js must pass a quit hook to DesktopUI.create');
  const body = m[1];
  assert.match(body, /desktopUI\.hide\(\)/, 'quit must call desktopUI.hide() so the overlay is gone');
  // Order matters: hide first (the power-off is 620ms), the desktop must not be up when boot() runs.
  const hideAt = body.indexOf('desktopUI.hide()');
  const bootAt = body.indexOf('boot()');
  if (bootAt >= 0) assert.ok(hideAt < bootAt, 'hide() must run before boot()');
});

test('desktop-ui.js: hide() clears the visible flag the key handler checks', () => {
  const ui = read('js/desktop-ui.js');
  const show = ui.match(/function show\(\)\s*\{([\s\S]*?)\n\s*\}/);
  const hide = ui.match(/function hide\(\)\s*\{([\s\S]*?)\n\s*\}/);
  assert.ok(show && hide, 'desktop-ui.js must define show() and hide()');
  assert.match(show[1], /visible\s*=\s*true/, 'show() sets visible');
  assert.match(hide[1], /visible\s*=\s*false/, 'hide() clears visible');
  assert.match(hide[1], /root\.hidden\s*=\s*true/, 'hide() hides the root element');
  // The capture-phase handler returns early when not visible, so hide() disarms it.
  assert.match(ui, /if\s*\(!visible\)\s*return;/, 'the key handler must ignore keys while hidden');
});
