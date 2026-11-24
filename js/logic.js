/* Pure game rules (no DOM): used by the game and by the solvability tests.
   Map legend: # wall . floor P start o memory K key D door E exit 1 2 portals x corrupt sector
   Enemies:  h v  dust bunnies: patrol a straight line, turn round at walls (every move)
             g    glitch: hunts Pip. Every second move it steps one square toward Pip's head; Pip's body blocks it
             r    virus: crawls along the walls (keeps a wall on its left), every move
   Every enemy is predictable (no randomness), so the tests can prove each mission can be won. */
(function (root) {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const ORDER = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // clockwise: up, right, down, left

  function parse(def) {
    const rows = def.map;
    const L = { title: def.title, w: rows[0].length, h: rows.length, grid: [], frags: [], portals: {}, bugs: [], start: null, exit: null, def: def };
    rows.forEach(function (row, y) {
      if (row.length !== L.w) throw new Error(def.title + ': row ' + y + ' has the wrong width');
      const cells = [];
      for (let x = 0; x < row.length; x++) {
        let c = row[x];
        if (c === 'P') { L.start = [x, y]; c = '.'; }
        else if (c === 'h') { L.bugs.push({ kind: 'dust', x: x, y: y, dx: 1, dy: 0 }); c = '.'; }
        else if (c === 'v') { L.bugs.push({ kind: 'dust', x: x, y: y, dx: 0, dy: 1 }); c = '.'; }
        else if (c === 'g') { L.bugs.push({ kind: 'glitch', x: x, y: y, dx: 0, dy: 0 }); c = '.'; }
        else if (c === 'r') { L.bugs.push({ kind: 'virus', x: x, y: y, dx: 1, dy: 0 }); c = '.'; }
        else if (c === 'o') L.frags.push([x, y]);
        else if (c === '1' || c === '2') L.portals[c] = [x, y];
        else if (c === 'E') L.exit = [x, y];
        cells.push(c);
      }
      L.grid.push(cells);
    });
    if (!L.start || !L.exit) throw new Error(def.title + ': needs P and E');
    if (('1' in L.portals) !== ('2' in L.portals)) throw new Error(def.title + ': portals come in pairs');
    return L;
  }

  function cell(L, x, y) {
    return x < 0 || y < 0 || x >= L.w || y >= L.h ? '#' : L.grid[y][x];
  }

  function newGame(L) {
    return { L: L, body: [L.start.slice()], mask: 0, got: 0, total: L.frags.length, hasKey: false,
      bugs: L.bugs.map(function (b) { return { kind: b.kind, x: b.x, y: b.y, dx: b.dx, dy: b.dy, px: b.x, py: b.y }; }),
      status: 'play', cause: '', events: [], moves: 0 };
  }

  // Squares no enemy enters: walls, corrupt sectors, doors, the exit, portals and the key.
  function blockedForBug(L, x, y) { const c = cell(L, x, y); return c === '#' || c === 'x' || c === 'D' || c === 'E' || c === '1' || c === '2' || c === 'K'; }
  function onBody(body, x, y, from) { for (let i = from || 0; i < body.length; i++) if (body[i][0] === x && body[i][1] === y) return true; return false; }

  function moveDust(L, b) {
    const o = { kind: b.kind, x: b.x, y: b.y, dx: b.dx, dy: b.dy };
    let tx = o.x + o.dx, ty = o.y + o.dy;
    if (blockedForBug(L, tx, ty)) {
      o.dx = -o.dx; o.dy = -o.dy; tx = o.x + o.dx; ty = o.y + o.dy;
      if (blockedForBug(L, tx, ty)) { tx = o.x; ty = o.y; }
    }
    o.x = tx; o.y = ty;
    return o;
  }

  // The virus keeps a wall on its left: turn left if it can, else straight on, else right, else back.
  function moveVirus(L, b) {
    const o = { kind: b.kind, x: b.x, y: b.y, dx: b.dx, dy: b.dy };
    let i = ORDER.findIndex(function (d) { return d[0] === b.dx && d[1] === b.dy; });
    if (i < 0) i = 1;
    for (const turn of [3, 0, 1, 2]) {
      const d = ORDER[(i + turn) % 4];
      if (!blockedForBug(L, b.x + d[0], b.y + d[1])) { o.dx = d[0]; o.dy = d[1]; o.x = b.x + d[0]; o.y = b.y + d[1]; return o; }
    }
    return o;
  }

  // The glitch steps toward Pip's head, along the longer gap first; Pip's body and other enemies block it.
  function moveGlitch(L, b, head, body, taken) {
    const o = { kind: b.kind, x: b.x, y: b.y, dx: 0, dy: 0 };
    const gx = head[0] - b.x, gy = head[1] - b.y;
    const sx = Math.sign(gx), sy = Math.sign(gy);
    const tries = Math.abs(gx) >= Math.abs(gy) ? [[sx, 0], [0, sy]] : [[0, sy], [sx, 0]];
    for (const d of tries) {
      if (!d[0] && !d[1]) continue;
      const tx = b.x + d[0], ty = b.y + d[1];
      if (blockedForBug(L, tx, ty) || onBody(body, tx, ty, 1) || taken.has(tx + ',' + ty)) continue;
      o.dx = d[0]; o.dy = d[1]; o.x = tx; o.y = ty;
      return o;
    }
    return o;
  }

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
    if (c === 'x') return die('spike');
    if (c === 'D' && !s.hasKey) return die('door');
    if (c === 'E' && s.got < s.total) return die('gate');
    if (c === '1' || c === '2') { const o = L.portals[c === '1' ? '2' : '1']; nx = o[0]; ny = o[1]; n.events.push('portal'); }
    if (c === 'D' && s.hasKey && !s.opened) { n.opened = true; n.events.push('door'); }
    const fi = L.frags.findIndex(function (f) { return f[0] === nx && f[1] === ny; });
    const ate = fi >= 0 && !(s.mask & (1 << fi));
    const last = s.body.length - (ate ? 1 : 2); // the tail moves away unless Pip grows
    for (let i = 0; i <= last; i++) if (s.body[i][0] === nx && s.body[i][1] === ny) return die('self');
    n.body = [[nx, ny]].concat(s.body);
    if (!ate) n.body.pop();
    if (ate) { n.mask = s.mask | (1 << fi); n.got = s.got + 1; n.events.push(n.got === n.total ? 'last' : 'frag'); }
    if (cell(L, nx, ny) === 'K' && !s.hasKey) { n.hasKey = true; n.events.push('key'); }
    if (cell(L, nx, ny) === 'E') { n.status = 'won'; n.events.push('win'); return n; }
    const glitchTurn = n.moves % 2 === 0;
    const taken = new Set();
    n.bugs = s.bugs.map(function (b) {
      let o;
      if (b.kind === 'glitch') o = glitchTurn ? moveGlitch(L, b, [nx, ny], n.body, taken) : { kind: b.kind, x: b.x, y: b.y, dx: 0, dy: 0 };
      else if (b.kind === 'virus') o = moveVirus(L, b);
      else o = moveDust(L, b);
      o.px = b.x; o.py = b.y;
      taken.add(o.x + ',' + o.y);
      return o;
    });
    for (const b of n.bugs) {
      if (b.x === nx && b.y === ny) return die(b.kind);
      if (b.px === nx && b.py === ny && b.x === head[0] && b.y === head[1]) return die(b.kind);
    }
    if (n.bugs.some(function (b) { return b.kind === 'glitch' && Math.abs(b.x - nx) + Math.abs(b.y - ny) <= 2; })) n.events.push('near');
    return n;
  }

  function key(s) {
    return s.body.map(function (p) { return p[0] + ',' + p[1]; }).join(';') + '|' + s.mask + (s.hasKey ? 'k' : '') + (s.moves % 2) +
      '|' + s.bugs.map(function (b) { return b.x + ',' + b.y + ',' + b.dx + b.dy; }).join(';');
  }

  // Breadth-first search for a winning list of moves (used by the tests to prove every mission can be won).
  function solve(L, limit) {
    limit = limit || 600000;
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
