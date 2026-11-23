// The test report in the README, made by the game's own rules: for every mission, the board, what is on it, and the
// shortest winning route the solver finds (which proves the mission can be won). Run: node tests/report.cjs
'use strict';
const Logic = require('../js/logic.js');
const { missions, actOf } = require('../js/missions.js');

const rows = [];
let totalMs = 0;
missions.forEach((def, i) => {
  const L = Logic.parse(def);
  const count = (k) => L.bugs.filter((b) => b.kind === k).length;
  const t = process.hrtime.bigint();
  const path = Logic.solve(L);
  const ms = Number(process.hrtime.bigint() - t) / 1e6;
  totalMs += ms;
  // Replay the route through the real rules: it must end on the floppy disk with every spark.
  let s = Logic.newGame(L);
  for (const d of path || []) s = Logic.step(s, d);
  rows.push({
    n: i + 1, title: def.title, act: actOf(i).title.split(':')[0].replace('ACT ', 'Act '),
    size: L.w + 'x' + L.h, sparks: L.frags.length,
    dust: count('dust'), virus: count('virus'), glitch: count('glitch'),
    key: def.map.join('').includes('K') ? 'yes' : '', portals: def.map.join('').includes('1') ? 'yes' : '',
    route: path ? path.length : 'NONE', proved: s.status === 'won' && s.got === s.total ? 'won' : 'FAILED', ms: ms.toFixed(0)
  });
});

const head = ['#', 'Mission', 'Act', 'Board', 'Sparks', 'Dust', 'Virus', 'Glitch', 'Key', 'Portals', 'Shortest win', 'Replayed'];
console.log('| ' + head.join(' | ') + ' |');
console.log('|' + head.map(() => '---').join('|') + '|');
for (const r of rows) console.log('| ' + [r.n, r.title, r.act, r.size, r.sparks, r.dust || '', r.virus || '', r.glitch || '', r.key, r.portals, r.route + ' moves', r.proved].join(' | ') + ' |');
const won = rows.filter((r) => r.proved === 'won').length;
console.log('');
console.log(won + ' of ' + rows.length + ' missions proved winnable; ' + rows.reduce((a, r) => a + (typeof r.route === 'number' ? r.route : 0), 0) + ' moves for a perfect run of the whole game; solved in ' + (totalMs / 1000).toFixed(1) + ' s.');
if (won !== rows.length) process.exitCode = 1;
