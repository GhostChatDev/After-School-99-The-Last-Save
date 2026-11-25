/* Wiring tests: the page really loads the desktop, CRT and Y2K code, and the
   offline cache lists the new files. These catch "code exists but is never
   loaded" mistakes, which the logic tests cannot see. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('index.html loads the desktop scripts and stylesheet', () => {
  const html = read('index.html');
  assert.match(html, /<script[^>]+src="js\/desktop\.js"/, 'js/desktop.js must be loaded');
  assert.match(html, /<script[^>]+src="js\/desktop-ui\.js"/, 'js/desktop-ui.js must be loaded');
  assert.match(html, /css\/desktop\.css/, 'css/desktop.css must be loaded');
  // desktop must be loaded before game.js so window.Desktop exists
  assert.ok(html.indexOf('js/desktop.js') < html.indexOf('src="js/game.js"'), 'desktop.js must come before game.js');
});

test('index.html has the desktop root and the CRT glass element', () => {
  const html = read('index.html');
  assert.match(html, /id="desktop"/, 'desktop root element');
  assert.match(html, /class="crt-glass"/, 'CRT glass element');
});

test('game.js uses the desktop hooks instead of skipping them', () => {
  const game = read('js/game.js');
  for (const hook of ['play', 'quit', 'closet', 'story', 'toggleCrt', 'toggleSound']) {
    assert.match(game, new RegExp(hook + '\\s*[:,=]'), `hook ${hook} must be passed to Desktop.create`);
  }
  assert.match(game, /DesktopUI\.create/, 'game.js must create the desktop');
  assert.match(game, /powerOff|power-off|shrink/i, 'quitting must run the power-off shrink');
});

test('Act III wiring: Y2K clock and Millennium Bug finale', () => {
  const game = read('js/game.js');
  assert.match(game, /y2k|millennium/i, 'game.js must reference the Y2K clock / finale theme');
  const desktop = read('js/desktop.js');
  assert.match(desktop, /millennium/i, 'desktop.js holds the Y2K countdown helper');
});

test('offline cache bumped and lists the new files', () => {
  const sw = read('sw.js');
  assert.match(sw, /v15/, 'cache version must be bumped to v15');
  for (const f of ['js/desktop.js', 'js/desktop-ui.js', 'css/desktop.css']) {
    assert.ok(sw.includes(f), `sw.js must cache ${f}`);
  }
});
