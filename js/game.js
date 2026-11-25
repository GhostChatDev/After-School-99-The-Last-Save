/* AFTER SCHOOL '99: THE LAST SAVE: the game screen (drawing, animation, menus, story, input, saves).
   Rules live in js/logic.js, the campaign and story in js/missions.js, music and sound in js/audio.js.
   Everything is drawn in code on one canvas: no image files, no fonts to download. */
(function () {
  'use strict';
  const SAVE_KEY = 'as99-save-v3';
  const W = 960, H = 576, HUD = 44;
  const M = window.Missions, LOGIC = window.Logic;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- saves: progress, stars, faces and settings survive a refresh ---------- */
  const FACES = [
    { id: 'classic', name: 'Classic Pip', glyph: ':)', cost: 0 },
    { id: 'happy', name: 'After-School Joy', glyph: '^_^', cost: 6 },
    { id: 'cool', name: 'LAN Party Legend', glyph: 'B)', cost: 12 },
    { id: 'wink', name: 'Secret Keeper', glyph: ';)', cost: 18 },
    { id: 'ghost', name: 'Screensaver Ghost', glyph: 'o_o', cost: 26 },
    { id: 'crt', name: 'CRT Glow', glyph: '@_@', cost: 36 }
  ];
  function blankSave() { return { unlocked: 1, stars: 0, face: 'classic', owned: ['classic'], sound: true, crt: false, best: {}, seenOpening: false, done: false }; }
  function loadSave() {
    const base = blankSave();
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem('as99-save-v2') || 'null');
      if (data && typeof data === 'object') for (const k in base) if (data[k] !== undefined) base[k] = data[k];
    } catch (_) { /* a broken save starts fresh */ }
    if (!Array.isArray(base.owned)) base.owned = ['classic'];
    if (base.owned.indexOf('classic') < 0) base.owned.push('classic');
    if (base.owned.indexOf(base.face) < 0) base.face = 'classic';
    base.unlocked = Math.max(1, Math.min(M.missions.length, base.unlocked | 0));
    base.stars = Math.max(0, base.stars | 0);
    if (!base.best || typeof base.best !== 'object') base.best = {};
    base.crt = base.crt === true && !reduceMotion; // the CRT effect is off for reduced-motion users
    return base;
  }
  let save = loadSave();
  function store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) { /* private mode: play on */ } }

  /* ---------- DOM ---------- */
  const screen = document.getElementById('screen');
  const g = screen.getContext('2d');
  const ui = document.getElementById('ui');
  const toastBox = document.getElementById('toast');
  const soundButton = document.getElementById('soundButton');
  const audio = window.Chiptune ? window.Chiptune.create() : null;
  if (audio && !save.sound) audio.setEnabled(false);
  screen.width = W; screen.height = H;
  ui.hidden = false;
  if (soundButton) soundButton.textContent = save.sound ? '♪' : '♪̸';

  let toastTimer = 0;
  function toast(msg) {
    toastBox.textContent = msg;
    toastBox.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.classList.remove('show'); }, 2200);
  }
  const sfx = function (n) { if (audio) audio.sfx(n); };

  /* ---------- palettes: each act has its own monitor colours ---------- */
  const PALETTES = [
    { bg: '#06120c', floor: '#0b1f15', grid: '#103022', wall: '#2f7f4f', wallTop: '#55b97a', wallDark: '#174a2c', glow: '#9fe870', text: '#c8ffd0' },
    { bg: '#140d06', floor: '#21160b', grid: '#2e1f10', wall: '#a86a2c', wallTop: '#e0a050', wallDark: '#5e3812', glow: '#ffc65c', text: '#ffe6b8' },
    { bg: '#12051a', floor: '#1c0a26', grid: '#2a0f37', wall: '#6a3ca8', wallTop: '#9c6ee0', wallDark: '#341a5a', glow: '#ff6ec7', text: '#f6d8ff' }
  ];
  const actIndex = function (i) { return M.acts.reduce(function (a, x, n) { return i >= x.from ? n : a; }, 0); };

  /* ---------- game state ---------- */
  let L = null, state = null, prev = null, missionIndex = 0;
  let mode = 'boot'; // boot | title | story | intro | play | over | clear | ending | menu
  let stepAt = 0;          // when the last move happened (for the slide animation)
  const STEP_MS = 120;
  let shake = 0, flash = 0, flashColor = '#fff';
  const particles = [];
  let lastMove = 0;
  const par = {}; // the shortest winning route per mission, worked out while its intro shows

  /* ---------- drawing helpers ---------- */
  function cellSize() { return Math.floor(Math.min((W - 24) / L.w, (H - HUD - 20) / L.h)); }
  function origin(c) { return [Math.floor((W - c * L.w) / 2), HUD + Math.floor((H - HUD - c * L.h) / 2)]; }
  function text(str, x, y, size, color, align) {
    g.font = 'bold ' + size + 'px "Courier New", monospace';
    g.textAlign = align || 'left';
    g.textBaseline = 'middle';
    g.fillStyle = '#000';
    g.fillText(str, x + 2, y + 2);
    g.fillStyle = color;
    g.fillText(str, x, y);
  }
  function burst(x, y, color, n, speed) {
    if (reduceMotion) n = Math.min(n, 6);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (0.5 + Math.random()) * (speed || 2.2);
      particles.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, color: color, size: 2 + Math.random() * 3 });
    }
  }

  function drawTile(ch, x, y, c, ox, oy, t, pal) {
    const X = ox + x * c, Y = oy + y * c;
    g.fillStyle = pal.floor;
    g.fillRect(X, Y, c, c);
    g.fillStyle = pal.grid;
    g.fillRect(X, Y, c, 1); g.fillRect(X, Y, 1, c);
    if (ch === '#') {
      // A chunky bevelled block, like a 1990s folder icon wall.
      g.fillStyle = pal.wallDark; g.fillRect(X, Y, c, c);
      g.fillStyle = pal.wall; g.fillRect(X + 2, Y + 2, c - 4, c - 6);
      g.fillStyle = pal.wallTop; g.fillRect(X + 2, Y + 2, c - 4, Math.max(3, c / 6));
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X + c / 2 - 1, Y + c / 3, 2, c / 2.5);
      return;
    }
    if (ch === 'x') {
      // A corrupt sector: magenta static that never sits still.
      const n = Math.max(3, Math.floor(c / 7));
      for (let i = 0; i < n * n; i++) {
        if (((i * 7 + Math.floor(t / 90) * 13 + x * 3 + y * 5) % 5) > 1) continue;
        g.fillStyle = (i + Math.floor(t / 120)) % 3 ? '#ff2fa0' : '#8a1d78';
        g.fillRect(X + (i % n) * c / n, Y + Math.floor(i / n) * c / n, c / n, c / n);
      }
      g.strokeStyle = '#ff2fa0'; g.lineWidth = 2; g.strokeRect(X + 3, Y + 3, c - 6, c - 6);
      return;
    }
    if (ch === 'K') {
      const b = Math.sin(t / 250) * 2;
      g.fillStyle = '#ffd76e';
      g.fillRect(X + c * 0.22, Y + c * 0.34 + b, c * 0.26, c * 0.26);
      g.fillRect(X + c * 0.44, Y + c * 0.44 + b, c * 0.36, c * 0.08);
      g.fillRect(X + c * 0.66, Y + c * 0.5 + b, c * 0.06, c * 0.14);
      g.fillStyle = pal.floor; g.fillRect(X + c * 0.29, Y + c * 0.41 + b, c * 0.12, c * 0.12);
      return;
    }
    if (ch === 'D') {
      const open = state && state.hasKey;
      g.fillStyle = open ? 'rgba(201,92,158,.25)' : '#c95c9e';
      g.fillRect(X + 2, Y + 2, c - 4, c - 4);
      if (!open) { g.fillStyle = '#4a1c3c'; g.fillRect(X + c / 2 - c * 0.1, Y + c * 0.35, c * 0.2, c * 0.3); }
      return;
    }
    if (ch === '1' || ch === '2') {
      const r = c * 0.38;
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = ['#8ef', '#4ad', '#2a6'][i];
        g.lineWidth = 2;
        g.beginPath();
        g.arc(X + c / 2, Y + c / 2, r - i * (c / 9) + Math.sin(t / 200 + i) * 1.5, t / 400 + i, t / 400 + i + Math.PI * 1.5);
        g.stroke();
      }
      return;
    }
    if (ch === 'E') {
      // The floppy disk: grey and locked until every spark is in, then it glows.
      const ready = state && state.got >= state.total;
      const p = ready ? (Math.sin(t / 160) + 1) / 2 : 0;
      g.fillStyle = ready ? 'rgba(159,232,112,' + (0.25 + p * 0.35) + ')' : 'transparent';
      g.fillRect(X, Y, c, c);
      g.fillStyle = ready ? '#3b6fd8' : '#555a66';
      g.fillRect(X + c * 0.15, Y + c * 0.15, c * 0.7, c * 0.7);
      g.fillStyle = ready ? '#cfd8ea' : '#8a8f99';
      g.fillRect(X + c * 0.3, Y + c * 0.15, c * 0.38, c * 0.22);
      g.fillStyle = ready ? '#fffdf0' : '#a8acb5';
      g.fillRect(X + c * 0.24, Y + c * 0.5, c * 0.52, c * 0.3);
    }
  }

  function drawSpark(x, y, c, ox, oy, t, i) {
    const X = ox + x * c + c / 2, Y = oy + y * c + c / 2 + Math.sin(t / 280 + i) * c * 0.06;
    const r = c * (0.18 + 0.04 * Math.sin(t / 180 + i * 2));
    g.fillStyle = 'rgba(255,215,110,.25)';
    g.beginPath(); g.arc(X, Y, r * 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd76e';
    g.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + t / 900, rr = k % 2 ? r * 0.45 : r;
      g.lineTo(X + Math.cos(a) * rr, Y + Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
    g.fillStyle = '#fffbe0'; g.fillRect(X - 1.5, Y - 1.5, 3, 3);
  }

  function drawEnemy(b, c, ox, oy, t, f) {
    const x = ox + (b.px + (b.x - b.px) * f) * c + c / 2, y = oy + (b.py + (b.y - b.py) * f) * c + c / 2;
    if (b.kind === 'glitch') {
      // A knot of red static with two hungry eyes.
      for (let i = 0; i < 14; i++) {
        const a = i * 2.4 + t / 140, r = c * 0.24 + ((i * 37 + Math.floor(t / 60)) % 7) * c * 0.035;
        g.fillStyle = i % 3 ? '#ff3b3b' : '#ffe0e0';
        g.fillRect(x + Math.cos(a) * r - c * 0.08, y + Math.sin(a) * r - c * 0.08, c * 0.16, c * 0.16);
      }
      g.fillStyle = '#2a0000'; g.fillRect(x - c * 0.26, y - c * 0.26, c * 0.52, c * 0.52);
      g.fillStyle = '#fff'; g.fillRect(x - c * 0.14, y - c * 0.08, c * 0.08, c * 0.1); g.fillRect(x + c * 0.06, y - c * 0.08, c * 0.08, c * 0.1);
      return;
    }
    if (b.kind === 'virus') {
      // A little green worm with a wiggling tail.
      for (let i = 3; i >= 0; i--) {
        const wob = Math.sin(t / 120 + i) * c * 0.06;
        g.fillStyle = i ? '#3fae4b' : '#7cf06e';
        g.beginPath(); g.arc(x - b.dx * i * c * 0.15 + wob * b.dy, y - b.dy * i * c * 0.15 + wob * b.dx, c * (0.22 - i * 0.03), 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#062'; g.fillRect(x - c * 0.08, y - c * 0.06, c * 0.05, c * 0.07); g.fillRect(x + c * 0.03, y - c * 0.06, c * 0.05, c * 0.07);
      return;
    }
    // Dust bunny: a fluffy grey ball that bounces as it walks.
    const hop = Math.abs(Math.sin(t / 150 + b.x)) * c * 0.08;
    g.fillStyle = '#9aa0a8';
    for (let i = 0; i < 7; i++) { const a = i * 0.9; g.beginPath(); g.arc(x + Math.cos(a) * c * 0.16, y - hop + Math.sin(a) * c * 0.14, c * 0.14, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#d6dae0'; g.beginPath(); g.arc(x, y - hop, c * 0.2, 0, Math.PI * 2); g.fill();
    const blink = (t % 3000) > 2850;
    g.fillStyle = '#20232a';
    g.fillRect(x - c * 0.1, y - hop - c * 0.05, c * 0.06, blink ? 1 : c * 0.08);
    g.fillRect(x + c * 0.05, y - hop - c * 0.05, c * 0.06, blink ? 1 : c * 0.08);
  }

  function drawFace(x, y, r, t) {
    g.save(); g.translate(x, y);
    g.fillStyle = '#06110b'; g.strokeStyle = '#06110b'; g.lineWidth = Math.max(1.5, r / 8);
    const blink = (t % 3400) > 3250;
    const eye = function (dx) { g.fillRect(dx - r * 0.1, -r * 0.35, r * 0.2, blink ? 1.5 : r * 0.3); };
    const id = save.face;
    if (id === 'cool') { g.fillStyle = '#111'; g.fillRect(-r * 0.7, -r * 0.42, r * 1.4, r * 0.34); g.fillStyle = '#06110b'; }
    else if (id === 'wink') { eye(-r * 0.38); g.fillRect(r * 0.28, -r * 0.25, r * 0.24, r * 0.08); }
    else if (id === 'crt') { g.shadowColor = '#8ef'; g.shadowBlur = 6; eye(-r * 0.38); eye(r * 0.38); g.shadowBlur = 0; }
    else { eye(-r * 0.38); eye(r * 0.38); }
    g.beginPath();
    if (id === 'ghost') g.arc(0, r * 0.3, r * 0.22, 0, Math.PI * 2);
    else g.arc(0, r * 0.1, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
    g.restore();
  }

  function drawPip(c, ox, oy, t, f) {
    const body = state.body, old = prev ? prev.body : body;
    // Each segment slides from where it was to where it is now.
    const pos = body.map(function (p, i) {
      const q = old[Math.min(i, old.length - 1)] || p;
      const jump = Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) > 1; // a portal: no slide
      const k = jump ? 1 : f;
      return [ox + (q[0] + (p[0] - q[0]) * k) * c + c / 2, oy + (q[1] + (p[1] - q[1]) * k) * c + c / 2];
    });
    for (let i = pos.length - 1; i >= 0; i--) {
      const w = c * (i === 0 ? 0.44 : 0.36 - Math.min(0.12, i * 0.006));
      const hue = (t / 20 + i * 18) % 360;
      g.fillStyle = i === 0 ? '#b8ff9a' : 'hsl(' + (120 + Math.sin(i / 2 + t / 400) * 30) + ',70%,' + (58 - (i % 2) * 8) + '%)';
      if (save.face === 'crt' && i) g.fillStyle = 'hsl(' + hue + ',80%,65%)';
      g.fillRect(pos[i][0] - w, pos[i][1] - w, w * 2, w * 2);
      if (i < pos.length - 1) {
        g.fillRect(Math.min(pos[i][0], pos[i + 1][0]) - w * 0.8, Math.min(pos[i][1], pos[i + 1][1]) - w * 0.8,
          Math.abs(pos[i][0] - pos[i + 1][0]) + w * 1.6, Math.abs(pos[i][1] - pos[i + 1][1]) + w * 1.6);
      }
    }
    g.shadowColor = '#9fe870'; g.shadowBlur = 14;
    g.fillStyle = '#d4ffbe';
    const hw = c * 0.44;
    g.fillRect(pos[0][0] - hw, pos[0][1] - hw, hw * 2, hw * 2);
    g.shadowBlur = 0;
    drawFace(pos[0][0], pos[0][1], hw, t);
  }

  function drawHud(t, pal) {
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, HUD);
    g.fillStyle = pal.glow; g.fillRect(0, HUD - 2, W, 2);
    text('MISSION ' + (missionIndex + 1) + '/' + M.missions.length, 14, HUD / 2, 16, pal.text);
    text(L.title.toUpperCase(), W / 2, HUD / 2, 16, pal.glow, 'center');
    const keyBit = L.def.map.join('').indexOf('K') >= 0 ? (state.hasKey ? '  KEY ✓' : '  KEY …') : '';
    text('✦ ' + state.got + '/' + state.total + keyBit + '   STEPS ' + state.moves, W - 14, HUD / 2, 16, '#ffd76e', 'right');
    if (state.events.indexOf('near') >= 0 || nearGlitch()) {
      if (Math.floor(t / 250) % 2) text('! GLITCH NEAR !', W / 2, HUD + 18, 14, '#ff5a5a', 'center');
    }
  }
  function nearGlitch() {
    if (!state) return false;
    const h = state.body[0];
    return state.bugs.some(function (b) { return b.kind === 'glitch' && Math.abs(b.x - h[0]) + Math.abs(b.y - h[1]) <= 2; });
  }

  // Behind the menus: a slow field of 1990s screensaver stars.
  const stars = Array.from({ length: 90 }, function () { return [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()]; });
  function drawAttract(t) {
    g.fillStyle = '#05060d'; g.fillRect(0, 0, W, H);
    for (const s of stars) {
      s[2] -= 0.004; if (s[2] <= 0.02) { s[0] = Math.random() * 2 - 1; s[1] = Math.random() * 2 - 1; s[2] = 1; }
      const x = W / 2 + s[0] / s[2] * 220, y = H / 2 + s[1] / s[2] * 160, z = (1 - s[2]) * 3;
      g.fillStyle = 'rgba(200,230,255,' + (1 - s[2]) + ')'; g.fillRect(x, y, z, z);
    }
    // Pip curls across the screen, like the old screensaver.
    for (let i = 0; i < 18; i++) {
      const a = t / 900 - i * 0.12;
      const x = W / 2 + Math.cos(a) * 300 + Math.cos(a * 2.3) * 60, y = H / 2 + Math.sin(a * 1.3) * 150;
      g.fillStyle = i ? 'hsl(' + (120 + i * 6) + ',70%,' + (60 - i * 2) + '%)' : '#d4ffbe';
      g.fillRect(x - 9, y - 9, 18, 18);
    }
  }

  function render(t) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (!L || mode === 'title' || mode === 'boot' || mode === 'story' || mode === 'ending') { drawAttract(t); return; }
    const pal = PALETTES[actIndex(missionIndex)];
    const f = reduceMotion ? 1 : Math.min(1, (t - stepAt) / STEP_MS);
    const ease = 1 - Math.pow(1 - f, 3);
    g.fillStyle = pal.bg; g.fillRect(0, 0, W, H);
    if (shake > 0 && !reduceMotion) { g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.86; if (shake < 0.5) shake = 0; }
    const c = cellSize(), o = origin(c);
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) drawTile(L.grid[y][x], x, y, c, o[0], o[1], t, pal);
    L.frags.forEach(function (p, i) { if (!(state.mask & (1 << i))) drawSpark(p[0], p[1], c, o[0], o[1], t, i); });
    for (const b of state.bugs) drawEnemy(b, c, o[0], o[1], t, mode === 'play' ? ease : 1);
    drawPip(c, o[0], o[1], t, mode === 'play' ? ease : 1);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.025;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      g.globalAlpha = p.life; g.fillStyle = p.color; g.fillRect(p.x, p.y, p.size, p.size);
    }
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0);
    drawHud(t, pal);
    if (flash > 0) { g.globalAlpha = flash; g.fillStyle = flashColor; g.fillRect(0, 0, W, H); g.globalAlpha = 1; flash = Math.max(0, flash - 0.06); }
  }

  /* ---------- panels (title, story, menus) drawn as page elements over the screen ---------- */
  let typing = null;
  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function panel(title, lines, buttons, opts) {
    stopTyping();
    ui.innerHTML = '';
    const p = el('div', 'panel' + (opts && opts.wide ? ' wide' : ''));
    if (title) p.appendChild(el('h2', '', title));
    const box = el('div', 'panel-text');
    p.appendChild(box);
    if (lines && lines.length) {
      if (opts && opts.type && !reduceMotion) typeLines(box, lines);
      else for (const line of lines) box.appendChild(el('p', '', line));
    }
    if (opts && opts.extra) p.appendChild(opts.extra);
    const row = el('div', 'panel-actions');
    buttons.forEach(function (b, i) {
      const btn = el('button', (i === 0 ? 'primary ' : '') + (i === 0 ? 'selected' : ''), b[0]);
      btn.type = 'button';
      btn.addEventListener('click', function () { sfx('select'); b[1](); });
      row.appendChild(btn);
    });
    p.appendChild(row);
    ui.appendChild(p);
    ui.hidden = false;
  }
  function hidePanel() { stopTyping(); ui.innerHTML = ''; ui.hidden = true; }
  function typeLines(box, lines) {
    let li = 0, ci = 0, p = el('p', 'typing');
    box.appendChild(p);
    typing = setInterval(function () {
      if (li >= lines.length) { stopTyping(); return; }
      ci++;
      p.textContent = lines[li].slice(0, ci);
      if (ci % 2) sfx('type');
      if (ci >= lines[li].length) { li++; ci = 0; if (li < lines.length) { p.classList.remove('typing'); p = el('p', 'typing'); box.appendChild(p); } }
    }, 28);
    box.dataset.full = JSON.stringify(lines);
  }
  function stopTyping() {
    if (!typing) return;
    clearInterval(typing); typing = null;
    const box = ui.querySelector('.panel-text');
    if (box && box.dataset.full) { box.innerHTML = ''; for (const line of JSON.parse(box.dataset.full)) box.appendChild(el('p', '', line)); }
  }
  // Arrows move the highlight between a panel's buttons; A (or Enter) presses it.
  function panelButtons() { return Array.prototype.slice.call(ui.querySelectorAll('.panel button:not(:disabled)')); }
  function moveHighlight(d) {
    const bs = panelButtons(); if (!bs.length) return false;
    let i = bs.findIndex(function (b) { return b.classList.contains('selected'); });
    bs.forEach(function (b) { b.classList.remove('selected'); });
    i = ((i < 0 ? 0 : i + d) + bs.length) % bs.length;
    bs[i].classList.add('selected'); bs[i].focus({ preventScroll: true });
    sfx('move');
    return true;
  }
  function pressHighlight() {
    if (typing) { stopTyping(); return true; }
    const b = ui.querySelector('.panel button.selected') || panelButtons()[0];
    if (b) { b.click(); return true; }
    return false;
  }

  /* ---------- screens ---------- */
  function boot() {
    mode = 'boot';
    panel('FC-99 TURBO BIOS v1.02', ['Memory test: 65536K OK', 'Detecting drives... C: 2.1 GB', 'Loading PIP.EXE', 'PRESS START'], [['START', start], ['HOW TO PLAY', help]], { type: true });
  }
  function start() {
    sfx('boot');
    if (audio) audio.play('title');
    if (!save.seenOpening) { story(); return; }
    title();
  }
  function story() {
    mode = 'story';
    save.seenOpening = true; store();
    panel('NOV 23, 1999', M.opening, [['BEGIN', function () { title(); }], ['SKIP', title]], { type: true, wide: true });
  }
  function title() {
    mode = 'title';
    if (audio) audio.play('title');
    const buttons = [];
    if (save.unlocked > 1 && !save.done) buttons.push(['CONTINUE: MISSION ' + save.unlocked, function () { intro(save.unlocked - 1); }]);
    buttons.push([save.unlocked > 1 ? 'NEW GAME' : 'START', function () { intro(0); }]);
    buttons.push(['MISSIONS', missions]);
    buttons.push(['FACE CLOSET', closet]);
    buttons.push(['THE STORY', story]);
    panel("AFTER SCHOOL '99", ['THE LAST SAVE', '✦ ' + save.stars + ' stars'], buttons);
  }
  function missions() {
    mode = 'title';
    const grid = el('div', 'mission-grid');
    M.missions.forEach(function (m, i) {
      const b = el('button', i === save.unlocked - 1 ? 'current' : '', (i + 1) + (save.best[i] ? ' ✓' : ''));
      b.type = 'button'; b.title = m.title; b.disabled = i >= save.unlocked;
      b.setAttribute('aria-label', 'Mission ' + (i + 1) + ': ' + m.title + (i >= save.unlocked ? ' (locked)' : ''));
      b.addEventListener('click', function () { sfx('select'); intro(i); });
      grid.appendChild(b);
    });
    panel('MISSIONS', ['Finished missions show ✓. Pick any unlocked one.'], [['BACK', title]], { extra: grid });
  }
  function closet() {
    const row = el('div', 'closet-row');
    FACES.forEach(function (fc) {
      const own = save.owned.indexOf(fc.id) >= 0;
      const b = el('button', 'closet-card' + (save.face === fc.id ? ' current' : ''));
      b.type = 'button';
      b.appendChild(el('span', 'glyph', fc.glyph));
      b.appendChild(el('span', 'name', fc.name));
      b.appendChild(el('span', 'cost', own ? (save.face === fc.id ? 'WEARING' : 'OWNED') : fc.cost + ' ✦'));
      b.addEventListener('click', function () {
        if (own) { save.face = fc.id; store(); sfx('select'); toast(fc.name + ' on'); closet(); return; }
        if (save.stars < fc.cost) { sfx('back'); toast('Need ' + (fc.cost - save.stars) + ' more stars'); return; }
        save.stars -= fc.cost; save.owned.push(fc.id); save.face = fc.id; store(); sfx('buy'); toast(fc.name + ' unlocked!'); closet();
      });
      row.appendChild(b);
    });
    panel('FACE CLOSET', ['Stars: ✦ ' + save.stars + '. Earn stars by clearing missions in few steps.'], [['BACK', title]], { extra: row });
  }
  function intro(i) {
    missionIndex = i;
    L = LOGIC.parse(M.missions[i]);
    state = LOGIC.newGame(L); prev = null;
    mode = 'intro';
    const act = M.actOf(i);
    const firstOfAct = M.acts.some(function (a) { return a.from === i; });
    if (firstOfAct) sfx('act');
    if (audio) audio.play(audio.songFor(i, M.missions.length));
    const lines = (firstOfAct ? [act.title + ': ' + act.line] : []).concat([M.missions[i].intro]);
    panel((i + 1) + '. ' + M.missions[i].title.toUpperCase(), lines, [['PLAY', play], ['MENU', title]], { type: true });
    if (!(i in par)) setTimeout(function () { if (!(i in par)) par[i] = (LOGIC.solve(LOGIC.parse(M.missions[i]), 300000) || []).length || 0; }, 400);
  }
  function play() { hidePanel(); mode = 'play'; stepAt = performance.now(); screen.focus({ preventScroll: true }); }
  function restart() { intro(missionIndex); play(); }
  function pause() {
    if (mode !== 'play') return false;
    mode = 'menu';
    panel('PAUSED', [(missionIndex + 1) + '. ' + L.title + '  ✦ ' + state.got + '/' + state.total],
      [['RESUME', play], ['RESTART', restart], ['MISSIONS', missions], ['SOUND: ' + (save.sound ? 'ON' : 'OFF'), function () { toggleSound(); pause(); }], ['QUIT TO TITLE', title]]);
    return true;
  }
  const CAUSES = { wall: 'Pip bumped into a folder wall.', spike: 'A corrupt sector scrambled Pip.', door: 'The door is locked: find the key first.',
    gate: 'The floppy only opens once every spark is collected.', self: 'Pip tied itself in a knot.', dust: 'A dust bunny got in the way.',
    glitch: 'The glitch caught Pip.', virus: 'The virus crawled into Pip.' };
  function over() {
    mode = 'over';
    sfx('die'); shake = 18; flash = 0.6; flashColor = '#ff2f5a';
    const h = state.body[0], c = cellSize(), o = origin(c);
    burst(o[0] + h[0] * c + c / 2, o[1] + h[1] * c + c / 2, '#ff6e6e', 40, 3.5);
    setTimeout(function () {
      panel('SIGNAL LOST', [CAUSES[state.cause] || 'Pip lost the signal.', 'The last save remains. Try again?'], [['TRY AGAIN', restart], ['MENU', title]]);
    }, reduceMotion ? 0 : 650);
  }
  function clear() {
    mode = 'clear';
    sfx('win'); flash = 0.5; flashColor = '#d4ffbe';
    const i = missionIndex;
    const best = par[i] || state.moves;
    const earned = 2 + state.total + (state.moves <= best + 4 ? 3 : state.moves <= best * 1.5 ? 1 : 0);
    const first = !save.best[i];
    save.stars += earned;
    save.best[i] = Math.min(save.best[i] || Infinity, state.moves);
    if (i + 1 < M.missions.length) save.unlocked = Math.max(save.unlocked, i + 2);
    store();
    const card = el('div', 'memory-card');
    card.appendChild(el('h3', '', 'MEMORY SAVED'));
    card.appendChild(el('p', '', M.missions[i].outro));
    const lines = ['✦ +' + earned + ' stars' + (state.moves <= best + 4 ? '  PERFECT ROUTE!' : '') + '   steps ' + state.moves + (par[i] ? ' (shortest route ' + par[i] + ')' : '') + (first ? '' : '   best ' + save.best[i])];
    const last = i === M.missions.length - 1;
    setTimeout(function () {
      panel('MISSION CLEAR', lines, last ? [['THE LAST SAVE', ending]] : [['NEXT MISSION', function () { intro(i + 1); }], ['REPLAY', restart], ['MENU', title]], { extra: card });
    }, reduceMotion ? 0 : 500);
  }
  function ending() {
    mode = 'ending'; save.done = true; store();
    if (audio) audio.play('ending');
    panel('11:59 PM', M.ending, [['TITLE', title]], { type: true, wide: true });
  }

  /* ---------- moving ---------- */
  function move(dir) {
    if (mode !== 'play') return false;
    const now = performance.now();
    if (now - lastMove < 70) return true; // one press, one step
    lastMove = now;
    const next = LOGIC.step(state, dir);
    if (next === state) return true; // reversing into the neck: ignored
    prev = state; state = next; stepAt = now;
    const c = cellSize(), o = origin(c), h = state.body[0];
    const hx = o[0] + h[0] * c + c / 2, hy = o[1] + h[1] * c + c / 2;
    const ev = state.events;
    if (ev.indexOf('frag') >= 0) { sfx('collect'); burst(hx, hy, '#ffd76e', 18); }
    else if (ev.indexOf('last') >= 0) { sfx('last'); burst(hx, hy, '#ffd76e', 30, 3); flash = 0.25; flashColor = '#ffd76e'; toast('All sparks! The floppy is open.'); }
    else if (ev.indexOf('key') >= 0) { sfx('key'); burst(hx, hy, '#ffd76e', 14); toast('Key found: the door opens.'); }
    else if (ev.indexOf('door') >= 0) sfx('door');
    else if (ev.indexOf('portal') >= 0) { sfx('portal'); burst(hx, hy, '#8ef', 20); flash = 0.2; flashColor = '#8ef'; }
    else sfx('step');
    if (ev.indexOf('near') >= 0) sfx('near');
    if (audio) audio.setTension(nearGlitch());
    if (state.status === 'dead') over();
    else if (state.status === 'won') clear();
    return true;
  }

  function toggleSound() {
    save.sound = !save.sound; store();
    if (audio) { audio.setEnabled(save.sound); if (save.sound) audio.play(mode === 'play' || mode === 'intro' ? audio.songFor(missionIndex, M.missions.length) : 'title'); }
    if (soundButton) soundButton.textContent = save.sound ? '♪' : '♪̸';
    toast('Sound ' + (save.sound ? 'on' : 'off'));
  }
  function help() {
    if (mode === 'play') mode = 'menu';
    panel('HOW TO PLAY', ['Move Pip one square at a time: arrow keys, WASD, swipe, or the pad below.',
      'Collect every ✦ spark, then reach the floppy disk. Every spark makes Pip longer, and Pip cannot cross itself.',
      'Dust bunnies walk in lines. Viruses crawl along walls. Glitches hunt you every second step, but your tail blocks them.',
      'A: select. P or Esc: pause. R: restart the mission.'], [[mode === 'menu' && L ? 'RESUME' : 'OK', function () { if (mode === 'menu' && L) play(); else title(); }]], { wide: true });
  }

  /* ---------- input: keyboard, the pad (mouse, finger, held down), swipes ---------- */
  const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  function direction(dir) {
    if (move(dir)) return;
    if (!ui.hidden) moveHighlight(dir === 'up' || dir === 'left' ? -1 : 1);
  }
  function action() {
    if (mode === 'boot' && ui.hidden) { boot(); return; }
    pressHighlight();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (!pause() && mode === 'menu') play(); e.preventDefault(); return; }
    if ((e.key === 'r' || e.key === 'R') && mode === 'play') { restart(); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON' && !ui.contains(document.activeElement)) return;
      e.preventDefault(); action(); return;
    }
    const dir = KEYS[e.key];
    if (dir) { e.preventDefault(); if (e.repeat && mode !== 'play') return; direction(dir); }
  });
  // Pad buttons: a finger or a mouse press moves at once, holding repeats; keyboard activation (click with no pointer) too.
  let holdTimer = 0, holdRepeat = 0;
  function releaseHold() { clearTimeout(holdTimer); clearInterval(holdRepeat); holdTimer = holdRepeat = 0; }
  document.querySelectorAll('[data-move]').forEach(function (b) {
    const dir = b.getAttribute('data-move');
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault(); direction(dir); releaseHold();
      holdTimer = setTimeout(function () { holdRepeat = setInterval(function () { if (mode === 'play') move(dir); }, 150); }, 300);
    });
    b.addEventListener('click', function (e) { if (e.detail === 0) direction(dir); });
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(function (n) { window.addEventListener(n, releaseHold); });
  document.getElementById('actionButton').addEventListener('click', action);
  document.getElementById('pauseButton').addEventListener('click', function () {
    if (pause()) return;
    if (mode === 'menu' && L) { play(); return; }
    toast('Nothing to pause: press A to start');
  });
  document.getElementById('menuButton').addEventListener('click', function () { if (!pause()) title(); });
  document.getElementById('helpButton').addEventListener('click', help);
  if (soundButton) soundButton.addEventListener('click', toggleSound);
  let touchStart = null;
  screen.addEventListener('touchstart', function (e) { const t = e.touches[0]; touchStart = [t.clientX, t.clientY]; }, { passive: true });
  screen.addEventListener('touchend', function (e) {
    if (!touchStart) return;
    const t = e.changedTouches[0], dx = t.clientX - touchStart[0], dy = t.clientY - touchStart[1];
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    direction(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }, { passive: true });

  /* ---------- the loop ---------- */
  function frame(t) { render(t); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
  const date = document.getElementById('dateLabel');
  if (date) date.textContent = 'NOV 23, 1999';
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});
  // iPhone Safari ignores user-scalable=no: stop its pinch and double-tap zoom here.
  ['gesturestart', 'gesturechange', 'dblclick'].forEach(function (n) { document.addEventListener(n, function (e) { e.preventDefault(); }, { passive: false }); });
  boot();
})();
