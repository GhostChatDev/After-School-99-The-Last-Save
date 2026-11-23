/* AFTER SCHOOL '99: THE LAST SAVE — game controller (DOM, rendering, menus, input, saves).
   Rules live in js/logic.js; audio in js/audio.js; shop data in js/shop.js; campaign in js/missions.js. */
(function () {
  'use strict';
  const SAVE_KEY = 'as99-save-v2';
  const FACE_DEFS = [
    { id: 'classic', name: 'Classic Pip', cost: 0 },
    { id: 'happy', name: 'Happy Emote', cost: 5 },
    { id: 'cool', name: 'Cool Shades', cost: 10 },
    { id: 'wink', name: 'Winky', cost: 15 },
    { id: 'ghost', name: 'Ghost Face', cost: 25 },
    { id: 'crt', name: 'CRT Glow', cost: 40 }
  ];

  /* ---------- saves: progress + shop ownership survive a refresh ---------- */
  function blankSave() {
    return { version: 2, unlocked: 1, stars: 0, face: 'classic', owned: ['classic'], sound: true };
  }
  let save = loadSave();
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return blankSave();
      const data = JSON.parse(raw);
      const base = blankSave();
      for (const k in base) if (data[k] !== undefined) base[k] = data[k];
      if (!Array.isArray(base.owned) || !base.owned.length) base.owned = ['classic'];
      if (!base.owned.includes('classic')) base.owned.push('classic');
      if (!base.owned.includes(base.face)) base.face = 'classic';
      base.unlocked = Math.max(1, Math.min(Missions.missions.length, base.unlocked | 0));
      base.stars = Math.max(0, base.stars | 0);
      return base;
    } catch (_) { return blankSave(); }
  }
  function store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) {} }

  /* ---------- DOM ---------- */
  const screen = document.getElementById('screen');
  const ui = document.getElementById('ui');
  const toastBox = document.getElementById('toast');
  const menuButton = document.getElementById('menuButton');
  const soundButton = document.getElementById('soundButton');
  const ctx2d = screen.getContext('2d');
  const audio = window.Chiptune ? window.Chiptune.create() : null;
  if (audio && !save.sound) audio.setEnabled(false);

  let toastTimer = null;
  function toast(msg) {
    if (!toastBox) return;
    toastBox.textContent = msg;
    toastBox.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.classList.remove('show'); }, 2400);
  }

  /* ---------- nostalgic CRT + menu styles (injected so index.html stays lean) ---------- */
  const css = document.createElement('style');
  css.textContent =
    '#screen{image-rendering:pixelated}' +
    '@keyframes as99-flicker{0%,100%{opacity:.06}48%{opacity:.09}52%{opacity:.04}}' +
    '@keyframes as99-scan{from{background-position:0 0}to{background-position:0 8px}}' +
    '.as99-crt::after{content:"";position:absolute;inset:0;pointer-events:none;' +
    'background:repeating-linear-gradient(0deg,rgba(0,0,0,.35) 0 1px,transparent 1px 3px);' +
    'animation:as99-scan .9s linear infinite}' +
    '.as99-crt::before{content:"";position:absolute;inset:0;pointer-events:none;background:#8ef;' +
    'animation:as99-flicker 3.2s steps(2) infinite;mix-blend-mode:overlay}' +
    '#ui{position:absolute;inset:0;pointer-events:none;font-family:"Courier New",monospace}' +
    '#ui>*{pointer-events:auto}' +
    '.as99-panel{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' +
    'justify-content:center;gap:10px;background:rgba(6,10,20,.88);color:#9fe870;text-align:center;' +
    'padding:18px;z-index:5}' +
    '.as99-panel.open{display:flex}' +
    '.as99-panel h2{margin:0;font-size:clamp(18px,4vw,28px);letter-spacing:3px;color:#ffd76e;' +
    'text-shadow:0 0 8px rgba(255,215,110,.7)}' +
    '.as99-panel p{margin:0;font-size:13px;color:#baf5c4;max-width:34em;line-height:1.5}' +
    '.as99-panel button{font:inherit;background:#0c1a12;border:2px solid #2f7f4f;color:#9fe870;' +
    'padding:10px 18px;min-height:44px;min-width:44px;cursor:pointer;letter-spacing:2px}' +
    '.as99-panel button:hover,.as99-panel button:focus-visible{border-color:#ffd76e;color:#ffd76e;outline:none}' +
    '.as99-panel button:disabled{opacity:.4;cursor:not-allowed}' +
    '.as99-rows{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow:auto;padding:4px}' +
    '.as99-rows button{width:min(320px,78vw);text-align:left}' +
    '.as99-face{display:inline-block;width:18px;height:18px;vertical-align:-3px;margin-right:8px;' +
    'border:1px solid #2f7f4f;border-radius:4px;background:#0c1a12;text-align:center;line-height:16px;font-size:11px}' +
    '.as99-faces{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;' +
    'width:min(560px,88vw);max-height:48vh;overflow:auto}' +
    '.as99-faces button{width:auto;display:flex;align-items:center;gap:8px;justify-content:flex-start}' +
    '.as99-faces .price{margin-left:auto;color:#ffd76e}' +
    '.as99-faces .equipped{border-color:#ffd76e;color:#ffd76e}';
  document.head.appendChild(css);

  /* ---------- emote face drawing on the snake head ---------- */
  function drawFace(x, y, r, faceId, blink) {
    ctx2d.save();
    ctx2d.translate(x, y);
    ctx2d.fillStyle = '#06110b';
    ctx2d.strokeStyle = '#eaffea';
    ctx2d.lineWidth = 1;
    const eye = blink ? 0.4 : 2.4;
    const eyeDot = function (dx) { ctx2d.fillRect(dx - 1.5, -r * 0.35, 3, eye); };
    if (faceId === 'happy') {
      eyeDot(-r * 0.38); eyeDot(r * 0.38);
      ctx2d.beginPath(); ctx2d.arc(0, r * 0.15, r * 0.42, 0.15 * Math.PI, 0.85 * Math.PI); ctx2d.stroke();
    } else if (faceId === 'cool') {
      ctx2d.fillStyle = '#ffd76e';
      ctx2d.fillRect(-r * 0.7, -r * 0.42, r * 1.4, r * 0.34);
      ctx2d.fillStyle = '#06110b';
      ctx2d.beginPath(); ctx2d.arc(0, r * 0.35, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI); ctx2d.stroke();
    } else if (faceId === 'wink') {
      ctx2d.beginPath(); ctx2d.arc(-r * 0.38, -r * 0.35, 2.4, 0, Math.PI * 2); ctx2d.fill();
      ctx2d.beginPath(); ctx2d.arc(r * 0.38, r * 0.3, r * 0.3, Math.PI * 1.15, Math.PI * 1.85); ctx2d.stroke();
      ctx2d.beginPath(); ctx2d.arc(0, r * 0.2, r * 0.35, 0.2 * Math.PI, 0.8 * Math.PI); ctx2d.stroke();
    } else if (faceId === 'ghost') {
      ctx2d.globalAlpha = 0.85;
      eyeDot(-r * 0.38); eyeDot(r * 0.38);
      ctx2d.beginPath(); ctx2d.arc(0, r * 0.3, r * 0.25, Math.PI, Math.PI * 2); ctx2d.stroke();
    } else if (faceId === 'crt') {
      ctx2d.shadowColor = '#8ef'; ctx2d.shadowBlur = 6;
      eyeDot(-r * 0.38); eyeDot(r * 0.38);
      ctx2d.beginPath(); ctx2d.moveTo(-r * 0.4, r * 0.35); ctx2d.lineTo(r * 0.4, r * 0.35); ctx2d.stroke();
      ctx2d.shadowBlur = 0;
    } else {
      eyeDot(-r * 0.38); eyeDot(r * 0.38);
    }
    ctx2d.restore();
  }

  /* ---------- rendering ---------- */
  const CELL = 26;
  const INK = { wall: '#2f7f4f', floor: '#0c1a12', frag: '#ffd76e', exit: '#9fe870',
    snake: '#9fe870', snakeAlt: '#7dc95c', bug: '#ff6e6e', key: '#ffd76e', door: '#c95c9e' };
  let L = null;
  let state = null;
  let mode = 'title';
  let menu = 'title';
  let busy = 0;
  let blinkAt = 0;
  let lastT = 0;
  const face = document.createElement('canvas');

  function drawGridChar(c, x, y, t) {
    const px = x * CELL, py = y * CELL;
    if (c === '#') {
      ctx2d.fillStyle = INK.wall;
      ctx2d.fillRect(px, py, CELL - 2, CELL - 2);
      ctx2d.fillStyle = 'rgba(0,0,0,.35)';
      ctx2d.fillRect(px, py + CELL - 6, CELL - 2, 4);
      return;
    }
    if (c === '.') { ctx2d.fillStyle = INK.floor; ctx2d.fillRect(px, py, CELL - 2, CELL - 2); return; }
    if (c === '0') { ctx2d.fillStyle = '#07130c'; ctx2d.fillRect(px, py, CELL - 2, CELL - 2); return; }
    if (c === 'o') {
      const bob = Math.sin(t / 300 + x * 1.7) * 2;
      ctx2d.fillStyle = INK.frag;
      ctx2d.beginPath();
      ctx2d.arc(px + CELL / 2 - 1, py + CELL / 2 - 1 + bob, 5, 0, Math.PI * 2);
      ctx2d.fill();
      return;
    }
    if (c === 'K') { ctx2d.fillStyle = INK.key; ctx2d.fillRect(px + 8, py + 10, 8, 3); ctx2d.fillRect(px + 12, py + 13, 3, 6); return; }
    if (c === 'D') { ctx2d.fillStyle = INK.door; ctx2d.fillRect(px, py, CELL - 2, CELL - 2); ctx2d.fillStyle = '#06110b'; ctx2d.fillRect(px + 8, py + 8, 8, 8); return; }
    if (c === 'E') {
      ctx2d.fillStyle = INK.exit;
      ctx2d.fillRect(px, py, CELL - 2, CELL - 2);
      ctx2d.fillStyle = '#06110b';
      ctx2d.fillRect(px + 6, py + 6, CELL - 14, CELL - 14);
      return;
    }
    ctx2d.fillStyle = INK.floor;
    ctx2d.fillRect(px, py, CELL - 2, CELL - 2);
  }

  function render(t) {
    if (!L) return;
    const cols = L.w, rows = L.h;
    const wantW = cols * CELL, wantH = rows * CELL;
    if (screen.width !== wantW || screen.height !== wantH) { screen.width = wantW; screen.height = wantH; }
    ctx2d.fillStyle = '#040806';
    ctx2d.fillRect(0, 0, screen.width, screen.height);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) drawGridChar(L.grid[y][x], x, y, t);
    }
    for (const bug of L.bugs) {
      const px = bug.x * CELL, py = bug.y * CELL;
      ctx2d.fillStyle = INK.bug;
      ctx2d.beginPath();
      ctx2d.arc(px + CELL / 2 - 1, py + CELL / 2 - 1, 7, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.fillStyle = '#06110b';
      const blink = (t - blinkAt) % 3200 > 3000;
      const eh = blink ? 1 : 3;
      ctx2d.fillRect(px + CELL / 2 - 5, py + CELL / 2 - 3, 2, eh);
      ctx2d.fillRect(px + CELL / 2 + 2, py + CELL / 2 - 3, 2, eh);
    }
    for (let i = state.snake.length - 1; i >= 0; i--) {
      const s = state.snake[i];
      ctx2d.fillStyle = i === 0 ? INK.snake : INK.snakeAlt;
      ctx2d.fillRect(s[0] * CELL + 1, s[1] * CELL + 1, CELL - 4, CELL - 4);
    }
    const head = state.snake[0];
    face.width = CELL; face.height = CELL;
    const fctx = face.getContext('2d');
    fctx.clearRect(0, 0, CELL, CELL);
    fctx.fillStyle = INK.snake;
    fctx.fillRect(1, 1, CELL - 4, CELL - 4);
    ctx2d.drawImage(face, head[0] * CELL + 1, head[1] * CELL + 1);
    drawFace(head[0] * CELL + CELL / 2 - 1, head[1] * CELL + CELL / 2 - 1, CELL / 2 - 2, save.face, (t - blinkAt) % 3400 > 3260);
  }

  /* ---------- screens / menus ---------- */
  function panel(id) { return ui.querySelector('#' + id); }
  function closePanels() {
    ui.querySelectorAll('.as99-panel').forEach(function (p) { p.classList.remove('open'); });
  }
  function showPanel(id) {
    closePanels();
    const p = panel(id);
    if (p) p.classList.add('open');
  }

  function faceGlyph(id) {
    return { classic: ':)', happy: ':D', cool: '8)', wink: ';)', ghost: ':O', crt: '@@' }[id] || ':)';
  }

  function openCloset() {
    menu = 'closet';
    const p = panel('closetPanel');
    p.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'THE FACE CLOSET';
    p.appendChild(h);
    const info = document.createElement('p');
    info.textContent = 'Stars: ' + save.stars + ' — collect memory fragments to earn more.';
    p.appendChild(info);
    const grid = document.createElement('div');
    grid.className = 'as99-faces';
    FACE_DEFS.forEach(function (def) {
      const owned = save.owned.indexOf(def.id) !== -1;
      const b = document.createElement('button');
      b.type = 'button';
      const glyph = document.createElement('span');
      glyph.className = 'as99-face';
      glyph.textContent = faceGlyph(def.id);
      b.appendChild(glyph);
      const label = document.createElement('span');
      label.textContent = def.name + (owned ? ' — owned' : ' — ' + def.cost + ' stars');
      b.appendChild(label);
      if (save.face === def.id) b.classList.add('equipped');
      b.addEventListener('click', function () {
        if (owned) {
          save.face = def.id;
          store();
          toast(def.name + ' equipped!');
          openCloset();
          return;
        }
        if (save.stars >= def.cost) {
          save.stars -= def.cost;
          save.owned.push(def.id);
          save.face = def.id;
          store();
          toast(def.name + ' unlocked!');
          openCloset();
        } else {
          toast('Need ' + (def.cost - save.stars) + ' more stars.');
        }
      });
      grid.appendChild(b);
    });
    p.appendChild(grid);
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'BACK';
    back.addEventListener('click', function () { openMenu(); });
    p.appendChild(back);
    showPanel('closetPanel');
  }

  function openMenu() {
    menu = 'menu';
    const p = panel('menuPanel');
    p.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'PAUSED';
    p.appendChild(h);
    const resume = document.createElement('button');
    resume.type = 'button';
    resume.textContent = 'RESUME';
    resume.addEventListener('click', function () { closePanels(); menu = 'title'; });
    p.appendChild(resume);
    const closet = document.createElement('button');
    closet.type = 'button';
    closet.textContent = 'FACE CLOSET';
    closet.addEventListener('click', openCloset);
    p.appendChild(closet);
    const sound = document.createElement('button');
    sound.type = 'button';
    sound.textContent = 'SOUND: ' + (save.sound ? 'ON' : 'OFF');
    sound.addEventListener('click', function () {
      save.sound = !save.sound;
      store();
      if (audio) audio.setEnabled(save.sound);
      sound.textContent = 'SOUND: ' + (save.sound ? 'ON' : 'OFF');
    });
    p.appendChild(sound);
    const quit = document.createElement('button');
    quit.type = 'button';
    quit.textContent = 'QUIT TO TITLE';
    quit.addEventListener('click', function () { toTitle(); });
    p.appendChild(quit);
    showPanel('menuPanel');
  }

  function openTitle() {
    menu = 'title';
    const p = panel('titlePanel');
    p.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = "AFTER SCHOOL '99";
    p.appendChild(h);
    const sub = document.createElement('p');
    sub.textContent = 'THE LAST SAVE — some things are worth saving twice.';
    p.appendChild(sub);
    if (save.unlocked > 1) {
      const cont = document.createElement('button');
      cont.type = 'button';
      cont.textContent = 'CONTINUE — MISSION ' + save.unlocked;
      cont.addEventListener('click', function () { startMission(save.unlocked - 1); });
      p.appendChild(cont);
    }
    const newG = document.createElement('button');
    newG.type = 'button';
    newG.textContent = 'NEW GAME';
    newG.addEventListener('click', function () { startMission(0); });
    p.appendChild(newG);
    const missions = document.createElement('button');
    missions.type = 'button';
    missions.textContent = 'MISSIONS';
    missions.addEventListener('click', openMissionSelect);
    p.appendChild(missions);
    const closet = document.createElement('button');
    closet.type = 'button';
    closet.textContent = 'FACE CLOSET';
    closet.addEventListener('click', openCloset);
    p.appendChild(closet);
    showPanel('titlePanel');
  }

  function openMissionSelect() {
    menu = 'missions';
    const p = panel('missionPanel');
    p.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'MISSIONS';
    p.appendChild(h);
    const rows = document.createElement('div');
    rows.className = 'as99-rows';
    Missions.missions.forEach(function (m, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = (i + 1) + '. ' + m.title + (i < save.unlocked ? '' : ' — LOCKED');
      b.disabled = i >= save.unlocked;
      b.addEventListener('click', function () { startMission(i); });
      rows.appendChild(b);
    });
    p.appendChild(rows);
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'BACK';
    back.addEventListener('click', openTitle);
    p.appendChild(back);
    showPanel('missionPanel');
  }

  function toTitle() {
    mode = 'title';
    if (audio) audio.music.stop();
    openTitle();
  }

  function showEnd() {
    menu = 'ending';
    const p = panel('endPanel');
    p.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'THE LAST SAVE';
    p.appendChild(h);
    const body = document.createElement('p');
    body.textContent = Missions.ending;
    p.appendChild(body);
    const again = document.createElement('button');
    again.type = 'button';
    again.textContent = 'BACK TO TITLE';
    again.addEventListener('click', toTitle);
    p.appendChild(again);
    showPanel('endPanel');
  }

  function startMission(i) {
    closePanels();
    menu = '';
    L = Logic.parse(Missions.missions[i]);
    state = Logic.newGame(L);
    busy = 0;
    mode = 'play';
    if (audio) {
      audio.music.play(Math.min(i, (audio.tracks || []).length - 1));
    }
  }

  /* ---------- game over / win ---------- */
  function die(why) {
    mode = 'over';
    if (audio) audio.music.stop();
    audio.sfx.die();
    const p = panel('overPanel');
    p.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'SIGNAL LOST';
    p.appendChild(h);
    const msg = document.createElement('p');
    msg.textContent = 'Cause of deletion: ' + why + '. The last save remains.';
    p.appendChild(msg);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'TRY AGAIN';
    retry.addEventListener('click', function () { startMission(save.unlocked - 1); });
    p.appendChild(retry);
    const title = document.createElement('button');
    title.type = 'button';
    title.textContent = 'TITLE';
    title.addEventListener('click', toTitle);
    p.appendChild(title);
    showPanel('overPanel');
  }

  function win() {
    const idx = save.unlocked - 1;
    const earned = state.total * 1 + 2;
    save.stars += earned;
    if (save.unlocked < Missions.missions.length) save.unlocked += 1;
    store();
    audio.music.stop();
    audio.sfx.win();
    if (save.unlocked === Missions.missions.length && idx === Missions.missions.length - 1) {
      showEnd();
      mode = 'title';
    } else {
      mode = 'over';
      const p = panel('overPanel');
      p.innerHTML = '';
      const h = document.createElement('h2');
      h.textContent = 'MISSION CLEAR';
      p.appendChild(h);
      const msg = document.createElement('p');
      msg.textContent = '+' + earned + ' stars. Total: ' + save.stars + '. Next unlock ready.';
      p.appendChild(msg);
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = 'NEXT MISSION';
      next.addEventListener('click', function () { startMission(save.unlocked - 1); });
      p.appendChild(next);
      const title = document.createElement('button');
      title.type = 'button';
      title.textContent = 'TITLE';
      title.addEventListener('click', toTitle);
      p.appendChild(title);
      showPanel('overPanel');
    }
  }

  /* ---------- input ---------- */
  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right'
  };
  function move(dir) {
    if (mode !== 'play' || busy > 0) return;
    state = Logic.step(state, dir);
    busy = 2;
    if (state.status === 'won') win();
    else if (state.status === 'dead') die(state.cause || 'the void');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (mode === 'play') openMenu();
      return;
    }
    const dir = KEYMAP[e.key];
    if (dir) { e.preventDefault(); move(dir); }
  });
  ui.addEventListener('click', function (e) {
    const dir = e.target.getAttribute && e.target.getAttribute('data-move');
    if (dir) move(dir);
  });
  if (menuButton) menuButton.addEventListener('click', function () { if (mode === 'play') openMenu(); });
  if (soundButton) soundButton.addEventListener('click', function () {
    save.sound = !save.sound;
    store();
    if (audio) audio.setEnabled(save.sound);
    toast('Sound ' + (save.sound ? 'on' : 'off'));
  });

  /* ---------- main loop ---------- */
  function frame(t) {
    requestAnimationFrame(frame);
    if (busy > 0) busy -= 1;
    if (mode !== 'play' || !L) return;
    render(t);
  }
  requestAnimationFrame(frame);

  /* ---------- build static panels + boot ---------- */
  ['titlePanel', 'missionPanel', 'closetPanel', 'menuPanel', 'overPanel', 'endPanel'].forEach(function (id) {
    let p = panel(id);
    if (!p) {
      p = document.createElement('div');
      p.id = id;
      p.className = 'as99-panel';
      ui.appendChild(p);
    }
  });
  if (!ui.querySelector('[data-move]') && document.querySelector('#pad [data-move], .dpad [data-move]') === null) {
    const pad = document.createElement('div');
    pad.style.cssText = 'position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;gap:8px;pointer-events:auto';
    [['left', '&#8592;'], ['up', '&#8593;'], ['down', '&#8595;'], ['right', '&#8594;']].forEach(function (d) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-move', d[0]);
      b.setAttribute('aria-label', 'Move ' + d[0]);
      b.innerHTML = d[1];
      b.style.cssText = 'min-width:52px;min-height:52px;font:inherit;background:#0c1a12;border:2px solid #2f7f4f;color:#9fe870';
      pad.appendChild(b);
    });
    ui.appendChild(pad);
  }
  openTitle();
})();
