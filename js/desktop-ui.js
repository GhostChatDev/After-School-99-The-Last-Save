/* FC-99 OS desktop: the level select. A chunky, original 1990s desktop drawn in HTML and CSS
   (no outside images), so it works with a mouse, a finger and a keyboard.
   Pure data (folders, memories, the Act III clock) is in js/desktop.js and checked by tests/desktop.test.cjs. */
(function () {
  'use strict';
  const D = window.Desktop;

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  function folderIcon() {
    const i = el('span', 'desk-folder-icon');
    i.setAttribute('aria-hidden', 'true');
    i.appendChild(el('i', 'tab'));
    i.appendChild(el('i', 'body'));
    return i;
  }

  function create(opts) {
    const root = opts.root;
    const M = opts.missions, A = opts.acts;
    const hooks = opts.hooks || {};
    const save = function () { return opts.getSave(); };
    const deskIcons = el('div', 'desk-icons');
    const windows = el('div', 'desk-windows');
    windows.setAttribute('role', 'region');
    windows.setAttribute('aria-label', 'Open window');
    const taskbar = el('div', 'taskbar');
    const startBtn = el('button', 'start-btn', '▣ START');
    startBtn.type = 'button';
    startBtn.setAttribute('aria-haspopup', 'true');
    startBtn.setAttribute('aria-expanded', 'false');
    const clock = el('span', 'task-clock', D.CLOCK);
    clock.title = 'The night the family computer is thrown out';
    const menu = el('div', 'start-menu');
    menu.hidden = true;
    startBtn.appendChild;
    taskbar.appendChild(startBtn);
    taskbar.appendChild(el('span', 'task-note', 'FC-99 OS'));
    taskbar.appendChild(clock);
    root.appendChild(el('div', 'desk-wall'));
    root.appendChild(el('div', 'desk-window-back'));
    root.appendChild(deskIcons);
    root.appendChild(windows);
    root.appendChild(menu);
    root.appendChild(taskbar);

    let openWindow = null;
    let visible = false;
    let lastFocus = null;

    /* ---------- windows ---------- */
    function closeWindow() {
      openWindow = null;
      windows.innerHTML = '';
      windows.hidden = true;
    }
    function windowBox(caption, body, actions) {
      windows.innerHTML = '';
      windows.hidden = false;
      const box = el('div', 'os-window');
      const bar = el('div', 'os-titlebar');
      bar.appendChild(el('span', 'os-caption', caption));
      const x = el('button', 'os-close', '✕');
      x.type = 'button';
      x.setAttribute('aria-label', 'Close window');
      x.addEventListener('click', function () { closeWindow(); startBtn.focus(); });
      bar.appendChild(x);
      box.appendChild(bar);
      body.className = (body.className ? body.className + ' ' : '') + 'os-body';
      box.appendChild(body);
      if (actions && actions.length) {
        const row = el('div', 'os-actions');
        actions.forEach(function (a) {
          const b = el('button', 'os-button' + (a[2] ? ' primary' : ''), a[0]);
          b.type = 'button';
          b.addEventListener('click', function () { a[1](); });
          row.appendChild(b);
        });
        box.appendChild(row);
      }
      windows.appendChild(box);
      openWindow = caption;
      const first = box.querySelector('button.os-close');
      if (first) first.focus({ preventScroll: true });
      return box;
    }

    function openAct(i) {
      const s = save();
      const f = D.folders(A, M, s.unlocked, s.best)[i];
      const body = el('div', 'os-body act-body');
      body.appendChild(el('p', 'os-line', f.line));
      const list = el('ul', 'mission-list');
      f.items.forEach(function (m) {
        const li = el('li');
        const b = el('button', 'mission-item' + (m.locked ? ' locked' : '') + (m.cleared ? ' cleared' : ''));
        b.type = 'button';
        b.disabled = m.locked;
        b.setAttribute('aria-label', 'Mission ' + m.number + ': ' + m.title + (m.locked ? ' (locked)' : '') + (m.cleared ? ' (cleared)' : ''));
        b.appendChild(el('span', 'mission-num', String(m.number)));
        b.appendChild(el('span', 'mission-name', m.title));
        b.appendChild(el('span', 'mission-state', m.locked ? 'LOCKED' : m.cleared ? 'SAVED ✓' : 'OPEN'));
        b.addEventListener('click', function () { if (hooks.play) hooks.play(m.index); });
        li.appendChild(b);
        list.appendChild(li);
      });
      body.appendChild(list);
      windowBox(D.windowTitle('folder', f.label + ' ' + f.subtitle), body,
        [['CLOSE', closeWindow], ['SAVE & EXIT', function () { closeWindow(); if (hooks.quit) hooks.quit(); }, true]]);
    }

    function openMemories() {
      const s = save();
      const got = D.memories(M, s.best);
      const body = el('div', 'os-body memories-body');
      body.appendChild(el('p', 'os-line', got.length + ' of ' + M.length + ' memories saved to the floppy.'));
      if (!got.length) body.appendChild(el('p', 'os-empty', D.emptyFolderText(0)));
      got.forEach(function (m) {
        const card = el('div', 'memory-slip');
        card.appendChild(el('h3', '', m.number + '. ' + m.title));
        card.appendChild(el('p', '', m.text));
        body.appendChild(card);
      });
      windowBox(D.windowTitle('memories'), body, [['CLOSE', closeWindow, true]]);
    }

    function openSettings() {
      const s = save();
      const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const body = el('div', 'os-body settings-body');
      const crtRow = el('div', 'setting-row');
      crtRow.appendChild(el('span', '', 'CRT monitor effect'));
      const crtBtn = el('button', 'os-toggle', s.crt ? 'ON' : 'OFF');
      crtBtn.type = 'button';
      crtBtn.setAttribute('aria-pressed', s.crt ? 'true' : 'false');
      crtBtn.setAttribute('aria-label', 'CRT monitor effect');
      crtBtn.addEventListener('click', function () {
        const on = hooks.toggleCrt ? hooks.toggleCrt() : !save().crt;
        crtBtn.textContent = on ? 'ON' : 'OFF';
        crtBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      crtRow.appendChild(crtBtn);
      body.appendChild(crtRow);
      const soundRow = el('div', 'setting-row');
      soundRow.appendChild(el('span', '', 'Sound'));
      const sndBtn = el('button', 'os-toggle', s.sound ? 'ON' : 'OFF');
      sndBtn.type = 'button';
      sndBtn.setAttribute('aria-pressed', s.sound ? 'true' : 'false');
      sndBtn.addEventListener('click', function () {
        const on = hooks.toggleSound ? hooks.toggleSound() : !save().sound;
        sndBtn.textContent = on ? 'ON' : 'OFF';
        sndBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      soundRow.appendChild(sndBtn);
      body.appendChild(soundRow);
      if (reduced) body.appendChild(el('p', 'os-note', 'This device asks for less motion, so the CRT effect, its flicker and the power-off animation stay off.'));
      else body.appendChild(el('p', 'os-note', 'CRT adds scanlines, a curved glass edge, glow, a slow flicker, and the power-off dot when you quit a mission.'));
      windowBox(D.windowTitle('settings'), body, [['CLOSE', closeWindow, true]]);
    }

    function openReadme() {
      const body = el('div', 'os-body readme-body');
      body.appendChild(el('h3', '', 'AFTER SCHOOL \'99: THE LAST SAVE'));
      body.appendChild(el('p', '', 'Pick an act folder to choose a mission. A saved mission shows ✓ and its memory lands in MY MEMORIES.'));
      body.appendChild(el('p', '', 'Move Pip one square at a time: arrow keys or WASD, swipe on the screen, or the pad under the screen. A selects, P or Esc pauses, R restarts.'));
      body.appendChild(el('p', '', 'Collect every ✦ spark, then reach the floppy disk. The old machine shuts down at midnight.'));
      body.appendChild(el('p', 'os-note', 'Original design, drawn in code. Not affiliated with any computer maker.'));
      windowBox(D.windowTitle('help'), body, [['CLOSE', closeWindow, true]]);
    }

    function openStartMenu() {
      menu.innerHTML = '';
      const s = save();
      const items = [
        ['▤ MY MEMORIES', openMemories],
        ['▣ CONTROL PANEL', openSettings],
        ['✎ READ ME.TXT', openReadme],
        ['◇ FACE CLOSET', function () { hide(); if (hooks.closet) hooks.closet(); }],
        ['▷ THE STORY', function () { hide(); if (hooks.story) hooks.story(); }],
        ['⏻ SHUT DOWN', function () { hide(); if (hooks.quit) hooks.quit(); }]
      ];
      if (s.unlocked > 1 && !s.done) {
        items.unshift(['▶ CONTINUE: MISSION ' + s.unlocked, function () { if (hooks.play) hooks.play(s.unlocked - 1); }]);
      }
      items.forEach(function (it) {
        const b = el('button', 'start-item', it[0]);
        b.type = 'button';
        b.addEventListener('click', function () { closeStartMenu(); it[1](); });
        menu.appendChild(b);
      });
      menu.appendChild(el('div', 'start-clock', D.DATE + '  ' + D.CLOCK));
      menu.hidden = false;
      startBtn.setAttribute('aria-expanded', 'true');
    }
    function closeStartMenu() {
      menu.hidden = true;
      startBtn.setAttribute('aria-expanded', 'false');
    }
    function toggleStartMenu() { if (menu.hidden) openStartMenu(); else closeStartMenu(); }
    startBtn.addEventListener('click', toggleStartMenu);

    /* ---------- icons ---------- */
    function paint() {
      const s = save();
      deskIcons.innerHTML = '';
      const folders = D.folders(A, M, s.unlocked, s.best);
      folders.forEach(function (f) {
        const b = el('button', 'desk-icon' + (f.open ? '' : ' dim'));
        b.type = 'button';
        b.appendChild(folderIcon());
        b.appendChild(el('span', 'desk-label', f.label));
        b.appendChild(el('span', 'desk-sub', f.cleared + '/' + f.total + (f.open ? ' SAVED' : ' LOCKED')));
        b.setAttribute('aria-label', f.label + ': ' + f.subtitle + ', ' + f.cleared + ' of ' + f.total + ' missions saved' + (f.open ? '' : ' (locked)'));
        b.addEventListener('click', function () { openAct(f.act); });
        deskIcons.appendChild(b);
      });
      const mem = D.memories(M, s.best).length;
      const m = el('button', 'desk-icon memories-icon');
      m.type = 'button';
      m.appendChild(folderIcon());
      m.appendChild(el('span', 'desk-label', 'MY MEMORIES'));
      m.appendChild(el('span', 'desk-sub', mem + ' SAVED'));
      m.setAttribute('aria-label', 'My Memories: ' + mem + ' of ' + M.length + ' saved');
      m.addEventListener('click', openMemories);
      deskIcons.appendChild(m);
      const cp = el('button', 'desk-icon');
      cp.type = 'button';
      cp.appendChild(el('span', 'desk-gear', '⚙'));
      cp.appendChild(el('span', 'desk-label', 'CONTROL'));
      cp.appendChild(el('span', 'desk-sub', 'PANEL'));
      cp.setAttribute('aria-label', 'Control panel: CRT and sound settings');
      cp.addEventListener('click', openSettings);
      deskIcons.appendChild(cp);
    }

    /* ---------- keyboard ---------- */
    function iconButtons() { return Array.prototype.slice.call(deskIcons.querySelectorAll('.desk-icon')); }
    function moveFocus(dx, dy) {
      const list = iconButtons();
      if (!list.length) return;
      const at = list.indexOf(document.activeElement);
      if (at < 0) { list[0].focus(); return; }
      const cols = Math.max(1, parseInt(getComputedStyle(deskIcons).getPropertyValue('--cols'), 10) || 4);
      let next = at;
      if (dx) next = Math.min(list.length - 1, Math.max(0, at + dx));
      if (dy) next = at + dy * cols;
      if (dy && (next < 0 || next >= list.length)) next = at;
      list[next].focus();
    }
    function onKey(e) {
      if (!visible) return;
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        if (!menu.hidden) { closeStartMenu(); startBtn.focus(); return; }
        if (openWindow) { closeWindow(); startBtn.focus(); return; }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation();
        if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.os-body')) return; // let window lists scroll
        const rtl = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
        moveFocus(rtl ? (e.key === 'ArrowLeft' ? -1 : 1) : 0, rtl ? 0 : (e.key === 'ArrowUp' ? -1 : 1));
        return;
      }
      if (e.key === 'Home' || e.key === 'End') {
        if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.desk-icons')) {
          e.preventDefault(); e.stopPropagation();
          const list = iconButtons();
          (e.key === 'Home' ? list[0] : list[list.length - 1]).focus();
        }
      }
    }
    document.addEventListener('keydown', onKey, true);

    /* ---------- show / hide ---------- */
    function show() {
      visible = true;
      root.hidden = false;
      document.body.classList.add('on-desktop');
      lastFocus = document.activeElement;
      closeWindow();
      closeStartMenu();
      paint();
      const first = iconButtons()[0];
      if (first) first.focus({ preventScroll: true });
    }
    function hide() {
      visible = false;
      root.hidden = true;
      document.body.classList.remove('on-desktop');
      closeWindow();
      closeStartMenu();
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (_) {} }
    }
    root.hidden = true;

    const api = { show: show, hide: hide, paint: paint, isOpen: function () { return visible; }, openMemories: openMemories, openSettings: openSettings };
    return api;
  }

  window.DesktopUI = { create: create };
})();
