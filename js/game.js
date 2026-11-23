/* The game controller: rendering, menus, input and local-only saves.
   Built on the real libraries: Logic, Missions, Chiptune, Closet. */
(() => {
  'use strict';
  const LOGIC = window.Logic, MISSIONS = window.Missions, MUSIC = window.Chiptune, CLOSET = window.Closet;
  const STORE = () => localStorage;
  const canvas = document.querySelector('#screen');
  const ctx = canvas.getContext('2d');
  const ui = document.querySelector('#ui');
  const toastEl = document.querySelector('#toast');
  const TILE = 64, COLS = 15, ROWS = 9;
  let game = null;            // logic state for the active mission
  let mode = 'title';         // title | intro | play | done | outro | map | closet | ending
  let missionIndex = 0;
  let muted = localStorage.getItem('as99.muted') === 'true';
  let music = null;
  let tracks = MUSIC.tracks || [];
  let trackIndex = Math.min(1, tracks.length - 1);
  let lastFrame = 0, tick = 0;
  let toastTimer = 0;
  const pops = [];            // little star bursts when a spark is taken
  ctx.imageSmoothingEnabled = false;

  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  function sfx(name) { if (music && !muted) music.sfx(name); }
  function ensureMusic() {
    if (!music) music = MUSIC.create();
    return music;
  }
  function startMusic() {
    if (muted) return;
    const m = ensureMusic();
    if (m.start(trackIndex)) sfx('ui');
  }
  function setMuted(value) {
    muted = value;
    localStorage.setItem('as99.muted', value ? 'true' : 'false');
    if (value && music) music.stop();
    if (!value) startMusic();
    const b = document.querySelector('#soundButton');
    if (b) { b.textContent = muted ? '∅' : '♪'; b.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off'); }
  }
  const closetState = () => CLOSET.load(STORE());
  function drawGlyph(glyph, cx, cy, size, color) {
    ctx.font = size + 'px "Press Start 2P", monospace';
    ctx.fillStyle = color || '#20242e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, cx, cy);
  }
  function drawGrid(L) {
    const ox = (canvas.width - COLS * TILE) / 2, oy = (canvas.height - ROWS * TILE) / 2;
    for (let y = 0; y < L.h; y++) {
      for (let x = 0; x < L.w; x++) {
        const c = LOGIC.cell(L, x, y), px = ox + x * TILE, py = oy + y * TILE;
        const light = (x + y) % 2 === 0;
        ctx.fillStyle = c === '#' ? '#1c2f33' : light ? '#22403c' : '#1e3835';
        ctx.fillRect(px, py, TILE, TILE);
        if (c === '#') { ctx.fillStyle = '#29474c'; ctx.fillRect(px + 6, py + 6, TILE - 12, TILE - 12); }
        else if (c === 'x') drawGlyph('✕', px + TILE / 2, py + TILE / 2, 22, '#e0708a');
        else if (c === 'D') { ctx.fillStyle = '#c9a15e'; ctx.fillRect(px + 10, py + 8, TILE - 20, TILE - 16); }
        else if (c === 'K') drawGlyph('⚿', px + TILE / 2, py + TILE / 2, 24, '#ffd477');
        else if (c === 'E') drawGlyph('⌂', px + TILE / 2, py + TILE / 2, 26, '#9fe2ad');
        else if (c === '1' || c === '2') drawGlyph(c, px + TILE / 2, py + TILE / 2, 22, '#8de0dc');
      }
    }
    L.frags.forEach(([fx, fy], i) => {
      const bob = Math.sin((tick + i * 9) / 14) * 4;
      drawGlyph('✦', ox + fx * TILE + TILE / 2, oy + fy * TILE + TILE / 2 + bob, 22, '#ffe9a8');
    });
    L.bugs.forEach((bug, i) => {
      const wob = Math.sin((tick + i * 20) / 9) * 3;
      drawGlyph('❋', ox + bug.x * TILE + TILE / 2, oy + bug.y * TILE + TILE / 2 + wob, 24, '#b69cff');
    });
    return { ox, oy };
  }
  function drawPlayer(at) {
    const face = CLOSET.face(closetState().equipped);
    const segs = game.body;
    for (let i = segs.length - 1; i >= 1; i--) {
      const [sx, sy] = segs[i];
      ctx.fillStyle = '#79c99b';
      ctx.globalAlpha = 0.9 - (i / segs.length) * 0.5;
      ctx.fillRect(at.ox + sx * TILE + 14, at.oy + sy * TILE + 14, TILE - 28, TILE - 28);
      ctx.globalAlpha = 1;
    }
    const [hx, hy] = segs[0];
    const px = at.ox + hx * TILE + TILE / 2, py = at.oy + hy * TILE + TILE / 2;
    ctx.fillStyle = '#eaf6d8';
    ctx.fillRect(px - TILE / 2 + 10, py - TILE / 2 + 10, TILE - 20, TILE - 20);
    ctx.fillStyle = '#5c8f74';
    ctx.fillRect(px - TILE / 2 + 14, py - TILE / 2 + 14, TILE - 28, TILE - 28);
    drawGlyph(face.glyph, px, py, face.glyph.length > 2 ? 12 : 15, '#fff6d8');
  }
  function drawEffects(at) {
    pops.forEach((p, i) => {
      const age = (tick - p.at) / 22;
      if (age > 1) return;
      ctx.globalAlpha = 1 - age;
      drawGlyph('✧', at.ox + p.x * TILE + TILE / 2, at.oy + p.y * TILE + TILE / 2 - age * 26, 18 + age * 10, '#ffe9a8');
      ctx.globalAlpha = 1;
      void i;
    });
  }
  function frame(now) {
    lastFrame = now; tick++;
    ctx.fillStyle = '#091514';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (game && (mode === 'play' || mode === 'pause' || mode === 'done' || mode === 'outro')) {
      const at = drawGrid(game.L);
      drawPlayer(at);
      drawEffects(at);
    }
    requestAnimationFrame(frame);
  }
