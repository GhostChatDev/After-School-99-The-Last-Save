/* Geometry Dash Neon Arcade Renderer & Features for After School '99: The Last Save */
(function (root) {
  'use strict';

  const SKINS = [
    { id: 'classic', name: 'GD Gold & Cyan', primary: '#ffcf00', secondary: '#00f6ff', trail: '#ff8a00' },
    { id: 'pip', name: 'Pip Mint ’99', primary: '#4dffb5', secondary: '#ffd84a', trail: '#00e5ff' },
    { id: 'demon', name: 'Crimson Demon', primary: '#ff2a55', secondary: '#ffe600', trail: '#ff007f' },
    { id: 'plasma', name: 'Plasma Violet', primary: '#b537f2', secondary: '#00f6ff', trail: '#ff66ff' },
    { id: 'cobalt', name: 'Electric Blue', primary: '#1e90ff', secondary: '#76ff03', trail: '#00f6ff' },
    { id: 'toxic', name: 'Neon Hazard', primary: '#76ff03', secondary: '#11172c', trail: '#ffd84a' }
  ];

  const FACES = [
    { id: 'cube', name: 'Classic Cube' },
    { id: ' grin', name: 'Dash Grin' },
    { id: 'determined', name: 'Demon Brow' },
    { id: 'visor', name: 'Cyber Visor' },
    { id: 'cyclops', name: 'Neon Cyclops' },
    { id: 'happy', name: 'Star Hero' }
  ];
  FACES[1].id = 'grin';

  const DIFFICULTIES = [
    { name: 'Easy', stars: 2, color: '#2499ff', rim: '#8cd0ff', brow: 0, mouth: 'smile', horns: 0 },
    { name: 'Normal', stars: 3, color: '#2ecc40', rim: '#98ff98', brow: 0, mouth: 'grin', horns: 0 },
    { name: 'Hard', stars: 5, color: '#ff851b', rim: '#ffd19a', brow: 1, mouth: 'open', horns: 0 },
    { name: 'Harder', stars: 7, color: '#ff3b30', rim: '#ffa39e', brow: 2, mouth: 'teeth', horns: 0 },
    { name: 'Insane', stars: 9, color: '#d946ef', rim: '#f5b8ff', brow: 2, mouth: 'fierce', horns: 1 },
    { name: 'Demon', stars: 10, color: '#e11d48', rim: '#ff9ebb', brow: 3, mouth: 'demon', horns: 2 }
  ];

  function getDifficulty(missionIdx) {
    const tier = Math.min(DIFFICULTIES.length - 1, Math.floor(missionIdx / 2));
    return DIFFICULTIES[tier];
  }

  function diffFaceSVG(missionIdx, size) {
    const d = getDifficulty(missionIdx);
    const s = size || 28;
    const horns = d.horns === 2
      ? '<path d="M4,9 L1,2 L9,5 Z M24,9 L27,2 L19,5 Z" fill="#fff" stroke="#2a0814" stroke-width="1.2"/>'
      : d.horns === 1
      ? '<path d="M5,8 L3,3 L9,6 Z M23,8 L25,3 L19,6 Z" fill="#ffd84a" stroke="#2a0814" stroke-width="1"/>'
      : '';
    const eyes = d.horns >= 1
      ? '<circle cx="10" cy="13" r="2.6" fill="#ffeb3b"/><circle cx="18" cy="13" r="2.6" fill="#ffeb3b"/>'
      : '<circle cx="10" cy="13" r="2.4" fill="#111"/><circle cx="18" cy="13" r="2.4" fill="#111"/><circle cx="9.3" cy="12.2" r="0.9" fill="#fff"/><circle cx="17.3" cy="12.2" r="0.9" fill="#fff"/>';
    const brows = d.brow >= 2
      ? '<path d="M6,9 L13,12 M22,9 L15,12" stroke="#111" stroke-width="2" stroke-linecap="round"/>'
      : d.brow === 1
      ? '<path d="M7,10 L13,11 M21,10 L15,11" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>'
      : '';
    let mouth = '<path d="M9,18 Q14,22 19,18" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"/>';
    if (d.mouth === 'open') mouth = '<ellipse cx="14" cy="19" rx="3.5" ry="2.5" fill="#111"/>';
    else if (d.mouth === 'teeth' || d.mouth === 'fierce' || d.mouth === 'demon') {
      mouth = '<path d="M8,17 L20,17 L18,22 L10,22 Z" fill="#fff" stroke="#111" stroke-width="1.4"/><line x1="12" y1="17" x2="12" y2="22" stroke="#111" stroke-width="1"/><line x1="16" y1="17" x2="16" y2="22" stroke="#111" stroke-width="1"/>';
    }
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 28 28" aria-hidden="true" style="vertical-align:middle;flex-shrink:0">' +
      horns +
      '<circle cx="14" cy="15" r="11" fill="' + d.color + '" stroke="#070a18" stroke-width="2"/>' +
      '<path d="M6,11 A9,9 0 0,1 22,11" fill="none" stroke="' + d.rim + '" stroke-width="1.6" opacity="0.65"/>' +
      eyes + brows + mouth + '</svg>';
  }

  function drawGhostMascot(ctx, cx, cy, r, t, isPatrol, seed) {
    const bob = Math.sin(t / 160 + (seed || 0)) * 2.5;
    const y = cy + bob;
    const bodyCol = isPatrol ? '#e0b0ff' : '#ff4d79';
    const glowCol = isPatrol ? 'rgba(181,55,242,0.38)' : 'rgba(255,42,85,0.42)';
    const eyeCol = isPatrol ? '#00f6ff' : '#ffea00';

    ctx.save();
    // Outer neon aura
    ctx.fillStyle = glowCol;
    ctx.beginPath();
    ctx.arc(cx, y, r * 1.28, 0, Math.PI * 2);
    ctx.fill();

    // Ghost Mascot silhouette (dome top + 3 wavy skirt folds)
    ctx.fillStyle = bodyCol;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, y - 2, r * 0.85, Math.PI, 0, false);
    const right = cx + r * 0.85, left = cx - r * 0.85, bot = y + r * 0.85;
    ctx.lineTo(right, bot);
    const w3 = (right - left) / 3;
    for (let i = 0; i < 3; i++) {
      const x1 = right - i * w3;
      const x2 = right - (i + 0.5) * w3;
      const x3 = right - (i + 1) * w3;
      ctx.quadraticCurveTo(x2, bot - 5, x3, bot);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Angry/spooky mascot brow & glowing eyes
    ctx.fillStyle = '#12072b';
    ctx.beginPath();
    ctx.arc(cx - 4.5, y - 2, 3.2, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, y - 2, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeCol;
    ctx.fillRect(cx - 5.8, y - 3.2, 2.6, 2.6);
    ctx.fillRect(cx + 3.2, y - 3.2, 2.6, 2.6);

    // Mascot mischievous fang mouth
    ctx.strokeStyle = '#12072b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 5, y + 4);
    ctx.lineTo(cx - 2, y + 6);
    ctx.lineTo(cx + 2, y + 4);
    ctx.lineTo(cx + 5, y + 6);
    ctx.stroke();
    ctx.restore();
  }

  root.GDRender = {
    SKINS: SKINS,
    FACES: FACES,
    DIFFICULTIES: DIFFICULTIES,
    getDifficulty: getDifficulty,
    diffFaceSVG: diffFaceSVG,
    drawGhostMascot: drawGhostMascot
  };
})(typeof window !== 'undefined' ? window : globalThis);
