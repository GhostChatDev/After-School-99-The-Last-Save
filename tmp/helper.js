function drawFace(px,py,f,d){
  const e=d==='left'?[-2,-2]:d==='right'?[2,-2]:d==='up'?[0,-3]:[0,2],x=px+CELL/2+e[0],y=py+CELL/2+e[1];
  ctx.fillStyle='#0a0f20';ctx.strokeStyle='#0a0f20';ctx.lineWidth=2;
  if(f===1){ctx.fillRect(x-10,y-6,20,6);ctx.fillStyle='#fff';ctx.fillRect(x-8,y-5,5,2);ctx.fillRect(x+3,y-5,5,2);ctx.fillStyle='#0a0f20';ctx.fillRect(x-5,y+5,10,2)}
  else if(f===2){ctx.fillRect(x-8,y-3,6,2);ctx.fillRect(x+2,y-3,6,2);ctx.beginPath();ctx.arc(x,y+6,3,0,7);ctx.fill()}
  else if(f===3){ctx.fillRect(x-8,y-2,5,6);ctx.fillRect(x+3,y-2,5,6);ctx.beginPath();ctx.moveTo(x-10,y-8);ctx.lineTo(x-2,y-4);ctx.moveTo(x+10,y-8);ctx.lineTo(x+2,y-4);ctx.stroke();ctx.fillRect(x-5,y+7,10,2)}
  else if(f===4){ctx.fillStyle='#ff2a55';ctx.fillRect(x-9,y-5,7,7);ctx.fillRect(x+2,y-5,7,7);ctx.fillStyle='#0a0f20';ctx.fillRect(x-6,y+6,12,2);ctx.fillRect(x-1,y-12,2,6)}
  else{ctx.fillRect(x-8,y-6,5,6);ctx.fillRect(x+3,y-6,5,6);ctx.beginPath();ctx.arc(x,y+2,6,.2,Math.PI-.2);ctx.stroke()}
}
function iconKit(back){
  card.classList.remove('hidden');card.innerHTML='';over=true;running=false;
  const h=document.createElement('h2');h.textContent='Icon Kit';card.appendChild(h);
  const p=document.createElement('p');p.textContent='Pick Pip\u2019s colour and face. It is saved on this device.';card.appendChild(p);
  const mk=(label,items,cur,set)=>{const r=document.createElement('div');r.className='row';r.setAttribute('role','group');r.setAttribute('aria-label',label);
    items.forEach((it,i)=>{const b=document.createElement('button');b.textContent=it.t;b.setAttribute('aria-pressed',String(i===cur));if(i!==cur)b.className='ghost';if(it.c){b.style.borderColor=it.c}
      b.onclick=()=>{set(i);store();iconKit(back)};r.appendChild(b)});card.appendChild(r)};
  mk('Colour',SKINS.map((c,i)=>({t:'Colour '+(i+1),c:'hsl('+c+',100%,62%)'})),SKINS.indexOf(skin),i=>{skin=SKINS[i]});
  mk('Face',FACES.map(t=>({t})),face,i=>{face=i});
  const pv=document.createElement('canvas');pv.width=80;pv.height=80;pv.setAttribute('aria-label','Preview');card.appendChild(pv);
  const c2=pv.getContext('2d'),keep=ctx;ctx=c2;c2.fillStyle='hsl('+skin+',100%,70%)';c2.fillRect(0,0,80,80);drawFace(20,20,face,'right');ctx=keep;
  const row=document.createElement('div');row.className='row';const b=document.createElement('button');b.textContent='Back';b.onclick=back;row.appendChild(b);card.appendChild(row);
}
