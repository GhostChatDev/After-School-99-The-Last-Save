/* Pure game rules (no DOM): used by the game and by the solvability tests.
   Map legend: # wall . floor P start o memory K key D door E exit 1 2 portals h v dust bunnies */
(function (root) {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function parse(def) {
    const rows = def.map;
    const L = { title: def.title, w: rows[0].length, h: rows.length, grid: [], frags: [], portals: {}, bugs: [], start: null, exit: null, def: def };
    rows.forEach(function (row, y) {
      if (row.length !== L.w) throw new Error(def.title + ': row ' + y + ' has the wrong width');
      const cells = [];
      for (let x = 0; x < row.length; x++) {
        let c = row[x];
        if (c === 'P') { L.start = [x, y]; c = '.'; }
        else if (c === 'h') { L.bugs.push({ x: x, y: y, dx: 1, dy: 0 }); c = '.'; }
        else if (c === 'v') { L.bugs.push({ x: x, y: y, dx: 0, dy: 1 }); c = '.'; }
        else if (c === 'o') L.frags.push([x, y]);
        else if (c === '1' || c === '2') L.portals[c] = [x, y];
        else if (c === 'E') L.exit = [x, y];
        cells.push(c);
      }
      L.grid.push(cells);
    });
    if (!L.start || !L.exit) throw new Error(def.title + ': needs P and E');
    return L;
  }

  function cell(L, x, y) {
    return x < 0 || y < 0 || x >= L.w || y >= L.h ? '#' : L.grid[y][x];
  }

  function newGame(L) {
    return { L: L, body: [L.start.slice()], mask: 0, got: 0, total: L.frags.length, hasKey: false,
      bugs: L.bugs.map(function (b) { return { x: b.x, y: b.y, dx: b.dx, dy: b.dy, px: b.x, py: b.y }; }),
      status: 'play', cause: '', events: [], moves: 0 };
  }

  function blockedForBug(L, x, y) { const c = cell(L, x, y); return c === '#' || c === 'D' || c === 'E'; }

  // One move. Returns a NEW state; returns the same object when the move is ignored (reversing into the neck).
  function step(s, dirName) {
    if (s.status !== 'play') return s;
    const L = s.L, d = DIRS[dirName], head = s.body[0];
    let nx = head[0] + d[0], ny = head[1] + d[1];
    if (s.body.length > 1 && s.body[1][0] === nx && s.body[1][1] === ny) return s;
    const n = Object.assign({}, s, { events: [], moves: s.moves + 1 });
    const die = function (cause) { n.status = 'dead'; n.cause = cause; n.events.push('die'); return n; };
    const c = cell(L, nx, ny);
    if (c === '#') return die('wall');
    if (c === 'D' && !s.hasKey) return die('door');
    if (c === 'E' && s.got < s.total) return die('gate');
    if (c === '1' || c === '2') { const o = L.portals[c === '1' ? '2' : '1']; nx = o[0]; ny = o[1]; n.events.push('portal'); }
    const fi = L.frags.findIndex(function (f) { return f[0] === nx && f[1] === ny; });
    const ate = fi >= 0 && !(s.mask & (1 << fi));
    const last = s.body.length - (ate ? 1 : 2); // the tail moves away unless Pip grows
    for (let i = 0; i <= last; i++) if (s.body[i][0] === nx && s.body[i][1] === ny) return die('self');
    n.body = [[nx, ny]].concat(s.body);
    if (!ate) n.body.pop();
    if (ate) { n.mask = s.mask | (1 << fi); n.got = s.got + 1; n.events.push(n.got === n.total ? 'last' : 'frag'); }
    if (cell(L, nx, ny) === 'K' && !s.hasKey) { n.hasKey = true; n.events.push('key'); }
    if (cell(L, nx, ny) === 'E') { n.status = 'won'; n.events.push('win'); return n; }
    n.bugs = s.bugs.map(function (b) {
      const o = { x: b.x, y: b.y, dx: b.dx, dy: b.dy };
      let tx = o.x + o.dx, ty = o.y + o.dy;
      if (blockedForBug(L, tx, ty)) {
        o.dx = -o.dx; o.dy = -o.dy; tx = o.x + o.dx; ty = o.y + o.dy;
        if (blockedForBug(L, tx, ty)) { tx = o.x; ty = o.y; }
      }
      o.px = b.x; o.py = b.y; o.x = tx; o.y = ty;
      return o;
    });
    for (const b of n.bugs) {
      if (b.x === nx && b.y === ny) return die('dust');
      if (b.px === nx && b.py === ny && b.x === head[0] && b.y === head[1]) return die('dust');
    }
    return n;
  }

  function key(s) {
    return s.body.map(function (p) { return p[0] + ',' + p[1]; }).join(';') + '|' + s.mask + (s.hasKey ? 'k' : '') +
      '|' + s.bugs.map(function (b) { return b.x + ',' + b.y + ',' + b.dx + b.dy; }).join(';');
  }

  // Restore only paths that the current rules can reproduce; malformed saves fall back to the start.
  function restore(L, moves) {
    if (typeof moves !== 'string' || moves.length > 10000 || /[^udlr]/.test(moves)) return null;
    const names = { u: 'up', d: 'down', l: 'left', r: 'right' };
    let state = newGame(L);
    for (const move of moves) {
      const next = step(state, names[move]);
      if (next === state || next.status !== 'play') return null;
      state = next;
    }
    return state;
  }

  // Breadth-first search for a winning list of moves (used by the tests to prove every mission can be won).
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

  const api = { DIRS: DIRS, parse: parse, cell: cell, newGame: newGame, step: step, solve: solve, key: key };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Logic = api;
})(typeof self !== 'undefined' ? self : this);
