const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const packetCount = document.querySelector('#packet-count');
const status = document.querySelector('#status');
const hint = document.querySelector('#hint');
const start = document.querySelector('#start');
const pause = document.querySelector('#pause');
const restart = document.querySelector('#restart');
const STORAGE = 'after-school-99-mission-1';
const packets = [{x:5,y:2},{x:9,y:4},{x:3,y:6}];
const exit = {x:10,y:6};
const directions = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const fresh = () => ({body:[{x:2,y:2},{x:1,y:2}], collected:0, mode:'ready'});
let state = fresh();
let message = 'Press Start to wake Pip.';

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE));
  if (saved && Array.isArray(saved.body) && saved.body.length > 0 && saved.body.every(p => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.x < 12 && p.y >= 0 && p.y < 8) && Number.isInteger(saved.collected) && saved.collected >= 0 && saved.collected <= 3 && ['ready','playing','paused','won'].includes(saved.mode)) {
    state = saved;
    if (state.mode === 'playing') state.mode = 'paused';
    message = state.mode === 'won' ? 'You saved the first memory. More adventures await.' : 'Your checkpoint is ready. Press Resume to continue.';
  }
} catch { /* Storage may be unavailable; the game still works for this session. */ }

function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify(state)); }
  catch { message += ' Saving is unavailable in this browser.'; }
}
function draw() {
  ctx.fillStyle = '#162539'; ctx.fillRect(0,0,720,480);
  ctx.strokeStyle = '#24394a'; ctx.lineWidth = 1;
  for (let x=0;x<=720;x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,480); ctx.stroke(); }
  for (let y=0;y<=480;y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(720,y); ctx.stroke(); }
  ctx.fillStyle = state.collected === 3 ? '#78e1c1' : '#536676';
  ctx.fillRect(exit.x*60+12,exit.y*60+6,36,48);
  ctx.fillStyle = '#142537'; ctx.fillRect(exit.x*60+18,exit.y*60+12,24,36);
  ctx.fillStyle = '#ffd282'; ctx.fillRect(exit.x*60+36,exit.y*60+28,4,4);
  packets.forEach((p,i) => {
    if (i < state.collected) return;
    ctx.fillStyle = i === state.collected ? '#ffd282' : '#6b7c87';
    ctx.beginPath(); ctx.arc(p.x*60+30,p.y*60+30,17,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#142537'; ctx.font = 'bold 18px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(i+1),p.x*60+30,p.y*60+31);
  });
  state.body.slice().reverse().forEach((p,i) => {
    const head = i === state.body.length-1;
    ctx.fillStyle = head ? '#ffdb99' : '#70cdb6';
    ctx.fillRect(p.x*60+7,p.y*60+7,46,46);
    if (head) {ctx.fillStyle='#22344b'; ctx.fillRect(p.x*60+18,p.y*60+20,5,5); ctx.fillRect(p.x*60+37,p.y*60+20,5,5); ctx.fillRect(p.x*60+23,p.y*60+34,14,3);}
  });
  packetCount.textContent = `${state.collected} / 3`;
  status.textContent = {ready:'READY TO BOOT',playing:'EXPLORING',paused:'PAUSED',won:'FIRST SAVE FOUND'}[state.mode];
  hint.textContent = message;
  start.textContent = state.mode === 'won' ? 'Play again' : state.mode === 'playing' ? 'Adventure started' : state.mode === 'paused' ? 'Resume adventure' : 'Start adventure';
  start.disabled = state.mode === 'playing';
  pause.textContent = state.mode === 'paused' ? 'Resume' : 'Pause';
  pause.disabled = state.mode === 'ready' || state.mode === 'won';
}
function move(direction) {
  if (state.mode !== 'playing') { message = state.mode === 'won' ? 'First save complete. Play again to revisit.' : 'Start or resume the adventure first.'; draw(); return; }
  const [dx,dy] = directions[direction];
  const next = {x:state.body[0].x+dx,y:state.body[0].y+dy};
  const grows = state.collected < 3 && next.x === packets[state.collected].x && next.y === packets[state.collected].y;
  const collision = next.x < 0 || next.x >= 12 || next.y < 0 || next.y >= 8 || state.body.slice(0,grows ? undefined : -1).some(p => p.x===next.x && p.y===next.y);
  if (collision) {
    state.body = fresh().body;
    message = 'Bumped! Pip returned to the bedroom checkpoint. Your packets are safe.';
  } else {
    state.body.unshift(next);
    if (grows) { state.collected++; message = state.collected === 3 ? 'All memories recovered! Find the glowing door.' : `Memory ${state.collected} saved. Find packet ${state.collected+1}.`; }
    else { state.body.pop(); message = 'Keep going. Memories must be collected in order.'; }
    if (next.x === exit.x && next.y === exit.y && state.collected === 3) {state.mode='won'; message='First save complete! Dot: “You remembered. That means we can begin again.”';}
  }
  save(); draw();
}
start.addEventListener('click', () => { if(state.mode==='won') state=fresh(); state.mode='playing'; message='Pip is awake. Find memory packet 1.'; save(); draw(); });
pause.addEventListener('click', () => { state.mode = state.mode === 'playing' ? 'paused' : 'playing'; message = state.mode === 'paused' ? 'Paused. Your checkpoint is saved.' : 'Back to the bedroom.'; save(); draw(); });
restart.addEventListener('click', () => { state=fresh(); message='Mission restarted. Press Start to wake Pip.'; save(); draw(); });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => move(button.dataset.direction)));
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  const direction = {arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[key];
  if (direction && !event.repeat && !['BUTTON','INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {event.preventDefault(); move(direction);}
});
draw();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
