s = open('index.html').read()

def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a))
    s = s.replace(a, b)

rep('<script src="js/missions.js"></script>', '<script src="js/missions.js"></script>\n<script src="js/gd-render.js"></script>')
rep("let save={mission:0,finished:false},", "let skinI=0,faceI=0,practice=false,cp=null,attempts=0,parts=[];\nlet save={mission:0,finished:false},")
rep("if(CTRLS.includes(o.ctrl))ctrl=o.ctrl}",
    "if(CTRLS.includes(o.ctrl))ctrl=o.ctrl;if(Number.isInteger(o.skin)&&o.skin>=0&&o.skin<GDRender.SKINS.length)skinI=o.skin;if(Number.isInteger(o.face)&&o.face>=0&&o.face<GDRender.FACES.length)faceI=o.face}")
rep("JSON.stringify({mode,sound,ctrl})", "JSON.stringify({mode,sound,ctrl,skin:skinI,face:faceI})")
rep("function restart(){if(!L)return;S=Logic.newGame(L);dir='right';running=false;hud();hideCard();toast('')}",
    "function restart(){if(!L)return;if(practice&&cp){S=cp}else{S=Logic.newGame(L);cp=null}dir='right';running=false;parts=[];attempts++;hud();hideCard();toast(practice&&cp?'Back at your checkpoint.':'')}")
rep("idx=i;L=Logic.parse(M[i]);S=Logic.newGame(L);dir='right';", "idx=i;L=Logic.parse(M[i]);S=Logic.newGame(L);dir='right';cp=null;attempts=1;parts=[];")
rep("$('hMem').textContent=S?'Memories '+S.got+'/'+S.total:'Memories —';",
    "$('hMem').textContent=S?'Memories '+S.got+'/'+S.total+(attempts?' · Attempt '+attempts:''):'Memories —';")
rep("$('bMode').textContent='Mode: '", "$('bPractice').textContent='Practice: '+(practice?'On':'Off');$('bMode').textContent='Mode: '")
rep('<button class="ghost" id="bMode">', '<button class="ghost" id="bPractice">Practice: Off</button><button class="ghost" id="bMode">')
rep("$('bMode').onclick=",
    "$('bPractice').onclick=()=>{practice=!practice;cp=null;hud();toast(practice?'Practice: a checkpoint is saved each time you collect a memory.':'Practice off.')};\n$('bMode').onclick=")
open('index.html', 'w').write(s)
t = open('sw.js').read().replace("v12", "v13").replace("'./js/missions.js']", "'./js/missions.js', './js/gd-render.js']")
open('sw.js', 'w').write(t)
