/* The game controller: rendering, menus, input and local-only saves. */
(() => {
  'use strict';
  const { MISSIONS, MAP_W, MAP_H, parseMission, move, interact } = AS.logic;
  const canvas = document.querySelector('#screen');
  const ctx = canvas.getContext('2d');
  const ui = document.querySelector('#ui');
  const COLORS = ['#8ee8b1', '#ffd75e', '#80c8ff', '#ff936e', '#ee80d0', '#b69cff'];
  let game = null;
  let mode = 'title';
  let muted = localStorage.getItem('as99.muted') === 'true';
  let lastFrame = 0;
  const held = new Set();
  ctx.imageSmoothingEnabled = false;

  function save() {
    if (!game) return;
    game.savedAt = Date.now();
    AS.progression.save(game);
    updateContinue();
  }
  function updateContinue() {
    const b = ui.querySelector('[data-action="continue"]');
    if (b) b.disabled = !AS.progression.load();
  }
  function button(label, action, primary = false) {
    return `<button data-action="${action}" class="${primary ? 'primary' : 'secondary'}">${label}</button>`;
  }
  function panel(title, text, actions) {
    ui.hidden = false;
    ui.innerHTML = `<div class="screen-card"><p class="eyebrow">FAMILY COMPUTER · 1999</p><h1>${title}</h1>${text}<div class="menu-actions">${actions}</div></div>`;
    ui.querySelectorAll('button[data-action]').forEach(b => b.addEventListener('click', () => act(b.dataset.action)));
  }
  function showTitle() {
    mode = 'title';
    game = null;
    panel('AFTER SCHOOL <em>’99</em>', '<p class="tagline">THE LAST SAVE</p><p>Some things are worth saving twice.</p><p class="mini-legend">12 MISSIONS · LOCAL SAVE · ORIGINAL CHIPTUNES</p>', button('NEW GAME', 'new', true) + (AS.progression.load() ? button('CONTINUE', 'continue') : ''));
  }
  function start(fresh) {
    if (fresh) { game = AS.progression.initial(); AS.progression.clear(); }
    else game = AS.progression.load() || AS.progression.initial();
    game.map = game.map || AS.logic.parseMission(MISSIONS[game.mission]);
    if (game.status === 'won') { ending(); return; }
    mode = 'play';
    ui.hidden = true;
    save();
    AS.audio.unlock();
    AS.audio.playMusic(game.mission);
    toast(MISSIONS[game.mission].title + ' — ' + MISSIONS[game.mission].objective);
  }
  function toast(text) {
    let el = document.querySelector('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 3300);
  }
  function act(action) {
    AS.audio.unlock();
    if (action === 'new') { if (AS.progression.load() && !confirm('Start over and replace your saved mission?')) return; start(true); }
    if (action === 'continue') start(false);
    if (action === 'resume') { mode = 'play'; ui.hidden = true; AS.audio.playMusic(game.mission); }
    if (action === 'title') showTitle();
    if (action === 'restart') { game = { ...AS.progression.initial(), stars: game.stars, inventory: [...game.inventory] }; AS.progression.clear(); start(false); }
    if (action === 'help') help();
    if (action === 'shop') shop();
    if (action === 'next') { game.mission++; game.lives = 3; game.map = parseMission(MISSIONS[game.mission]); game.status = 'playing'; save(); start(false); }
    if (action.startsWith('buy:')) {
      const result = AS.shop.buy(game, Number(action.split(':')[1]));
      toast(result.message);
      if (result.ok) { save(); shop(); }
    }
  }
  function pause() {
    if (!game) { showTitle(); return; }
    mode = 'pause'; save();
    panel('PAUSED', '<p>Your mission and stars are saved on this device.</p>', button('KEEP PLAYING', 'resume', true) + button('EMOTE SHOP', 'shop') + button('HOW TO PLAY', 'help') + button('TITLE SCREEN', 'title'));
  }
  function help() {
    mode = game ? 'pause' : 'title';
    panel('HOW TO PLAY', '<div class="help-grid"><b>MOVE</b><span>Arrow keys / WASD / D-pad</span><b>INTERACT</b><span>Space / E / A button</span><b>PAUSE</b><span>Escape / P / ☰</span><b>GOAL</b><span>Follow each mission objective. Reach its green terminal and interact.</span><b>WATCH OUT</b><span>Amber moving bugs cost a life. Three hits mean mission retry.</span><b>EMOTES</b><span>Collect stars, then open the shop from Pause.</span></div>', button(game ? 'BACK TO GAME' : 'BACK TO TITLE', game ? 'resume' : 'title', true));
  }
  function shop() {
    if (!game) return;
    mode = 'shop'; save();
    const items = AS.shop.list(game).map((item, i) => `<div class="shop-item"><span class="shop-face" style="color:${item.color}">${item.symbol}</span><b>${item.name}</b><span class="stars">${item.owned ? (item.equipped ? 'EQUIPPED' : 'OWNED') : item.cost + ' ★'}</span><button data-action="buy:${i}" ${item.equipped ? 'disabled' : ''}>${item.owned ? 'EQUIP' : 'UNLOCK'}</button></div>`).join('');
    panel('EMOTE CLUB', `<p>Spend stars earned in missions. No real money.</p><p><b>${game.stars} ★</b> AVAILABLE</p><div class="shop-grid">${items}</div>`, button('BACK', 'resume', true));
  }
  function missionWon() {
    if (mode !== 'play') return;
    game.status = 'won'; save(); AS.audio.sfx('win');
    if (game.mission === MISSIONS.length - 1) { ending(); return; }
    mode = 'complete';
    panel('FILE SAVED!', `<p>${MISSIONS[game.mission].story}</p><p><b>MISSION ${game.mission + 1} COMPLETE</b></p>`, button('NEXT MISSION', 'next', true) + button('EMOTE SHOP', 'shop'));
  }
  function ending() {
    mode = 'ending';
    game.status = 'won'; save();
    panel('THE LAST SAVE', '<p>The screen flickers. June’s saved projects appear, one by one.</p><p>You stayed long after the bell—not for a high score, but for a friend.</p><p class="tagline">Some things are worth saving twice.</p><p><b>ALL 12 MISSIONS COMPLETE</b></p>', button('PLAY AGAIN', 'restart', true) + button('TITLE SCREEN', 'title'));
  }
  function doMove(dx, dy) {
    if (mode !== 'play' || !game || game.status !== 'playing') return;
    const result = move(game, dx, dy);
    if (result.moved) AS.audio.sfx('step');
    if (result.star) { AS.audio.sfx('star'); toast('+1 STAR — spend it in the Emote Club'); }
    if (result.hit) {
      AS.audio.sfx('hit');
      if (game.lives <= 0) {
        mode = 'over'; save();
        panel('CONNECTION LOST', '<p>A school computer bug got you three times.</p><p>Your unlocked emotes and stars are safe.</p>', button('RETRY MISSION', 'resume', true) + button('TITLE SCREEN', 'title'));
      } else toast(`Ouch! ${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left. Watch the amber bugs.`);
    }
    save();
  }
  function doInteract() {
    if (mode !== 'play' || !game || game.status !== 'playing') return;
    const result = interact(game);
    if (result.ok) missionWon();
    else toast(result.message);
  }
  function pixelText(text, x, y, size = 16, color = '#8ee8b1', align = 'left') {
    ctx.font = `bold ${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  function drawTile(x, y, tile, time) {
    const px = x * 24 + 12, py = y * 24 + 112;
    ctx.fillStyle = (x + y) % 2 ? '#172d32' : '#15282e';
    ctx.fillRect(px, py, 24, 24);
    ctx.fillStyle = '#203b40'; ctx.fillRect(px, py, 24, 1);
    if (tile === 'wall') {
      ctx.fillStyle = '#38535a'; ctx.fillRect(px, py, 24, 24);
      ctx.fillStyle = '#52716f'; ctx.fillRect(px + 1, py + 1, 22, 5);
      ctx.fillStyle = '#263f48'; ctx.fillRect(px + 2, py + 9, 20, 13);
      ctx.strokeStyle = '#446068'; ctx.strokeRect(px + 2.5, py + 9.5, 19, 12);
    } else if (tile === 'disk') {
      ctx.fillStyle = '#80c8ff'; ctx.fillRect(px + 5, py + 3, 14, 18);
      ctx.fillStyle = '#d6e9e5'; ctx.fillRect(px + 7, py + 4, 10, 6);
      ctx.fillStyle = '#233b52'; ctx.fillRect(px + 9, py + 14, 8, 5);
    } else if (tile === 'key') {
      ctx.strokeStyle = '#ffd75e'; ctx.lineWidth = 3;
      ctx.strokeRect(px + 4, py + 7, 8, 8); ctx.beginPath(); ctx.moveTo(px + 12, py + 11); ctx.lineTo(px + 20, py + 11); ctx.lineTo(px + 20, py + 16); ctx.stroke(); ctx.lineWidth = 1;
    } else if (tile === 'hazard') {
      const hop = Math.sin(time / 120 + x) > 0 ? 0 : 2;
      ctx.fillStyle = '#ff936e'; ctx.fillRect(px + 3, py + 6 + hop, 18, 14);
      ctx.fillStyle = '#462932'; ctx.fillRect(px + 6, py + 10 + hop, 3, 3); ctx.fillRect(px + 15, py + 10 + hop, 3, 3);
      ctx.fillStyle = '#ffd75e'; ctx.fillRect(px + 2, py + 3 + hop, 4, 4); ctx.fillRect(px + 18, py + 3 + hop, 4, 4);
      pixelText('!', px + 12, py + 2, 10, '#ffd75e', 'center');
    } else if (tile === 'goal') {
      ctx.fillStyle = '#73e6b2'; ctx.fillRect(px + 3, py + 2, 18, 15);
      ctx.fillStyle = '#173b38'; ctx.fillRect(px + 5, py + 4, 14, 9);
      ctx.fillStyle = '#a9ffd0'; ctx.fillRect(px + 7, py + 6, 8, 2);
      ctx.fillStyle = '#719189'; ctx.fillRect(px + 10, py + 17, 4, 4); ctx.fillRect(px + 6, py + 21, 12, 2);
    } else if (tile === 'door') {
      ctx.fillStyle = game.collected.disk && game.collected.key ? '#73e6b2' : '#b56d70';
      ctx.fillRect(px + 4, py + 1, 16, 23); ctx.fillStyle = '#1a2c33'; ctx.fillRect(px + 7, py + 4, 10, 16);
      pixelText(game.collected.disk && game.collected.key ? 'OPEN' : 'LOCK', px + 12, py + 14, 8, '#f8e7b0', 'center');
    } else if (tile === 'star') {
      pixelText('★', px + 12, py + 19, 23, '#ffd75e', 'center');
    } else if (tile === 'heart') {
      pixelText('♥', px + 12, py + 19, 21, '#ff936e', 'center');
    } else if (tile === 'start') {
      pixelText('P', px + 12, py + 18, 14, '#31484c', 'center');
    }
  }
  function drawPlayer(time) {
    if (!game) return;
    const px = game.player.x * 24 + 12, py = game.player.y * 24 + 112;
    const face = AS.shop.list(game).find(i => i.equipped) || AS.shop.list(game)[0];
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(px + 3, py + 20, 18, 3);
    ctx.fillStyle = face.color; ctx.fillRect(px + 3, py + 3, 18, 18);
    ctx.fillStyle = '#162b34'; ctx.fillRect(px + 6, py + 8, 3, 3); ctx.fillRect(px + 15, py + 8, 3, 3);
    ctx.fillRect(px + 8, py + 15, 8, 2);
    ctx.fillStyle = '#f6e9c7'; ctx.fillRect(px + 1, py + 1, 22, 3);
    if (Math.sin(time / 180) > 0) { ctx.fillStyle = face.color; ctx.fillRect(px, py + 19, 6, 3); }
  }
  function render(time) {
    ctx.fillStyle = '#08171c'; ctx.fillRect(0, 0, 960, 576);
    const mission = MISSIONS[game ? game.mission : 0];
    ctx.fillStyle = '#0c2228'; ctx.fillRect(0, 0, 960, 94);
    pixelText('AFTER SCHOOL ’99', 20, 29, 19, '#ffd75e');
    pixelText(game ? `${String(game.mission + 1).padStart(2, '0')} / ${MISSIONS.length}  ${mission.title}` : '12 FILES. ONE LAST SAVE.', 20, 57, 16);
    if (game) {
      pixelText(`♥ ${game.lives}`, 740, 28, 18, '#ff936e'); pixelText(`★ ${game.stars}`, 830, 28, 18, '#ffd75e');
      const items = [game.collected.disk ? 'DISK ✓' : 'DISK —', game.collected.key ? 'KEY ✓' : 'KEY —'].join('   ');
      pixelText(items, 740, 57, 14, '#80c8ff');
      for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) drawTile(x, y, game.map.grid[y][x], time);
      drawPlayer(time);
      ctx.fillStyle = '#0c2228'; ctx.fillRect(0, 538, 960, 38);
      pixelText(mission.objective, 20, 563, 14, '#f6e9c7');
      pixelText('ARROWS / WASD · SPACE / E · ESC', 940, 563, 12, '#80a29b', 'right');
    } else {
      // An animated attract-mode classroom, rather than a blank screen behind the title.
      for (let y = 0; y < 18; y++) for (let x = 0; x < 39; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#13272d' : '#102229'; ctx.fillRect(x * 24 + 12, y * 24 + 100, 23, 23);
      }
      for (let i = 0; i < 7; i++) {
        const x = 120 + i * 115, y = 260 + Math.sin(time / 900 + i) * 35;
        ctx.fillStyle = '#294a4d'; ctx.fillRect(x, y, 65, 50); ctx.fillStyle = '#75b9a5'; ctx.fillRect(x + 7, y + 7, 51, 30);
      }
      pixelText('INSERT FRIENDSHIP TO CONTINUE', 480, 480, 16, '#ffd75e', 'center');
    }
  }
  function frame(time) {
    // A fixed gameplay clock: no movement catch-up after a hidden tab resumes.
    if (mode === 'play' && game && game.status === 'playing') {
      game.elapsed += Math.min(50, time - lastFrame || 16);
      for (const h of game.map.hazards) {
        if (game.elapsed - h.lastMove >= Math.max(520, 1150 - game.mission * 35)) {
          h.lastMove = game.elapsed;
          const options = [[1,0],[-1,0],[0,1],[0,-1]];
          const d = options[(game.tick + h.x + h.y) % options.length];
          if (AS.logic.walkable(game, h.x + d[0], h.y + d[1]) && !(game.player.x === h.x + d[0] && game.player.y === h.y + d[1])) {
            game.map.grid[h.y][h.x] = 'floor'; h.x += d[0]; h.y += d[1]; game.map.grid[h.y][h.x] = 'hazard';
          }
        }
      }
    }
    render(time); lastFrame = time; requestAnimationFrame(frame);
  }
  const keyDirections = { ArrowUp: [0,-1], w: [0,-1], W: [0,-1], ArrowDown: [0,1], s: [0,1], S: [0,1], ArrowLeft: [-1,0], a: [-1,0], A: [-1,0], ArrowRight: [1,0], d: [1,0], D: [1,0] };
  document.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (keyDirections[e.key]) { e.preventDefault(); held.add(e.key); doMove(...keyDirections[e.key]); }
    if (e.key === ' ' || e.key === 'e' || e.key === 'E') { e.preventDefault(); doInteract(); }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { e.preventDefault(); mode === 'play' ? pause() : game ? act('resume') : showTitle(); }
  });
  document.addEventListener('keyup', e => held.delete(e.key));
  document.querySelectorAll('[data-move]').forEach(b => b.addEventListener('pointerdown', e => {
    e.preventDefault(); const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] }; doMove(...dirs[b.dataset.move]);
  }));
  document.querySelector('#actionButton').addEventListener('click', doInteract);
  document.querySelector('#menuButton').addEventListener('click', () => mode === 'play' ? pause() : pause());
  document.querySelector('#helpButton').addEventListener('click', help);
  document.querySelector('#soundButton').textContent = muted ? '×' : '♪';
  document.querySelector('#soundButton').setAttribute('aria-pressed', String(muted));
  document.querySelector('#soundButton').addEventListener('click', () => {
    muted = !muted; AS.audio.setMuted(muted); localStorage.setItem('as99.muted', String(muted));
    document.querySelector('#soundButton').textContent = muted ? '×' : '♪';
    document.querySelector('#soundButton').setAttribute('aria-pressed', String(muted));
    if (!muted && game && mode === 'play') AS.audio.playMusic(game.mission);
  });
  document.addEventListener('visibilitychange', () => { held.clear(); if (document.hidden && mode === 'play') pause(); });
  window.addEventListener('pagehide', save);
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  window.AS.game = { start, move: doMove, interact: doInteract, pause, showTitle, get state() { return game; }, get mode() { return mode; } };
  showTitle(); requestAnimationFrame(frame);
})();
