const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Read the authored layouts rather than keeping a second copy in the test.
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/const levels=\[([\s\S]*?)\n\];/);
assert.ok(match, 'The game must expose its authored level list');
const levels = vm.runInNewContext(`[${match[1]}]`, Object.create(null), { timeout: 1000 });

function routeExists(start, target, walls) {
  const blocked = new Set(walls.map(([x, y]) => `${x},${y}`));
  const queue = [start];
  const seen = new Set([start.join(',')]);
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    if (x === target[0] && y === target[1]) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = [x + dx, y + dy];
      const key = next.join(',');
      if (next[0] < 0 || next[0] >= 12 || next[1] < 0 || next[1] >= 9 || blocked.has(key) || seen.has(key)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return false;
}

test('each milestone mission has valid, reachable ordered objectives', () => {
  assert.equal(levels.length, 6);
  for (const level of levels) {
    assert.equal(level.mem.length, 3, level.title);
    const walls = new Set(level.walls.map(p => p.join(',')));
    const points = [[1, 1], ...level.mem, level.door];
    const keys = points.map(p => p.join(','));
    assert.equal(new Set(keys).size, points.length, `${level.title}: overlapping objectives`);
    for (const p of points) {
      assert.ok(p.length === 2 && p.every(Number.isInteger) && p[0] >= 0 && p[0] < 12 && p[1] >= 0 && p[1] < 9, `${level.title}: invalid position`);
      assert.ok(!walls.has(p.join(',')), `${level.title}: objective inside wall`);
    }
    for (let i = 1; i < points.length; i++) {
      assert.ok(routeExists(points[i - 1], points[i], level.walls), `${level.title}: objective ${i} is unreachable`);
    }
  }
});
