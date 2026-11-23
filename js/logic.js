/* Pure deterministic grid rules. The renderer and tests both use this file.
   # wall  x spike  P start  o memory  K key  D door  E exit  1/2 portals
   h/v dust  G phase gate  s echo switch  a anchor pad  A anchored door */
(function (root) {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function parse(def) {
    const rows = def.map;
    const L = { title: def.title, w: rows[0].length, h: rows.length, grid: [], frags: [], portals: {}, bugs: [], start: null, exit: null, echoSwitches: [], anchorPads: [], def: def };
    rows.forEach(function (row, y) {
      if (row.length !== L.w) throw new Error(def.title + ': row ' + y + ' has the wrong width');
      const cells = [];
      for (let x = 0; x < row.length; x++) {
        let c = row[x];
        if (c === 'P') { if (L.start) throw new Error(def.title + ': more than one start'); L.start = [x, y]; c = '.'; }
        else if (c === 'h') { L.bugs.push({ x: x, y: y, dx: 1, dy: 0 }); c = '.'; }
        else if (c === 'v') { L.bugs.push({ x: x, y: y, dx: 0, dy: 1 }); c = '.'; }
        else if (c === 'o') L.frags.push([x, y]);
        else if (c === '1' || c === '2') L.portals[c] = [x, y];
        else if (c === 'E') { if (L.exit) throw new Error(def.title + ': more than one exit'); L.exit = [x, y]; }
        else if (c === 's') L.echoSwitches.push([x, y]);
        else if (c === 'a') L.anchorPads.push([x, y]);
        else if (!'#.xKDEAG'.includes(c)) throw new Error(def.title + ': unknown map symbol ' + c);
        cells.push(c);
      }
      L.grid.push(cells);
    });
    if (!L.start || !L.exit) throw new Error(def.title + ': needs P and E');
    if (L.frags.length > 30) throw new Error(def.title + ': too many memory sparks');
    if (Object.keys(L.portals).length === 1) throw new Error(def.title + ': portal needs a pair');
    return L;
  }

  function cell(L, x, y) { return x < 0 || y < 0 || x >= L.w || y >= L.h ? '#' : L.grid[y][x]; }
  function same(a, b) { return !!a && a[0] === b[0] && a[1] === b[1]; }
  function newGame(L) {
    return { L: L, body: [L.start.slice()], mask: 0, got: 0, total: L.frags.length, hasKey: false,
      bugs: L.bugs.map(b => ({ x: b.x, y: b.y, dx: b.dx, dy: b.dy, px: b.x, py: b.y })),
      status: 'play', cause: '', events: [], moves: 0,
      brake: 100, braking: false, phase: 1, phaseArmed: false,
      echoRecording: false, echoRoute: [], echoGhost: null, echoActive: false,
      anchor: null, turn: 0 };
  }

  // Abilities are explicit actions, never hidden automatic changes.
  function ability(s, name) {
    if (s.status !== 'play') return s;
    const n = Object.assign({}, s, { events: [] });
    if (name === 'brake' && s.brake > 0) n.braking = !s.braking;
    else if (name === 'phase' && s.phase > 0) n.phaseArmed = !s.phaseArmed;
    else if (name === 'anchor') {
      if (s.anchor) n.anchor = null;
      else {
        const p = s.body[0];
        if (!same(cell(s.L, p[0], p[1]), 'a')) return s;
        n.anchor = p.slice();
      }
    } else if (name === 'echo') {
      if (s.echoRecording) {
        n.echoRecording = false;
        n.echoActive = false;
        if (s.echoRoute.length) { n.echoGhost = s.body[0].slice(); n.echoPlayback = s.echoRoute.slice(); n.echoCursor = 0; }
      } else {
        if (echoAtSwitch(s.L, s.body[0])) { n.echoActive = true; n.events.push('echoOn'); }
        else { n.echoRecording = true; n.echoRoute = []; n.echoGhost = null; n.echoPlayback = null; n.echoActive = false; }
      }
    } else return s;
    n.events.push(name);
    return n;
  }

  function blockedForBug(L, x, y) { const c = cell(L, x, y); return '#xDEGA'.includes(c); }
  function echoAtSwitch(L, p) { return L.echoSwitches.some(q => same(p, q)); }

  // Exact original movement rules retained for the twelve published missions.
  function legacyStep(s, dirName) {
    if (s.status !== 'play') return s;
    const L = s.L, d = DIRS[dirName], head = s.body[0];
    let nx = head[0] + d[0], ny = head[1] + d[1];
    if (s.body.length > 1 && same(s.body[1], [nx, ny])) return s;
    const n = Object.assign({}, s, { events: [], moves: s.moves + 1 });
    const die = cause => { n.status = 'dead'; n.cause = cause; n.events.push('die'); return n; };
    const c = cell(L, nx, ny);
    if (c === '#') return die('wall');
    if (c === 'x') return die('spike');
    if (c === 'D' && !s.hasKey) return die('door');
    if (c === 'E' && s.got < s.total) return die('gate');
    if (c === '1' || c === '2') { const o = L.portals[c === '1' ? '2' : '1']; nx = o[0]; ny = o[1]; }
    const fi = L.frags.findIndex(f => same(f, [nx, ny]));
    const ate = fi >= 0 && !(s.mask & (1 << fi));
    const last = s.body.length - (ate ? 1 : 2);
    for (let i = 0; i <= last; i++) if (same(s.body[i], [nx, ny])) return die('self');
    n.body = [[nx, ny]].concat(s.body);
    if (!ate) n.body.pop();
    if (ate) { n.mask = s.mask | (1 << fi); n.got = s.got + 1; }
    if (cell(L, nx, ny) === 'K' && !s.hasKey) n.hasKey = true;
    if (cell(L, nx, ny) === 'E') { n.status = 'won'; return n; }
    n.bugs = s.bugs.map(b => {
      const o = { x: b.x, y: b.y, dx: b.dx, dy: b.dy };
      let tx = o.x + o.dx, ty = o.y + o.dy;
      if (blockedForBug(L, tx, ty)) { o.dx = -o.dx; o.dy = -o.dy; tx = o.x + o.dx; ty = o.y + o.dy; }
      if (blockedForBug(L, tx, ty)) { tx = o.x; ty = o.y; }
      o.px = b.x; o.py = b.y; o.x = tx; o.y = ty;
      return o;
    });
    for (const b of n.bugs) if ((b.x === nx && b.y === ny) || (b.px === nx && b.py === ny && b.x === head[0] && b.y === head[1])) return die('dust');
    return n;
  }
  function legacyKey(s) { return s.body.map(p => p.join(',')).join(';') + '|' + s.mask + (s.hasKey ? 'k' : '') + '|' + s.bugs.map(b => b.x + ',' + b.y + ',' + b.dx + b.dy).join(';'); }

  function step(s, dirName, legacy) {
    if (legacy) return legacyStep(s, dirName);
    if (s.status !== 'play') return s;
    const L = s.L, d = DIRS[dirName];
    if (!d) return s;
    const head = s.body[0];
    let nx = head[0] + d[0], ny = head[1] + d[1];
    if (s.body.length > 1 && same(s.body[1], [nx, ny])) return s;
    const n = Object.assign({}, s, { events: [], moves: s.moves + 1, turn: s.turn + 1 });
    const die = cause => { n.status = 'dead'; n.cause = cause; n.events.push('die'); return n; };
    const c = cell(L, nx, ny);
    if (c === '#') return die('wall');
    if (c === 'x') return die('spike');
    if (c === 'D' && !s.hasKey) return die('door');
    if (c === 'G') {
      if (!s.phaseArmed || s.phase < 1) return die('phase');
      n.phase = 0; n.phaseArmed = false; n.events.push('phaseUsed');
    }
    if (c === 'A' && !s.anchor) return die('anchor');
    if (c === 'E' && (s.got < s.total || (L.echoSwitches.length && !s.echoActive))) return die('gate');
    if (c === '1' || c === '2') { const o = L.portals[c === '1' ? '2' : '1']; nx = o[0]; ny = o[1]; n.events.push('portal'); }
    const fi = L.frags.findIndex(f => same(f, [nx, ny]));
    const ate = fi >= 0 && !(s.mask & (1 << fi));
    // Moving into the departing tail is legal; growth leaves the tail in place.
    const last = legacy ? s.body.length - (ate ? 0 : 1) : s.body.length - (ate ? 1 : 2);
    for (let i = 0; i <= last; i++) if (same(s.body[i], [nx, ny])) return die('self');
    n.body = [[nx, ny]].concat(s.body);
    if (!ate) n.body.pop();
    if (ate) {
      n.mask = s.mask | (1 << fi); n.got = s.got + 1; n.phase = 1;
      n.events.push(n.got === n.total ? 'last' : 'frag');
    }
    if (cell(L, nx, ny) === 'K' && !s.hasKey) { n.hasKey = true; n.events.push('key'); }
    if (s.echoRecording) n.echoRoute = s.echoRoute.concat(dirName).slice(-16);
    if (s.echoGhost && s.echoCursor < s.echoPlayback.length) {
      const ed = DIRS[s.echoPlayback[s.echoCursor]];
      n.echoGhost = [s.echoGhost[0] + ed[0], s.echoGhost[1] + ed[1]];
      n.echoCursor = s.echoCursor + 1;
      if (echoAtSwitch(L, n.echoGhost)) { n.echoActive = true; n.events.push('echoOn'); }
    }
    n.brake = Math.max(0, Math.min(100, s.brake + (s.braking ? -12 : 4)));
    if (!n.brake) n.braking = false;
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
    // An Echo switch opens the exit on the same tick Pip enters it.
    if (cell(L, nx, ny) === 'E') {
      if (n.got < n.total || (L.echoSwitches.length && !n.echoActive)) return die('gate');
      n.status = 'won'; n.events.push('win');
    }
    return n;
  }

  function key(s) {
    return s.body.map(p => p.join(',')).join(';') + '|' + s.mask + (s.hasKey ? 'k' : '') +
      '|' + s.bugs.map(b => [b.x,b.y,b.dx,b.dy].join(',')).join(';') +
      '|' + [s.phase, s.phaseArmed ? 1 : 0, s.echoRecording ? 1 : 0,
        s.echoActive ? s.echoRoute.join('.') : '', s.echoActive && s.echoGhost ? s.echoGhost.join(',') : '', s.echoActive ? s.echoCursor || 0 : 0,
        s.echoActive ? 1 : 0, s.anchor ? s.anchor.join(',') : ''].join('|');
  }

  function actions(s, options) {
    const dirs = Object.keys(DIRS);
    if (!options) return dirs;
    const out = dirs.map(d => ({ kind: 'step', value: d }));
    // Do not explore irrelevant ability toggles in ordinary missions.
    if (s.L.grid.some(row => row.includes('G')) && s.phase && !s.phaseArmed && ability(s, 'phase') !== s) out.push({ kind: 'ability', value: 'phase' });
    if (s.L.echoSwitches.length && ability(s, 'echo') !== s) out.push({ kind: 'ability', value: 'echo' });
    if ((s.L.anchorPads.length || s.L.grid.some(row => row.includes('A'))) && ability(s, 'anchor') !== s) out.push({ kind: 'ability', value: 'anchor' });
    return out;
  }

  // Campaign validation uses solveActions.
  function findRoute(L, limit, useAbilities) {
    limit = limit || 400000;
    const start = newGame(L), stateKey = useAbilities ? key : legacyKey, seen = new Set([stateKey(start)]), queue = [[start, -1, null]];
    for (let i = 0; i < queue.length && queue.length < limit; i++) {
      const s = queue[i][0];
      for (const a of useAbilities ? actions(s, true) : actions(s)) {
        const t = typeof a === 'string' ? legacyStep(s, a) : a.kind === 'step' ? step(s, a.value, false) : ability(s, a.value);
        if (t === s || t.status === 'dead') continue;
        if (t.status === 'won') {
          const path = [a];
          for (let j = i; queue[j][1] !== -1; j = queue[j][1]) path.push(queue[j][2]);
          return path.reverse();
        }
        const k = stateKey(t);
        if (!seen.has(k)) { seen.add(k); queue.push([t, i, a]); }
      }
    }
    return null;
  }
  function solve(L, limit) { return findRoute(L, limit, false); }
  function solveActions(L, limit) { return findRoute(L, limit, true); }

  const api = { DIRS, parse, cell, newGame, step, ability, solve, solveActions, key, actions };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Logic = api;
})(typeof self !== 'undefined' ? self : this);
