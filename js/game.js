/* Canvas presentation and DOM controller. Rules stay in logic.js; purchases stay in shop.js. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('screen'), ctx = canvas.getContext('2d');
  const audio = Chiptune.create();
  const SAVE_KEY = 'afterSchool99.campaign.v2';
  const blank = { unlocked: 1, best: 0, reduced: false, volume: 0.35 };
  let save = load(), missionIndex = Math.min(save.unlocked - 1, Missions.missions.length - 1);
  let state = null, direction = 'right', queued = null, screen = 'home', previous = 'home';
  let timer = 0, last = 0, particles = [], flash = 0;
  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') || {};
      return { unlocked: Math.max(1, Math.min(Missions.missions.length, Number(v.unlocked) || 1)), best: Math.max(0, Number(v.best) || 0), reduced: Boolean(v.reduced), volume: Number.isFinite(v.volume) ? Math.max(0, Math.min(1, v.volume)) : 0.35 };
    } catch (_) { return { ...blank }; }
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) {} }
  function toast(text) { $('toast').textContent = text; $('toast').classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => $('toast').classList.remove('show'), 2200); }
  function show(id) {
    for (const el of document.querySelectorAll('.overlay')) el.hidden = true;
    screen = id;
    if (id !== 'game') { $(id).hidden = false; stop(); }
    updateHome();
  }
  function updateHome() {
    $('progressText').textContent = `${save.unlocked} / ${Missions.missions.length} files found · Best ${save.best}`;
    $('continueButton').hidden = save.unlocked <= 1;
    $('starBalance').textContent = `${Closet.load(localStorage).stars} stars`;
    document.body.classList.toggle('reduce-motion', save.reduced);
  }
  function start(index) {
    missionIndex = Math.max(0, Math.min(index, save.unlocked - 1));
    state = Logic.newGame(Logic.parse(Missions.missions[missionIndex]));
    direction = 'right'; queued = null; particles = []; flash = 0;
    audio.setTrack(missionIndex); show('intro');
    $('introTitle').textContent = `${missionIndex + 1}. ${Missions.missions[missionIndex].title}`;
    $('introText').textContent = Missions.missions[missionIndex].intro;
    draw();
  }
  function begin() { if (!state) start(missionIndex); screen = 'game'; for (const el of document.querySelectorAll('.overlay')) el.hidden = true; audio.start(); last = performance.now(); canvas.focus(); }
  function stop() { audio.stop(); }
  function finish(won) {
    stop();
    if (won) {
      Closet.award(localStorage, 1);
      save.best = Math.max(save.best, state.got);
      save.unlocked = Math.max(save.unlocked, Math.min(Missions.missions.length, missionIndex + 2)); persist();
      audio.sfx('win');
      if (missionIndex === Missions.missions.length - 1) {
        show('ending'); $('endingLines').innerHTML = Missions.ending.map(x => `<p>${x}</p>`).join('');
      } else {
        show('complete'); $('completeTitle').textContent = Missions.missions[missionIndex].title + ' saved';
        $('completeText').textContent = Missions.missions[missionIndex].outro;
        $('nextButton').textContent = `Open file ${missionIndex + 2}`;
      }
    } else {
      audio.sfx('die'); show('failed');
      const reasons = { wall: 'Pip bumped into a wall.', self: 'Pip crossed its own trail.', spike: 'That corrupt sector bites.', door: 'Find the key before opening the door.', gate: 'Collect every memory before using the exit.', dust: 'A dust bunny caught Pip. Watch its patrol.' };
      $('failText').textContent = reasons[state.cause] || 'The file slipped away. Try a different route.';
    }
    updateHome();
  }
  function move(name) {
    if (screen !== 'game') return;
    if (!state || state.status !== 'play') return;
    const before = state.got, next = Logic.step(state, name);
    if (next === state) return;
    state = next; direction = name; queued = null;
    if (state.got > before) { audio.sfx('collect'); Closet.award(localStorage, state.got - before); burst(); }
    if (state.events.includes('key')) { audio.sfx('key'); toast('Key found. The door is open.'); }
    if (state.events.includes('portal')) audio.sfx('portal');
    if (state.events.includes('last')) toast('All memories found. Head for the exit.');
    if (state.status !== 'play') finish(state.status === 'won');
    draw(); updateHome();
  }
  function requestMove(name) {
    if (!Logic.DIRS[name] || screen !== 'game') return;
    const d = Logic.DIRS[name], old = Logic.DIRS[direction];
    if (state.body.length > 1 && d[0] === -old[0] && d[1] === -old[1]) return;
    queued = name;
    if (performance.now() - last > 90) { move(queued); last = performance.now(); }
  }
  function burst() {
    if (save.reduced) return;
    const p = state.body[0];
    for (let i = 0; i < 7; i++) particles.push({ x: p[0], y: p[1], dx: (i % 3 - 1) * 0.035, dy: (Math.floor(i / 3) - 1) * 0.035, life: 16 });
    flash = 5;
  }
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#071619'; ctx.fillRect(0, 0, W, H);
    if (!state) return;
    const L = state.L, size = Math.floor(Math.min((W - 48) / L.w, (H - 92) / L.h));
    const ox = Math.floor((W - L.w * size) / 2), oy = Math.floor((H - L.h * size) / 2) + 12;
    ctx.font = `${Math.max(12, size * 0.58)}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
      const c = Logic.cell(L, x, y), px = ox + x * size, py = oy + y * size;
      ctx.fillStyle = (x + y) % 2 ? '#102a29' : '#0d2424'; ctx.fillRect(px, py, size, size);
      if (c === '#') { ctx.fillStyle = '#354152'; ctx.fillRect(px, py, size, size); ctx.fillStyle = '#526074'; ctx.fillRect(px + 2, py + 2, size - 4, 4); }
      if (c === 'x') { ctx.fillStyle = '#ff6b81'; ctx.fillText('×', px + size / 2, py + size / 2); }
      if (c === 'D') { ctx.fillStyle = state.hasKey ? '#79e2a7' : '#ffd166'; ctx.fillRect(px + 5, py + 3, size - 10, size - 6); }
      if (c === 'K') { ctx.fillStyle = '#ffd166'; ctx.fillText('⚿', px + size / 2, py + size / 2); }
      if (c === 'E') { ctx.strokeStyle = state.got === state.total ? '#79e2a7' : '#ffd166'; ctx.lineWidth = 3; ctx.strokeRect(px + 4, py + 4, size - 8, size - 8); }
      if (c === '1' || c === '2') { ctx.fillStyle = '#b69cff'; ctx.fillText(c, px + size / 2, py + size / 2); }
    }
    L.frags.forEach((p, i) => { if (!(state.mask & (1 << i))) { ctx.fillStyle = '#ffd166'; ctx.fillText('✦', ox + (p[0] + .5) * size, oy + (p[1] + .5) * size); } });
    for (const b of state.bugs) { ctx.fillStyle = '#f29ab2'; ctx.fillText('≈', ox + (b.x + .5) * size, oy + (b.y + .5) * size); }
    state.body.slice().reverse().forEach((p, i) => {
      ctx.fillStyle = i === state.body.length - 1 ? '#b5f5c7' : '#62ba88';
      ctx.fillRect(ox + p[0] * size + 3, oy + p[1] * size + 3, size - 6, size - 6);
    });
    const h = state.body[0]; ctx.fillStyle = '#071619'; ctx.font = `bold ${Math.max(11, size * .4)}px monospace`;
    ctx.fillText(Closet.face(Closet.load(localStorage).equipped).glyph, ox + (h[0] + .5) * size, oy + (h[1] + .5) * size);
    particles = particles.filter(p => p.life-- > 0);
    for (const p of particles) { p.x += p.dx; p.y += p.dy; ctx.fillStyle = '#ffd166'; ctx.fillRect(ox + p.x * size, oy + p.y * size, 3, 3); }
    $('hudFile').textContent = `FILE ${missionIndex + 1}/${Missions.missions.length}`;
    $('hudScore').textContent = `${state.got}/${state.total} memories`;
  }
