p='index.html';s=open(p).read()
def rep(a,b):
    global s
    assert a in s, a[:50]
    s=s.replace(a,b,1)
rep("let save={mission:0,finished:false},","let skin=155,face=0,save={mission:0,finished:false},")
rep("if(CTRLS.includes(o.ctrl))ctrl=o.ctrl}","if(CTRLS.includes(o.ctrl))ctrl=o.ctrl;if(SKINS.includes(o.skin))skin=o.skin;if(Number.isInteger(o.face)&&o.face>=0&&o.face<FACES.length)face=o.face}")
rep("const CTRLS=['split'","const SKINS=[155,190,280,330,45,0],FACES=['Happy','Cool','Sleepy','Angry','Robot'];\nconst CTRLS=['split'")
rep("JSON.stringify({mode,sound,ctrl})","JSON.stringify({mode,sound,ctrl,skin,face})")
rep("'hsl(155,100%,'+(62-k*28)+'%)'","'hsl('+skin+',100%,'+(62-k*28)+'%)'")
rep("i===0?'#9dffd6'","i===0?'hsl('+skin+',100%,78%)'")
a=s.index("    if(i===0){ctx.fillStyle='#0a0f20';const e=dir")
b=s.index("  if(S.status==='dead')")
s=s[:a]+"    if(i===0)drawFace(px,py,face,dir)}\n"+s[b:]
helper=open('/tmp/helper.js').read()
rep("function title(){",helper+"function title(){")
rep("const cv=$('cv'),ctx=cv.getContext('2d'),card=$('card');","const cv=$('cv'),card=$('card');let ctx=cv.getContext('2d');")
rep("  b.push(['Choose mission',()=>missionPicker(false),1]);","  b.push(['Choose mission',()=>missionPicker(false),1]);b.push(['Icon Kit',()=>iconKit(title),1]);")
rep("button.textContent=(i<=unlocked?'\u25b6 ':'\U0001F512 ')+(i+1)+'. '+mission.title;","button.textContent=(i<=unlocked?'\u25b6 ':'Locked ')+(i+1)+'. '+mission.title+' '+['(:)','(8)','(>:)'][Math.min(2,Math.floor(i/4))];")
open(p,'w').write(s)
w=open('sw.js').read().replace('chapter-one-v12','chapter-one-v13');open('sw.js','w').write(w)
s=open(p).read().replace("sw.js?v=12","sw.js?v=13");open(p,'w').write(s)
