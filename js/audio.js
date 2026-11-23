/* Original procedural chiptunes. No samples, external files or copyrighted melodies. */
(function (root) {
  'use strict';
  const TRACKS = [
    { name: 'Dial-Up Dreams', bpm: 112, wave: 'square', melody: [64,67,71,67,62,67,69,67,60,64,67,64,59,62,67,71], bass: [40,40,38,38,36,36,35,35] },
    { name: 'Cassette Sunset', bpm: 96, wave: 'triangle', melody: [69,72,76,72,67,71,74,71,65,69,72,69,64,67,71,74], bass: [45,45,43,43,41,41,40,40] },
    { name: 'Midnight Modem', bpm: 128, wave: 'square', melody: [57,60,64,67,64,60,55,59,62,65,62,59,53,57,60,64], bass: [33,33,31,31,29,29,28,28] },
    { name: 'Playground After Rain', bpm: 104, wave: 'triangle', melody: [72,76,79,76,74,77,81,77,71,74,79,74,69,72,76,79], bass: [48,48,50,50,47,47,45,45] }
  ];
  function AudioSystem() {
    let context = null, timer = null, nextNote = 0, position = 0, track = 0;
    let enabled = true, volume = 0.35, noise = null;
    function init() {
      if (context) { if (context.state === 'suspended') context.resume().catch(function () {}); return true; }
      const Ctx = root.AudioContext || root.webkitAudioContext;
      if (!Ctx) return false;
      try {
        context = new Ctx();
        noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.12), context.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        return true;
      } catch (_) { return false; }
    }
    function tone(midi, at, duration, gain, wave) {
      if (!context || !enabled) return;
      const osc = context.createOscillator(), amp = context.createGain();
      osc.type = wave || 'square';
      osc.frequency.setValueAtTime(440 * Math.pow(2, (midi - 69) / 12), at);
      amp.gain.setValueAtTime(0.0001, at);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * volume), at + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      osc.connect(amp); amp.connect(context.destination);
      osc.start(at); osc.stop(at + duration + 0.02);
    }
    function hiss(at, gain) {
      if (!context || !enabled || !noise) return;
      const source = context.createBufferSource(), amp = context.createGain();
      source.buffer = noise; amp.gain.setValueAtTime(gain * volume, at);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
      source.connect(amp); amp.connect(context.destination); source.start(at); source.stop(at + 0.1);
    }
    function tick() {
      if (!context || !enabled || document.hidden) return;
      const song = TRACKS[track], beat = 60 / song.bpm / 2;
      if (nextNote < context.currentTime) nextNote = context.currentTime + 0.04;
      while (nextNote < context.currentTime + 0.16) {
        const step = position % 16, midi = song.melody[step];
        if (midi) tone(midi, nextNote, beat * 0.72, 0.045, song.wave);
        if (step % 2 === 0) tone(song.bass[(step / 2) % 8], nextNote, beat * 1.5, 0.065, 'triangle');
        if (step % 4 === 0) hiss(nextNote, step % 8 === 0 ? 0.018 : 0.009);
        nextNote += beat; position++;
      }
    }
    function start() {
      if (!init() || !enabled || timer) return;
      nextNote = context.currentTime + 0.05;
      timer = root.setInterval(tick, 50);
    }
    function stop() { if (timer) root.clearInterval(timer); timer = null; }
    function sfx(name) {
      if (!enabled || !init()) return;
      const now = context.currentTime + 0.005;
      if (name === 'collect') { tone(76, now, 0.08, 0.13); tone(83, now + 0.07, 0.12, 0.11); }
      else if (name === 'key') { tone(72, now, 0.09, 0.12); tone(79, now + 0.08, 0.1, 0.12); tone(84, now + 0.16, 0.16, 0.1); }
      else if (name === 'portal') { tone(69, now, 0.08, 0.1); tone(81, now + 0.06, 0.12, 0.08); }
      else if (name === 'die') { tone(52, now, 0.2, 0.15, 'sawtooth'); tone(40, now + 0.13, 0.28, 0.13, 'sawtooth'); }
      else if (name === 'win') [60,64,67,72,76].forEach(function (m, i) { tone(m, now + i * 0.1, 0.25, 0.12, 'triangle'); });
      else if (name === 'buy') { tone(84, now, 0.08, 0.1); tone(88, now + 0.08, 0.18, 0.1); }
      else tone(60, now, 0.04, 0.06);
    }
    return {
      start: start, stop: stop, sfx: sfx,
      setEnabled: function (value) { enabled = Boolean(value); if (!enabled) stop(); },
      setVolume: function (value) { volume = Math.max(0, Math.min(1, Number(value) || 0)); },
      setTrack: function (value) { track = ((value % TRACKS.length) + TRACKS.length) % TRACKS.length; position = 0; nextNote = 0; },
      tracks: TRACKS.map(function (song) { return song.name; })
    };
  }
  root.Chiptune = { create: AudioSystem, tracks: TRACKS.map(function (t) { return t.name; }) };
})(typeof window !== 'undefined' ? window : globalThis);
