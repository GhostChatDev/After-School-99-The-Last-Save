/* Deterministic Snake rules. No DOM, audio, storage or rendering.
   Legend: # wall . floor P start o memory * sticker K key D door E exit
   1/2 portals h/v dust bunnies G guardian S shortening spool A/B/C ordered terminals. */
(function (root) {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function parse(def) {
    const rows = def.map;
    const L = { title: def.title, w: rows[0].length, h: rows.length, grid: [], frags: [], stickers: [],
      portals: {}, bugs: [], terminals: [], start: null, exit: null, brake: def.brake === true, def: def };
    rows.forEach(function (row, y) {
      if (row.length !== L.w) throw new Error(def.title + ': row ' + y + ' has the wrong width');
      const cells = [];
      for (let x = 0; x < row.length; x++) {
        let c = row[x];
        if (c === 'P') { L.start = [x, y]; c = '.'; }
        else if (c === 'h' || c === 'v') { L.bugs.push({ x, y, dx: c === 'h' ? 1 : 0, dy: c === 'v' ? 1 : 0, kind: 'dust' }); c = '.'; }
        else if (c === 'G') { L.bugs.push({ x, y, dx: 1, dy: 0, warning: false, kind: 'guardian' }); c = '.'; }
        else if (c === 'o') L.frags.push([x, y]);
        else if (c === '*') L.stickers.push([x, y]);
        else if (c === '1' || c === '2') L.portals[c] = [x, y];
        else if (c === 'A' || c === 'B' || c === 'C') L.terminals.push({ x, y, order: c.charCodeAt(0) - 65 });
        else if (c === 'E') L.exit = [x, y];
        cells.push(c);
      }
      L.grid.push(cells);
    });
    L.terminals.sort((a, b) => a.order - b.order);
    if (!L.start || !L.exit) throw new Error(def.title + ': needs P and E');
    if (L.stickers.length > 3) throw new Error(def.title + ': at most three stickers');
    return L;
  }

  function cell(L, x, y) { return x < 0 || y < 0 || x >= L.w || y >= L.h ? '#' : L.grid[y][x]; }
  function newGame(L) {
    return { L, body: [L.start.slice()], mask: 0, stars: 0, got: 0, total: L.frags.length,
      hasKey: false, term: 0, brake: 100, braking: false,
      bugs: L.bugs.map(b => Object.assign({}, b, { px: b.x, py: b.y, warning: false, nextX: b.x + b.dx, nextY: b.y + b.dy })),
      status: 'play', cause: '', events: [], moves: 0 };
  }
  function blockedForBug(L, x, y) { const c = cell(L, x, y); return c === '#' || c === 'D' || c === 'E'; }

  // Brake changes rendering cadence, never collision rules. One held move costs 12 charge;
  // a normal move restores 5. Empty charge simply returns to normal speed on the next tick.
  function step(s, dirName, brakeHeld) {
    if (s.status !== 'play') return s;
    const L = s.L, d = DIRS[dirName], head = s.body[0];
    let nx = head[0] + d[0], ny = head[1] + d[1];
    if (!d || (s.body.length > 1 && s.body[1][0] === nx && s.body[1][1] === ny)) return s;
    const n = Object.assign({}, s, { events: [], moves: s.moves + 1 });
    n.braking = L.brake && brakeHeld === true && s.brake > 0;
    n.brake = clamp(s.brake + (n.braking ? -12 : 5), 0, 100);
    const die = cause => { n.status = 'dead'; n.cause = cause; n.events.push('die'); return n; };
    const c = cell(L, nx, ny);
    if (c === '#') return die('wall');
    if (c === 'D' && !s.hasKey) return die('door');
    if (c === 'E' && (s.got < s.total || s.term < L.terminals.length)) return die('gate');
    if (c === '1' || c === '2') { const o = L.portals[c === '1' ? '2' : '1']; nx = o[0]; ny = o[1]; n.events.push('portal'); }
    const fi = L.frags.findIndex(f => f[0] === nx && f[1] === ny);
    const ate = fi >= 0 && !(s.mask & (1 << fi));
    const last = s.body.length - (ate ? 1 : 2);
    for (let i = 0; i <= last; i++) if (s.body[i][0] === nx && s.body[i][1] === ny) return die('self');
    n.body = [[nx, ny]].concat(s.body);
    if (!ate) n.body.pop();
    if (ate) { n.mask = s.mask | (1 << fi); n.got = s.got + 1; n.events.push(n.got === n.total ? 'last' : 'frag'); }
    const si = L.stickers.findIndex(f => f[0] === nx && f[1] === ny);
    if (si >= 0 && !(s.stars & (1 << si))) { n.stars = s.stars | (1 << si); n.events.push('star'); }
    if (cell(L, nx, ny) === 'K' && !s.hasKey) { n.hasKey = true; n.events.push('key'); }
    if (cell(L, nx, ny) === 'S' && n.body.length > 3) { n.body = n.body.slice(0, Math.max(3, n.body.length - 2)); n.events.push('spool'); }
    const ti = L.terminals.findIndex(t => t.x === nx && t.y === ny);
    if (ti >= 0 && ti === s.term) { n.term = s.term + 1; n.events.push('terminal'); }
    else if (ti >= 0 && ti > s.term) n.events.push('wrong');
    if (cell(L, nx, ny) === 'E') { n.status = 'won'; n.events.push('win'); return n; }
    n.bugs = s.bugs.map(b => moveBug(L, b));
    for (const b of n.bugs) {
      if (b.x === nx && b.y === ny) return die(b.kind === 'guardian' ? 'guardian' : 'dust');
      if (b.px === nx && b.py === ny && b.x === head[0] && b.y === head[1]) return die(b.kind === 'guardian' ? 'guardian' : 'dust');
    }
    return n;
  }

  function moveBug(L, b) {
    const o = Object.assign({}, b, { px: b.x, py: b.y });
    if (o.kind !== 'guardian') {
      let tx = o.x + o.dx, ty = o.y + o.dy;
      if (blockedForBug(L, tx, ty)) {
        o.dx = -o.dx; o.dy = -o.dy; tx = o.x + o.dx; ty = o.y + o.dy;
        if (blockedForBug(L, tx, ty)) { tx = o.x; ty = o.y; }
      }
      o.nextX = tx; o.nextY = ty; o.x = tx; o.y = ty; o.warning = false;
      return o;
    }
    // Guardian alternates between one stationary warning tick and one sweep.
    // The destination is visible before it moves; its sweep period is 1600 ms at 200 ms/tick.
    if (!b.warning) {
      o.warning = true; o.nextX = b.x + b.dx * b.sweep; o.nextY = b.y + b.dy * b.sweep;
      return o;
    }
    o.warning = false; o.x += b.dx * 2; o.y += b.dy * 2;
    if (blockedForBug(L, o.x + o.dx * 2, o.y + o.dy * 2)) { o.dx = -b.dx; o.dy = -b.dy; }
    o.nextX = o.x + o.dx * o.sweep; o.nextY = o.y + o.dy * o.sweep;
    return o;
  }

  function key(s) {
    return s.body.map(p => p.join(',')).join(';') + '|' + s.mask + '|' + s.stars + '|' + s.term + (s.hasKey ? 'k' : '') +
      '|' + s.bugs.map(b => b.x + ',' + b.y + ',' + b.dx + b.dy + ',' + (b.warning ? 1 : 0)).join(';');
  }
  function solve(L, limit) {
    limit = limit || 400000;
    const start = newGame(L), seen = new Set([key(start)]), queue = [[start, -1, null]];
    for (let i = 0; i < queue.length && queue.length < limit; i++) {
      const s = queue[i][0];
      for (const dn of Object.keys(DIRS)) {
        const t = step(s, dn);
        if (t === s || t.status === 'dead') continue;
        if (t.status === 'won') {
          const path = [dn];
          for (let j = i; queue[j][1] !== -1; j = queue[j][1]) path.push(queue[j][2]);
          return path.reverse();
        }
        const k = key(t);
        if (!seen.has(k)) { seen.add(k); queue.push([t, i, dn]); }
      }
    }
    return null;
  }
  const api = { DIRS, parse, cell, newGame, step, solve, key, moveBug };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Logic = api;
})(typeof self !== 'undefined' ? self : this);
