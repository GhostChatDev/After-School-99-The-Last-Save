/* FC-99 OS desktop: pure helpers (no DOM), so the tests can check the level select,
   the collected-memories folder and the Act III clock toward 00:00 01/01/2000.
   The desktop UI itself lives in js/desktop-ui.js; the game is js/game.js. */
(function (root) {
  'use strict';

  const CLOCK = '11:02 PM';      // the family computer's clock, frozen on the night it is thrown out
  const DATE = 'NOV 23, 1999';
  const Y2K = { title: 'Y2K', midnightText: '00:00 01/01/2000', date: '12/31/1999' };
  const FINAL_TITLE = 'The Last Save';

  // Seconds on the Act III clock when the mission starts (before any move):
  // Act III is missions 9 to 16, from twelve minutes to midnight down to ninety seconds.
  function startSeconds(missionIndex) { return Math.max(90, (16 - missionIndex) * 90); }

  function isActThree(missionIndex) { return missionIndex >= 8; }

  // The Act III countdown: one step of Pip is one second. It stops at midnight, never below.
  function countdownTo2000(missionIndex, moves) {
    const start = startSeconds(missionIndex);
    const left = Math.max(0, start - Math.max(0, moves | 0));
    const midnight = left === 0;
    const total = midnight ? 86400 : 86400 - left;
    const hh = String(Math.floor(total / 3600) % 24).padStart(2, '0');
    const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return {
      missionIndex: missionIndex,
      moves: Math.max(0, moves | 0),
      secondsLeft: left,
      clock: hh + ':' + mm + ':' + ss,
      date: midnight ? '01/01/2000' : Y2K.date,
      text: midnight ? '00:00:00 · 01/01/2000' : hh + ':' + mm + ':' + ss + ' · ' + Y2K.date,
      midnight: midnight
    };
  }

  // The finale is themed as the Millennium Bug: glitch visuals over the same rules.
  function isMillenniumBug(missionIndex, missions) {
    if (missionIndex === 15) return true;
    return !!(missions && missions[missionIndex] && missions[missionIndex].title === FINAL_TITLE);
  }

  // The desktop icons: one folder per act, plus the My Memories folder.
  function folders(acts, missions, unlocked, best) {
    const open = Math.max(1, unlocked | 0), cleared = best || {};
    return acts.map(function (a, n) {
      const next = acts[n + 1] ? acts[n + 1].from : missions.length;
      const items = [];
      for (let i = a.from; i < next; i++) {
        items.push({ index: i, number: i + 1, title: missions[i].title, locked: i >= open, cleared: !!cleared[i] });
      }
      return {
        key: 'act' + (n + 1),
        act: n,
        label: 'ACT ' + 'I'.repeat(n + 1),
        subtitle: a.title.replace(/^ACT [IVX]+: /, ''),
        line: a.line,
        total: items.length,
        cleared: items.filter(function (m) { return m.cleared; }).length,
        open: items.some(function (m) { return !m.locked; }),
        items: items
      };
    });
  }

  // Everything in the My Memories folder: the memory card of each mission already saved.
  function memories(missions, best) {
    const cleared = best || {}, out = [];
    missions.forEach(function (m, i) {
      if (cleared[i]) out.push({ index: i, number: i + 1, title: m.title, text: m.outro });
    });
    return out;
  }

  function emptyFolderText(count) {
    return count ? '' : 'Nothing saved yet. Finish a mission and its memory lands in here.';
  }

  // A short title bar caption for the window the desktop opens.
  function windowTitle(kind, name) {
    if (kind === 'memories') return 'C:\\MY MEMORIES';
    if (kind === 'settings') return 'CONTROL PANEL';
    if (kind === 'start') return 'START';
    if (kind === 'help') return 'READ ME.TXT';
    return 'C:\\' + String(name || 'FOLDER').toUpperCase();
  }

  const api = {
    CLOCK: CLOCK, DATE: DATE, Y2K: Y2K,
    startSeconds: startSeconds, isActThree: isActThree, countdownTo2000: countdownTo2000,
    isMillenniumBug: isMillenniumBug, folders: folders, memories: memories,
    emptyFolderText: emptyFolderText, windowTitle: windowTitle
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Desktop = api;
})(typeof self !== 'undefined' ? self : this);
