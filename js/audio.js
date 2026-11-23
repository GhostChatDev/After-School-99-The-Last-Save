/* Original procedural chiptunes and sound effects, made live with the Web Audio API.
   No samples, no external files, no copyrighted melodies: every tune here was written for this game.
   Each song has a lead, a bass line, an optional arpeggio and a noise drum, like a 1990s sound chip. */
(function (root) {
  'use strict';
  // Notes are MIDI numbers (60 = middle C); 0 is a rest. 16 steps per bar.
  const SONGS = {
    title: { name: 'Insert Memory', bpm: 92, lead: 'triangle',
      melody: [72,0,76,79, 0,76,72,0, 74,0,77,81, 0,77,74,0, 71,0,74,79, 0,74,71,0, 72,0,76,79, 84,0,0,0],
      bass: [48,48,45,45,50,50,43,43,48,48,45,45,43,43,48,48], arp: [60,64,67,72] },
    act1: { name: 'Dial-Up Dreams', bpm: 112, lead: 'square',
      melody: [64,67,71,67,62,67,69,67,60,64,67,64,59,62,67,71],
      bass: [40,40,38,38,36,36,35,35], arp: [52,55,59,64] },
    act1b: { name: 'Cassette Sunset', bpm: 96, lead: 'triangle',
      melody: [69,72,76,72,67,71,74,71,65,69,72,69,64,67,71,74],
      bass: [45,45,43,43,41,41,40,40], arp: [57,60,64,69] },
    act2: { name: 'Playground After Rain', bpm: 104, lead: 'square',
      melody: [72,76,79,76,74,77,81,77,71,74,79,74,69,72,76,79],
      bass: [48,48,50,50,47,47,45,45], arp: [60,64,67,71] },
    act2b: { name: 'Screensaver Pipes', bpm: 118, lead: 'square',
      melody: [67,0,71,74,72,71,69,0,66,0,69,72,71,69,67,0],
      bass: [43,43,43,43,42,42,42,42,40,40,40,40,38,38,38,38], arp: [55,59,62,66] },
    act3: { name: 'Midnight Modem', bpm: 128, lead: 'square',
      melody: [57,60,64,67,64,60,55,59,62,65,62,59,53,57,60,64],
      bass: [33,33,31,31,29,29,28,28], arp: [45,48,52,57] },
    act3b: { name: 'Y2K Panic', bpm: 140, lead: 'sawtooth',
      melody: [62,0,62,65,0,62,69,0,60,0,60,64,0,60,67,65],
      bass: [38,38,38,38,36,36,36,36,34,34,34,34,33,33,36,36], arp: [50,53,57,62] },
    finale: { name: 'The Last Save', bpm: 100, lead: 'triangle',
      melody: [76,0,74,72,0,71,72,74, 76,0,79,0,77,76,74,0, 72,0,71,69,0,67,69,71, 72,0,0,74,76,0,0,0],
      bass: [45,45,45,45,41,41,41,41,43,43,43,43,48,48,48,48], arp: [57,60,64,69] },
    ending: { name: 'Saved Twice', bpm: 80, lead: 'triangle',
      melody: [72,74,76,79,76,74,72,0,69,72,74,76,74,72,71,0],
      bass: [48,48,45,45,41,41,43,43], arp: [60,64,67,72] }
  };
  const PLAYLIST = ['act1', 'act1b', 'act2', 'act2b', 'act3', 'act3b', 'finale'];

  function AudioSystem() {
    let context = null, master = null, timer = null, nextNote = 0, position = 0, song = 'title';
    let enabled = true, volume = 0.35, noise = null, tension = 0;
    function init() {
      if (context) { if (context.state === 'suspended') context.resume().catch(function () {}); return true; }
      const Ctx = root.AudioContext || root.webkitAudioContext;
      if (!Ctx) return false;
      try {
        context = new Ctx();
        master = context.createGain();
        master.gain.value = 1;
        // A little "speaker" colour: low-pass like a beige PC speaker.
        const tone = context.createBiquadFilter();
        tone.type = 'lowpass'; tone.frequency.value = 5200;
        master.connect(tone); tone.connect(context.destination);
        noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.5), context.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        return true;
      } catch (_) { return false; }
    }
    const hz = function (midi) { return 440 * Math.pow(2, (midi - 69) / 12); };
    function note(midi, at, duration, gain, wave, slideTo) {
      if (!context || !enabled || !midi) return;
      const osc = context.createOscillator(), amp = context.createGain();
      osc.type = wave || 'square';
      osc.frequency.setValueAtTime(hz(midi), at);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(hz(slideTo), at + duration);
      amp.gain.setValueAtTime(0.0001, at);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * volume), at + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      osc.connect(amp); amp.connect(master);
      osc.start(at); osc.stop(at + duration + 0.02);
    }
    function hiss(at, gain, length, high) {
      if (!context || !enabled || !noise) return;
      const source = context.createBufferSource(), amp = context.createGain(), f = context.createBiquadFilter();
      f.type = high ? 'highpass' : 'bandpass'; f.frequency.value = high ? 6000 : 1800;
      source.buffer = noise; amp.gain.setValueAtTime(gain * volume, at);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + (length || 0.09));
      source.connect(f); f.connect(amp); amp.connect(master); source.start(at); source.stop(at + (length || 0.09) + 0.02);
    }
    function tick() {
      if (!context || !enabled || (root.document && root.document.hidden)) return;
      const s = SONGS[song], beat = 60 / (s.bpm + tension * 12) / 4;
      if (nextNote < context.currentTime) nextNote = context.currentTime + 0.04;
      while (nextNote < context.currentTime + 0.2) {
        const step = position % s.melody.length;
        if (step % 2 === 0) note(s.melody[step], nextNote, beat * 1.7, 0.05, s.lead);
        else if (s.melody[step]) note(s.melody[step], nextNote, beat * 1.2, 0.04, s.lead);
        if (step % 4 === 0) note(s.bass[(step / 4) % s.bass.length], nextNote, beat * 3.2, 0.07, 'triangle');
        if (s.arp && step % 2 === 1) note(s.arp[(step >> 1) % s.arp.length] + 12, nextNote, beat * 0.8, 0.018, 'square');
        if (step % 8 === 0) { note(36, nextNote, 0.12, 0.09, 'sine', 24); }                // kick
        if (step % 8 === 4) hiss(nextNote, 0.05, 0.12);                                   // snare
        if (step % 2 === 0) hiss(nextNote, tension ? 0.02 : 0.012, 0.03, true);           // hat
        nextNote += beat; position++;
      }
    }
    function play(name) {
      if (SONGS[name] && name !== song) { song = name; position = 0; nextNote = 0; }
      if (!init() || !enabled) return;
      if (!timer) { nextNote = context.currentTime + 0.05; timer = root.setInterval(tick, 40); }
    }
    function stop() { if (timer) root.clearInterval(timer); timer = null; }
    function sfx(name) {
      if (!enabled || !init()) return;
      const now = context.currentTime + 0.005;
      switch (name) {
        case 'step': note(84, now, 0.025, 0.025, 'square'); break;
        case 'collect': note(76, now, 0.06, 0.12); note(83, now + 0.05, 0.06, 0.11); note(88, now + 0.1, 0.12, 0.1); break;
        case 'last': [76, 79, 83, 88, 91].forEach(function (m, i) { note(m, now + i * 0.05, 0.12, 0.1, 'square'); }); break;
        case 'key': note(72, now, 0.09, 0.12); note(79, now + 0.08, 0.1, 0.12); note(84, now + 0.16, 0.2, 0.1, 'triangle'); break;
        case 'door': note(48, now, 0.18, 0.12, 'sawtooth', 60); hiss(now + 0.05, 0.08, 0.2); break;
        case 'portal': note(60, now, 0.25, 0.1, 'sine', 84); note(67, now + 0.05, 0.25, 0.06, 'triangle', 91); break;
        case 'near': note(90, now, 0.05, 0.05, 'square'); note(86, now + 0.07, 0.05, 0.05, 'square'); break;
        case 'die': note(64, now, 0.4, 0.14, 'sawtooth', 28); hiss(now, 0.2, 0.45); break;
        case 'win': [60, 64, 67, 72, 76, 79, 84].forEach(function (m, i) { note(m, now + i * 0.07, 0.3, 0.1, 'triangle'); }); break;
        case 'buy': note(84, now, 0.08, 0.1); note(88, now + 0.08, 0.18, 0.1); break;
        case 'move': note(72, now, 0.03, 0.05, 'square'); break;
        case 'select': note(76, now, 0.05, 0.08, 'square'); note(84, now + 0.05, 0.08, 0.08, 'square'); break;
        case 'back': note(72, now, 0.05, 0.06, 'square'); note(65, now + 0.05, 0.08, 0.06, 'square'); break;
        case 'type': hiss(now, 0.03, 0.02, true); break;
        case 'boot': // a PC speaker beep, then the hard drive spinning up
          note(83, now, 0.18, 0.08, 'square');
          for (let i = 0; i < 10; i++) hiss(now + 0.25 + i * 0.06, 0.03, 0.03);
          break;
        case 'modem': // original dial-up style handshake, a few seconds of beeps and static
          [69, 74, 69, 74, 81].forEach(function (m, i) { note(m, now + i * 0.11, 0.1, 0.05, 'sine'); });
          note(88, now + 0.6, 0.5, 0.04, 'square', 76); hiss(now + 0.7, 0.05, 0.6);
          break;
        case 'act': [67, 72, 76].forEach(function (m, i) { note(m, now + i * 0.12, 0.35, 0.08, 'triangle'); }); break;
        default: note(60, now, 0.04, 0.06);
      }
    }
    return {
      play: play, stop: stop, sfx: sfx,
      setTension: function (on) { tension = on ? 1 : 0; },
      setEnabled: function (value) { enabled = Boolean(value); if (!enabled) stop(); },
      setVolume: function (value) { volume = Math.max(0, Math.min(1, Number(value) || 0)); },
      songFor: function (missionIndex, missionCount) {
        if (missionIndex >= missionCount - 1) return 'finale';
        return PLAYLIST[Math.min(PLAYLIST.length - 2, Math.floor(missionIndex / 2))];
      },
      songName: function (name) { return SONGS[name] ? SONGS[name].name : ''; }
    };
  }
  root.Chiptune = { create: AudioSystem, songs: Object.keys(SONGS) };
})(typeof window !== 'undefined' ? window : globalThis);
