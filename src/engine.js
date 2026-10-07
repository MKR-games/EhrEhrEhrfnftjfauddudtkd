/* Broadcast-style rule motion graphics. All artwork drawn by Canvas at each time.
   No raster, reference footage, sprites, brush scan lines or artificial line boiling. */
(function(root){'use strict';
const D=root.TTOK_RULES,W=1280,H=720;
const C={paper:'#ddd4c2',cream:'#f4ead4',ink:'#292824',muted:'#746b5d',gold:'#b98e43',lightGold:'#ead5a2',red:'#9e3c34',green:'#386a58',purple:'#665773',blue:'#526d7f',dark:'#20231f'};
const colors=['#93463a','#4e7766','#537083','#927445','#51494b'];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const ease=x=>{x=clamp(x);return 1-(1-x)**3;};
const step=(s,a,b)=>ease((s-a)/(b-a));
const mix=(a,b,p)=>a+(b-a)*p;
const hash=(x,y=0)=>{let n=(Math.imul(x|0,1597334677)^Math.imul(y|0,3812015801))>>>0;n^=n>>>16;return(n>>>0)/4294967295;};
let c,t,tm,shot;
function path(pts,fill,stroke=null,width=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function rect(x,y,w,h,fill,r=0,stroke=null,width=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(x,y,xx,yy,color=C.ink,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function circle(x,y,r,fill,stroke=null,width=1){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function ellipse(x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function gradient(y1,y2,a,b){const g=c.createLinearGradient(0,y1,0,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function txt(s,x,y,size=28,color=C.ink,bold=false,align='center',max=1160){c.fillStyle=color;c.font=`${bold?700:400} ${size}px Pretendard`;c.textAlign=align;c.textBaseline='middle';let w=c.measureText(s).width;if(w>max)c.font=`${bold?700:400} ${size*max/w}px Pretendard`;c.fillText(s,x,y);}
function label(s,x,y,w=150,color=C.ink,size=19){rect(x-w/2,y-18,w,36,color,3);line(x-w/2+3,y-17,x+w/2-3,y-17,'#ffffff35',1);txt(s,x,y,size,C.cream,true,'center',w-14);}
function badge(s,x,y,r=27,color=C.red,size=29){c.save();c.shadowColor='#0003';c.shadowBlur=8;c.shadowOffsetY=3;circle(x,y,r,color,C.lightGold,2);c.restore();txt(s,x,y,size,C.cream,true,'center',r*1.7);}
function group(s,delay,fn,{fromX=0,fromY=22,scale=.95,duration=.7}={}){let p=step(s,delay,delay+duration);if(p<=0)return;c.save();c.globalAlpha*=p;c.translate(fromX*(1-p),fromY*(1-p));fn(p);c.restore();}
function arrow(x1,y1,x2,y2,color=C.gold,p=1,width=3){let xx=mix(x1,x2,p),yy=mix(y1,y2,p),a=Math.atan2(y2-y1,x2-x1);line(x1,y1,xx,yy,color,width);if(p>.05)path([[xx,yy],[xx-12*Math.cos(a-.44),yy-12*Math.sin(a-.44)],[xx-12*Math.cos(a+.44),yy-12*Math.sin(a+.44)]],color);}
function tick(x,y,color=C.green,size=16){c.beginPath();c.moveTo(x-size*.7,y);c.lineTo(x-size*.15,y+size*.55);c.lineTo(x+size*.9,y-size*.65);c.lineWidth=5;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.stroke();}
function cross(x,y,color=C.red,size=15){line(x-size,y-size,x+size,y+size,color,5);line(x+size,y-size,x-size,y+size,color,5);}
function seal(ok,x,y,p=1,scale=1){if(p<=0)return;c.save();c.translate(x,y);const z=(1+.4*(1-p))*scale;c.scale(z,z);c.globalAlpha*=p;circle(0,0,27,ok?C.green:C.red,C.cream,3);if(ok)tick(0,0,C.cream,15);else cross(0,0,C.cream,10);c.restore();}
function eye(x,y,color=C.ink,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);c.beginPath();c.moveTo(-20,0);c.quadraticCurveTo(0,-22,20,0);c.quadraticCurveTo(0,22,-20,0);c.strokeStyle=color;c.lineWidth=3;c.stroke();circle(0,0,6,color);c.restore();}
function lock(x,y,size=30,color=C.ink,open=0){c.save();c.translate(x,y);c.scale(size/30,size/30);rect(-17,-1,34,28,color,4);c.beginPath();c.moveTo(-10,-1);c.lineTo(-10,-12);c.bezierCurveTo(-10,-28,11,-28,11,-12);c.lineTo(11,-2-14*open);c.strokeStyle=color;c.lineWidth=6;c.stroke();circle(0,10,3,C.cream);line(0,10,0,17,C.cream,2);c.restore();}
function magnifier(x,y,size=30,color=C.cream){c.save();c.translate(x,y);c.scale(size/30,size/30);circle(-5,-5,13,null,color,4);line(5,5,20,20,color,6);c.restore();}
function bag(x,y,size=30,color=C.cream){c.save();c.translate(x,y);c.scale(size/30,size/30);rect(-20,-8,40,31,color,4);rect(-9,-19,18,13,null,4,color,4);line(-17,2,17,2,'#ffffff55',2);rect(-3,-1,6,7,C.gold,1);c.restore();}
function qr(x,y,size=55,color=C.ink){const u=size/9;c.save();c.translate(x-size/2,y-size/2);for(let j=0;j<9;j++)for(let i=0;i<9;i++){const corner=(i<3&&j<3)||(i>5&&j<3)||(i<3&&j>5);if(corner||hash(i+9*j,4)>.55)rect(i*u,j*u,u*.81,u*.81,color,0);}c.restore();}
function documentIcon(x,y,size=35,color=C.ink){const w=size*.75,h=size;c.save();c.translate(x,y);rect(-w/2,-h/2,w,h,null,2,color,2);for(let j=0;j<3;j++)line(-w*.27,-h*.17+j*h*.2,w*.27,-h*.17+j*h*.2,color,2);c.restore();}
function trophy(x,y,size=36){c.save();c.translate(x,y);c.scale(size/36,size/36);path([[-17,-24],[17,-24],[13,3],[0,15],[-13,3]],gradient(-24,15,'#f3d993','#a27326'));rect(-4,12,8,15,C.gold);rect(-20,26,40,5,C.gold,2);for(const side of[-1,1]){c.beginPath();c.moveTo(side*17,-17);c.bezierCurveTo(side*38,-25,side*37,7,side*10,6);c.strokeStyle=C.gold;c.lineWidth=4;c.stroke();}c.restore();}
function person(x,y,scale=1,index=0,names=true,active=0){
 c.save();c.translate(x,y);c.scale(scale,scale);
 if(active){circle(0,5,77,null,C.gold,4);circle(0,5,85,null,'#b98e4344',1);}
 ellipse(0,106,60,9,'#34291720');
 const skin=['#ba876a','#c09378','#c49e82','#c59c7e','#a8795c'][index],hair=['#342922','#242322','#3c3028','#302926','#302b27'][index];
 if(index===3)path([[-23,-56],[20,-53],[33,-26],[29,29],[38,48],[-35,45],[-30,-23]],hair);
 path([[-54,100],[-54,44],[-25,28],[25,28],[54,44],[54,100]],colors[index]);
 path([[-54,100],[-54,44],[-25,28],[-5,99]],'#00000020');
 path([[-13,7],[13,7],[15,40],[0,51],[-16,39]],skin);
 path([[-25,-42],[0,-59],[25,-42],[25,-7],[12,14],[0,20],[-14,10],[-25,-8]],skin);
 path([[0,-59],[25,-42],[25,-7],[12,14],[0,20]],'#00000010');
 if(index===0)path([[-25,-11],[-28,-40],[-5,-63],[24,-46],[27,-18],[14,-32],[3,-48],[-21,-33]],hair);
 if(index===1)path([[-27,-20],[-25,-44],[-4,-59],[22,-48],[28,-27],[17,-28],[-14,-37],[-22,-16]],hair);
 if(index===2)path([[-26,-13],[-27,-40],[-2,-60],[24,-44],[25,-8],[12,-31],[0,-20],[-15,-33]],hair);
 if(index===3)path([[-28,1],[-26,-44],[-1,-60],[27,-43],[31,-1],[16,-32],[-5,-43],[-15,-17]],hair);
 if(index===4){path([[-28,-14],[-26,-42],[-5,-58],[22,-46],[29,-19],[20,-27],[13,-38],[-13,-39],[-21,-24]],hair);path([[-11,8],[0,12],[12,7],[7,17],[-4,19]],'#47352d');}
 if(index<3){path([[-26,28],[0,51],[-9,71],[-39,37]],'#ece4d6');path([[26,28],[0,51],[9,71],[39,37]],'#f3ead8');rect(-52,80,104,11,'#302f2c');rect(-6,88,9,25,'#302f2c');}
 else{path([[-23,29],[0,52],[-11,78],[-37,41]],'#f1e7d4');path([[23,29],[0,52],[10,79],[36,42]],'#d7cfc0');path([[-4,50],[4,50],[7,77],[0,88],[-7,77]],index===3?'#665042':'#272522');}
 c.restore();if(names)label(D.names[index],x,y+132*scale,Math.max(99,132*scale),colors[index],Math.max(17,23*scale));
}
const cardColor=type=>type==='조사'?C.green:(type==='소지품'||type==='비공개')?C.purple:type==='투표'?C.blue:type==='비밀'?C.purple:C.ink;
function card(x,y,w=90,h=128,type='조사',face=false,rotation=0,flip=1,accent){
 c.save();c.translate(x,y);c.rotate(rotation);c.scale(Math.max(.018,Math.abs(flip)),1);const col=accent||cardColor(type);
 c.shadowColor='#211a1744';c.shadowBlur=10;c.shadowOffsetY=5;rect(-w/2,-h/2,w,h,face?'#f8f1e3':col,5);c.shadowBlur=0;c.shadowOffsetY=0;
 rect(-w/2,-h/2,w,h,null,5,C.gold,1.5);rect(-w/2+5,-h/2+5,w-10,h-10,null,2,face?'#baa58380':'#e7d4a766',.8);
 if(face){rect(-w/2+5,-h/2+5,w-10,24,col,2);txt(type==='투표'?'지목':type==='비밀'?'간파':'단서',0,-h/2+18,Math.min(17,w*.19),C.cream,true,'center',w-10);
  for(let j=0;j<4;j++)line(-w*.29,-h*.03+j*h*.112,w*(j===3?.07:.29),-h*.03+j*h*.112,'#827765',1.4);
 }else{
  txt(type,0,-h*.29,Math.min(18,w*.21),C.cream,true,'center',w-12);
  if(type==='조사')magnifier(0,h*.08,w*.26);
  else if(type==='소지품')bag(0,h*.06,w*.28);
  else if(type==='QR')qr(0,h*.10,w*.45,C.cream);
  else if(type==='캐릭터'){circle(0,-h*.01,w*.10,C.cream);path([[-w*.2,h*.26],[-w*.2,h*.15],[0,h*.05],[w*.2,h*.15],[w*.2,h*.26]],C.cream);}
  else if(type==='비밀'||type==='미선택'||type==='비공개')lock(0,h*.1,w*.21,C.cream);
  else{documentIcon(0,h*.09,w*.4,C.cream);}
  line(-w*.2,h*.36,w*.2,h*.36,'#e5cf9955',1);
 }
 c.restore();
}
function flight(ax,ay,bx,by,p,fn,height=35){const x=mix(ax,bx,p),y=mix(ay,by,p)-Math.sin(p*Math.PI)*height;fn(x,y,(1-p)*-.15);}
function stack(x,y,type,w=92,h=130,count=3,front=false){for(let j=count-1;j>=0;j--)card(x+j*6,y-j*4,w,h,type,front&&j===0,(j-(count-1)/2)*.018);}
function book(x,y,w=165,h=211,name='엔딩북',open=0,color=C.red){
 c.save();c.translate(x,y);c.shadowColor='#0005';c.shadowBlur=14;c.shadowOffsetY=8;rect(-w/2,-h/2,w,h,'#4a332d',3);c.shadowBlur=0;c.shadowOffsetY=0;
 rect(-w/2+7,-h/2+4,w-3,h-8,'#d8ccae',2);for(let j=0;j<3;j++)line(-w/2+10,h/2-7-j*3,w/2,h/2-7-j*3,'#a79879',.6);
 c.save();c.translate(-w/2,0);c.scale(1-.54*open,1);rect(0,-h/2,w,h,color,3,C.gold,2);rect(7,-h/2+7,w-14,h-14,null,1,'#e7c78299',1);rect(9,-h/2,5,h,'#0002');txt(name,w/2,-20,Math.min(30,w*.18),C.cream,true,'center',w-30);line(w*.25,12,w*.75,12,C.gold,1);txt('똑... 똑... 똑...',w/2,43,14,C.lightGold,false,'center',w-24);c.restore();c.restore();
}
function phone(x,y,w=138,h=232){c.save();c.shadowColor='#0004';c.shadowBlur=14;c.shadowOffsetY=7;rect(x-w/2,y-h/2,w,h,'#272c29',17);c.restore();rect(x-w/2+8,y-h/2+13,w-16,h-26,'#f2ead9',10);rect(x-25,y-h/2+5,50,11,'#171b18',5);line(x-19,y+h/2-7,x+19,y+h/2-7,'#a39c8c',3);}
function door(x,y,w=125,h=223,open=0){
 c.save();c.shadowBlur=20;c.shadowColor='#241b1677';c.shadowOffsetY=8;rect(x-w/2-9,y-9,w+18,h+14,'#463d32',2);c.restore();rect(x-w/2,y,w,h,'#181d1a');
 const edge=x+w/2-w*.67*open;path([[x-w/2,y],[edge,y+open*18],[edge,y+h-open*12],[x-w/2,y+h]],gradient(y,y+h,'#6f5b42','#3d362d'),C.gold,1.1);
 const ww=edge-(x-w/2);rect(x-w/2+12,y+18,ww-24,h*.31,null,1,'#bca77b55',2);rect(x-w/2+12,y+h*.47,ww-24,h*.43,null,1,'#bca77b44',2);
 rect(x-w/2-2,y+h*.42,ww+4,9,'#7c8179',1,'#2e3530',2);circle(edge-13,y+h*.59,4,C.gold);ellipse(x,y+h+18,w*.75,10,'#0002');
}
function timer(x,y,n,labelText='분',r=68,progress=.8,color=C.green){
 c.save();c.shadowBlur=16;c.shadowColor='#0002';c.shadowOffsetY=5;circle(x,y,r,'#eee5d2',C.gold,2);c.restore();circle(x,y,r-8,null,'#a4967d44',2);
 c.beginPath();c.arc(x,y,r-7,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);c.strokeStyle=color;c.lineWidth=5;c.stroke();for(let i=0;i<12;i++){let a=i/6*Math.PI;line(x+Math.cos(a)*(r-18),y+Math.sin(a)*(r-18),x+Math.cos(a)*(r-13),y+Math.sin(a)*(r-13),'#776b59',1);}
 rect(x-13,y-r-17,26,10,C.gold,3);txt(n,x,y-4,r*.76,color,true);txt(labelText,x,y+r*.49,18,C.muted,false,'center',r*1.6);
}
function speech(x,y,w,h,words,side='left'){rect(x-w/2,y-h/2,w,h,'#f4ecdd',8,C.gold,1.5);path(side==='left'?[[x-w/2+18,y+h/2-2],[x-w/2-14,y+h/2+17],[x-w/2+45,y+h/2-2]]:[[x+w/2-18,y+h/2-2],[x+w/2+14,y+h/2+17],[x+w/2-45,y+h/2-2]],'#f4ecdd',C.gold,1);txt(words,x,y,24,C.ink,true,'center',w-25);}
function panel(x,y,w,h,color=C.gold){rect(x,y,w,h,'#f7efdf30',7,color,1.5);line(x+8,y+2,x+w-8,y+2,'#fff4',1);}
function castRow(y,scale=.54,active=-1,xs=[180,410,640,870,1100]){xs.forEach((x,j)=>person(x,y,scale,j,true,j===active));}
function plaque(x,y,w=402,h=68,alpha=1){c.save();c.globalAlpha*=alpha;c.shadowBlur=12;c.shadowColor='#0007';c.shadowOffsetY=4;rect(x-w/2,y-h/2,w,h,gradient(y-h/2,y+h/2,'#3a3931','#111914'),2,C.gold,2);c.restore();c.save();c.globalAlpha*=alpha;rect(x-w/2+5,y-h/2+5,w-10,h-10,null,0,'#c2a86988',1);rect(x-77,y-h/2-14,154,22,'#24251f',1,C.gold,1);txt('MURDER MYSTERY',x,y-h/2-3,11,C.lightGold,true,'center',143);c.shadowColor='#000';c.shadowOffsetY=2;c.shadowBlur=1;txt('똑... 똑... 똑...',x,y+3,37,gradient(y-16,y+20,'#f1e0ad','#a98b48'),true,'center',w-24);c.restore();}
function backdrop(){
 c.fillStyle=gradient(0,H,'#bfb6a4','#dcd4c2');c.fillRect(0,0,W,H);
 const g=c.createRadialGradient(640,305,50,640,328,756);g.addColorStop(0,'#f3eddded');g.addColorStop(.54,'#e1d8c488');g.addColorStop(1,'#665d4a99');c.fillStyle=g;c.fillRect(0,0,W,H);
 // Fixed fine grain and faint architectural border, not brush strokes.
 for(let i=0;i<920;i++){c.fillStyle=hash(i,8)>.5?'#fff1':'#291f1410';let z=.35+hash(i,4)*1.25;c.fillRect(hash(i,2)*W,hash(i,5)*H,z,z);}
 c.save();c.globalAlpha=.065;c.strokeStyle='#3a3227';c.lineWidth=1;
 for(let side of[0,1]){c.save();c.translate(side?W:0,0);c.scale(side?-1:1,1);for(let j=0;j<6;j++){c.beginPath();c.moveTo(20+j*13,576);c.bezierCurveTo(110+j*8,456,92+j*12,302,13+j*16,180);c.stroke();}c.restore();}
 c.restore();
}
function header(s){plaque(640,58);txt(shot.chapter,59,57,19,C.ink,true,'left',345);txt(String(shot.index+1).padStart(2,'0')+' / 30',1221,55,17,C.muted,true,'right');
 let p=step(s,.04,.55);c.save();c.globalAlpha=p;txt(shot.title.join(' '),640,151+(1-p)*12,35,C.ink,true,'center',1140);c.restore();
 line(550,185,730,185,C.gold,1.2);circle(640,185,3,C.gold);
}
function captions(s){
 c.save();c.shadowColor='#0002';c.shadowBlur=18;c.shadowOffsetY=-2;rect(0,584,W,136,'#262923');c.restore();line(0,584,W,584,C.gold,2);
 let p=step(s,.35,.8);c.save();c.globalAlpha=p;
 txt(shot.caption[0],640,617,27,C.cream,false,'center',1170);txt(shot.caption[1],640,654,27,C.cream,false,'center',1170);txt(shot.note,640,692,17.5,'#c1b69a',false,'center',1150);c.restore();
 rect(0,716,W,4,'#101612');rect(0,716,W*(t/D.duration),4,C.gold);
}
function render(ctx,time){c=ctx;t=clamp(time,0,D.duration-1/D.fps);shot=D.shots[Math.floor(t/10)];tm=t-shot.start;c.save();c.setTransform(c.canvas.width/W,0,0,c.canvas.height/H,0,0);c.globalAlpha=1;c.clearRect(0,0,W,H);backdrop();header(tm);
 c.save();c.beginPath();c.rect(20,201,1240,377);c.clip();const entering=step(tm,0,.48),exiting=step(tm,9.68,10);c.globalAlpha=entering*(1-exiting*.6);c.translate((1-entering)*27-exiting*24,0);drawScene(tm);c.restore();captions(tm);c.restore();}
// Scene functions below describe the actual rule actions, not transitions alone.
function drawScene(s){let p,q;
switch(shot.visual){
case 'intro':{
 door(328,223,139,262,step(s,5.3,8)*.42);for(const onset of[1.2,2.05,2.9]){const ph=clamp((s-onset)/.85);if(s>=onset&&ph<1){c.save();c.globalAlpha=1-ph;circle(328,343,24+ph*60,null,C.gold,2);c.restore();}}
 txt('닫힌 방, 세 번의 노크.',845,281,43,C.ink,true);txt('다섯 사람의 추리가 시작됩니다.',845,339,27,C.muted);[0,1,2,3,4].forEach(j=>group(s,3.2+j*.2,()=>person(662+j*94,438,.43,j,false)));label('5인 전용  ·  GM 없음  ·  약 90분',845,543,394,C.ink,22);break;}
case 'premise':{
 door(640,218,94,153,step(s,.5,2)*.4);group(s,1,()=>label('김하준 사망 사건',640,399,228,C.red,21));
 [0,1,2,3,4].forEach(j=>group(s,1.8+j*.25,()=>person(230+j*205,455,.46,j,true),{fromY:15}));break;}
case 'components':{
 const arr=[['QR',7,'QR카드'],['캐릭터',5,'캐릭터 카드'],['조사',13,'조사 카드'],['소지품',5,'개인 소지품']];
 arr.forEach(([type,n,name],j)=>group(s,.3+j*.3,p=>{let x=211+j*287;stack(x-21,338,type,97,137);badge(String(Math.round(n*p)),x+55,269,30,j<2?C.ink:cardColor(type),30);txt(name,x,453,26,C.ink,true);}, {fromY:30}));
 group(s,3.1,()=>{panel(700,210,529,323,C.green);label('조사 가능 카드 18장',964,524,332,C.green,25);});txt('QR 7장 + 캐릭터 5장',354,527,24,C.muted);break;}
case 'cast':{
 const roles=['18세 · 수련생','18세 · 수련생','17세 · 수련생','28세 · 사범','45세 · 관장'];[0,1,2,3,4].forEach(j=>group(s,.35+j*.42,()=>{person(180+j*230,331,.92,j,true);txt(roles[j],180+j*230,501,22,C.muted);},{fromY:40}));break;}
case 'pack':{
 person(223,338,1.04,0,true);const types=['QR','캐릭터','소지품'];types.forEach((type,j)=>{let p=step(s,.7+j*.85,1.7+j*.85);flight(360,490,550+j*233,369,p,(x,y,r)=>card(x,y,116,164,type,false,r),47);group(s,1.5+j*.85,()=>txt(['설정서 QR','캐릭터 카드','자기 소지품'][j],550+j*233,499,26,C.ink,true));});arrow(331,363,434,363,C.gold,step(s,.5,1.7));break;}
case 'setup':{
 const names=['조사','조사','조사','조사','조사','조사','조사'];for(let j=0;j<13;j++){let x=411+(j%7)*77,y=265+Math.floor(j/7)*108;group(s,.3+j*.06,()=>card(x,y,63,91,'조사'));}label('조사 13장',165,285,164,C.green,24);txt('섞지 않습니다',165,330,21,C.muted);
 [0,1,2,3,4].forEach(j=>group(s,2.3+j*.15,()=>{person(160+j*239,478,.38,j,true);card(212+j*239,511,42,59,'소지품');}));break;}
case 'qr':{
 group(s,.3,()=>{phone(255,378,146,245);txt('내 설정서',255,303,21,C.ink,true);label('MAP',255,358,93,C.green,19);qr(255,423,45,C.ink);});
 group(s,1.8,()=>{panel(490,257,267,206,C.gold);rect(523,293,76,48,'#cfc6b3',3,C.muted,1);rect(650,293,75,48,'#cfc6b3',3,C.muted,1);rect(585,390,77,44,'#cfc6b3',3,C.muted,1);line(599,317,650,317,C.muted,3);line(623,317,623,390,C.muted,3);txt('연결 관계만 확인',623,509,23,C.ink,true);});arrow(355,360,448,360,C.gold,step(s,1,2));
 group(s,3.3,()=>{book(1026,365,144,191,'엔딩북');lock(1026,391,30,C.lightGold);label('투표 후에 열기',1026,511,232,C.red,22);});break;}
case 'timeline':{
 const labs=['오프닝','제1막','제2막','최종 추리','투표','엔딩 확인','점수 계산'],nums=[10,40,15,5,5,10,5],cols=[C.ink,C.green,C.purple,C.ink,C.red,C.ink,C.gold];
 line(93,343,1187,343,'#b5a788',3);labs.forEach((lab,j)=>{let x=130+j*170;group(s,.35+j*.3,p=>{circle(x,343,53,'#eee5d2',cols[j],3);txt(String(Math.round(nums[j]*p)),x,339,44,cols[j],true);txt('분',x,375,16,C.muted);txt(lab,x,450,25,C.ink,true,'center',162);if(j===1)label('8분 × 5회',x,503,150,C.green,20);if(j===6)txt('선택 규칙',x,503,19,C.muted);});});break;}
case 'opening':{
 group(s,.35,()=>{book(228,352,145,197,'이야기의 배경',step(s,1.5,3),C.green);txt('함께 듣기',228,502,28,C.green,true);});arrow(357,357,498,357,C.gold,step(s,1,2.4));group(s,1.9,()=>{phone(640,352,122,210);documentIcon(640,340,66,C.muted);txt('혼자 읽기',640,502,28,C.ink,true);});arrow(760,357,916,357,C.gold,step(s,3.3,4.4));group(s,4,()=>{card(1053,352,124,176,'캐릭터');txt('첫 진술 그대로 읽기',1053,502,26,C.red,true,'center',300);});break;}
case 'truth':{
 group(s,.3,()=>{panel(64,239,550,280,C.green);label('가능',339,255,164,C.green,24);seal(true,119,313);txt('내 비밀은 숨길 수 있습니다',350,317,29,C.green,true,'center',442);['은폐','축소','왜곡','해석'].forEach((v,j)=>label(v,137+j*135,431,113,C.green,21));});
 group(s,3.7,()=>{panel(665,239,550,280,C.red);label('금지',940,255,164,C.red,24);seal(false,721,313);txt('없는 사실을 새로 만들기',962,318,28,C.red,true,'center',452);txt('공개 카드의 객관적 사실 부정',940,430,27,C.ink,true,'center',500);});break;}
case 'act1':{
 timer(274,365,'8','분',102,1-.18*step(s,1,8));label('8분 × 5회 = 40분',274,530,291,C.green,23);
 for(let j=0;j<5;j++)group(s,.8+j*.35,()=>{circle(579+j*131,278,24,j===0?C.green:'#ede2cd',C.green,2);txt(String(j+1),579+j*131,278,23,j===0?C.cream:C.green,true);if(j<4)arrow(611+j*131,278,674+j*131,278,C.green,1,2);});
 const a=[['선택',C.green],['전체 공개',C.green],['논의',C.ink]];a.forEach(([v,col],j)=>group(s,2.9+j*.6,()=>{label(v,611+j*219,429,170,col,28);if(j<2)arrow(707+j*219,429,732+j*219,429,C.gold);}));txt('카드를 고르기 전에 타이머 시작',830,528,26,C.red,true);break;}
case 'allowed':{
 for(let j=0;j<2;j++){panel(71+j*644,229,491,322,C.green);label('가능 '+(j+1),317+j*644,242,159,C.green,23);}
 group(s,.6,()=>{card(237,381,112,155,'조사');txt('+',318,381,42,C.gold,true);card(402,381,112,155,'조사');txt('조사 카드 2장',318,508,28,C.green,true);});seal(true,513,268,step(s,2.3,2.7));
 group(s,3.9,()=>{card(877,381,112,155,'조사');txt('+',960,381,42,C.gold,true);card(1044,381,112,155,'소지품');txt('조사 1장 + 타인 소지품 1장',960,508,26,C.green,true,'center',465);});seal(true,1160,268,step(s,5.8,6.2));break;}
case 'forbidden':{
 for(let j=0;j<2;j++){panel(71+j*644,229,491,322,C.red);label('선택 금지',317+j*644,242,183,C.red,23);}
 group(s,.6,()=>{person(216,357,.60,0,false);card(409,373,110,152,'소지품');arrow(275,375,335,375,C.red);txt('자기 소지품',318,508,29,C.red,true);});seal(false,513,268,step(s,2.1,2.5));
 group(s,3.8,()=>{card(877,381,112,155,'소지품');txt('+',960,381,42,C.gold,true);card(1044,381,112,155,'소지품');txt('소지품 2장 동시 선택',960,508,27,C.red,true);});seal(false,1160,268,step(s,5.6,6.1));break;}
case 'public':{
 castRow(241,.43,-1);panel(412,344,456,215,C.green);p=step(s,.8,2.5);q=smooth((s-2.15)/.8);const flip=Math.cos(Math.PI*q);
 flight(180,470,551,449,p,(x,y,r)=>card(x,y,106,147,'조사',q>.5,r,flip),35);flight(292,470,727,449,p,(x,y,r)=>card(x,y,106,147,'소지품',q>.5,r,flip),40);
 group(s,3.3,()=>{label('전체 공개',640,351,216,C.green,26);for(let j=0;j<5;j++)seal(true,222+j*230,250,step(s,3.2+j*.16,3.6+j*.16),.55);});break;}
case 'rotate':{
 const pts=[];for(let j=0;j<5;j++){let a=-Math.PI/2+j*Math.PI*2/5;pts.push([640+390*Math.cos(a),360+129*Math.sin(a)]);}let idx=Math.min(4,Math.floor(Math.max(0,s-.7)/1.55));
 c.beginPath();c.ellipse(640,360,390,129,0,0,Math.PI*2);c.strokeStyle='#b0966055';c.lineWidth=3;c.stroke();
 pts.forEach(([x,y],j)=>{let a=-Math.PI/2+j*Math.PI*2/5+.56;arrow(640+390*Math.cos(a-.12),360+129*Math.sin(a-.12),640+390*Math.cos(a+.12),360+129*Math.sin(a+.12),j<idx?C.gold:'#a79b85',1,3);person(x,y,.47,j,true,j===idx);});txt((idx+1)+'회차',640,345,50,C.green,true);txt('담당자는 한 번씩',640,399,25,C.muted);break;}
case 'checkpoint':{
 const nums=[5,5,10],labs=['5회차 모두 완료','5명 모두 담당','10장 전체 공개'];labs.forEach((v,j)=>{let x=294+j*346;panel(x-140,265,280,252,C.green);group(s,.5+j*.7,p=>{txt(String(Math.round(nums[j]*p)),x,364,85,C.green,true);txt(v,x,443,27,C.ink,true);});seal(true,x+104,291,step(s,2.6+j*.7,3+j*.7));});break;}
case 'act2':{
 timer(246,352,'15','분',100,1-.12*step(s,1,8),C.purple);label('각자 1장씩',246,515,240,C.purple,29);
 for(let j=0;j<8;j++)group(s,.6+j*.12,()=>card(555+(j%4)*160,286+Math.floor(j/4)*184,99,139,'미선택'));
 txt('전체 공개되지 않은 카드 8장',792,557,22,C.muted);break;}
case 'privatepick':{
 const xs=[180,410,640,870,1100];castRow(363,.46);
 for(let j=0;j<8;j++){let ax=458+j*53;if(j<5){p=step(s,1+j*1.1,1.85+j*1.1);flight(ax,270,xs[j],503,p,(x,y,r)=>card(x,y,mix(36,72,p),mix(51,101,p),j===3?'소지품':'조사',false,r),-25);}else card(ax,270,36,51,'미선택');}
 label('전원 선택 전에는 앞면을 보지 않습니다',640,219,516,C.purple,21);break;}
case 'privateflip':{
 castRow(280,.49);q=smooth((s-2.8)/.65)-smooth((s-5.7)/.65);let flip=Math.cos(Math.PI*q);for(let j=0;j<5;j++)card(180+j*230,449,102,144,j===3?'소지품':'조사',q>.5,0,flip);
 label(s<2.8?'5명 모두 선택 완료':s<5.8?'각자만 앞면 확인':'다시 뒷면으로 보관',640,219,356,C.purple,24);break;}
case 'speech':{
 person(207,371,.99,1,true);person(1078,371,.99,3,true);group(s,.6,()=>speech(559,289,420,92,'“내가 본 카드에는...”','left'));
 group(s,3.4,()=>speech(757,422,371,78,'“그 말이 사실일까?”','right'));
 group(s,5.4,()=>{card(490,469,81,115,'조사');lock(571,503,27,C.red);label('원문 공개 금지',731,539,242,C.red,21);});break;}
case 'owner':{
 person(256,350,1,0,true);person(1025,350,1,1,true);label('원래 소유자',256,236,206,colors[0],23);label('선택한 사람',1025,236,206,colors[1],23);
 p=step(s,.8,3);flight(414,443,640,372,p,(x,y,r)=>card(x,y,121,171,'소지품',false,r),32);
 group(s,3,()=>{arrow(362,362,541,362,C.purple);arrow(739,362,918,362,C.purple);eye(450,322,C.purple);eye(832,322,C.purple);});label('두 사람은 내용을 압니다',640,539,382,C.purple,26);break;}
case 'remaining':{
 [['전체 공개',10,C.green,true],['개인 확인',5,C.purple,false],['미선택',3,C.red,false]].forEach(([lab,n,col,face],j)=>{let x=280+j*360;group(s,.4+j*.85,p=>{stack(x-10,342,j===0?'조사':j===1?'비공개':'미선택',90,128,3,face);badge(String(Math.round(n*p)),x+74,285,33,col,35);txt(lab,x,460,30,col,true);});});
 group(s,4,()=>label('18장 = 10장 + 5장 + 3장',640,546,518,C.ink,27));break;}
case 'deduction':{
 const labels=['공개 단서','서로의 진술','알고 있던 위험','이후의 선택'],cols=[C.green,C.blue,C.red,C.purple];labels.forEach((v,j)=>{let x=189+j*300;group(s,.4+j*.55,()=>{circle(x,309,52,cols[j],C.lightGold,2);if(j===0)magnifier(x,309,29);if(j===1){txt('“ ”',x,304,56,C.cream,true);}if(j===2)txt('!',x,309,52,C.cream,true);if(j===3)documentIcon(x,309,45,C.cream);txt(v,x,398,27,cols[j],true,'center',278);});if(j<3)arrow(x+72,309,x+226,309,C.gold,step(s,1.4+j*.8,2+j*.8));});
 timer(640,510,'5','분',46,.9,C.ink);break;}
case 'vote':{
 const xs=[138,340,542,744,946];xs.forEach((x,j)=>group(s,.4+j*.18,()=>person(x,341,.71,j,true)));
 group(s,3.2,()=>{circle(1141,371,53,'#efe5d0',C.gold,2);txt('사고사',1141,370,29,C.ink,true);txt('순수한 사고로 판단',1141,468,19,C.muted,false,'center',195);});
 group(s,5.1,()=>label('한 명을 지목  또는  사고사',640,543,481,C.red,26));break;}
case 'ballot':{
 castRow(268,.54);q=smooth((s-4.1)/.75);for(let j=0;j<5;j++)card(180+j*230,474,99,137,'투표',q>.5,0,Math.cos(Math.PI*q));
 label(s<4.1?'각자의 선택을 정합니다':'동시에 공개',640,219,343,C.blue,27);break;}
case 'tie':{
 group(s,.3,()=>{person(190,332,.69,0,true);person(365,332,.69,2,true);label('동률 대상만',276,511,252,C.red,27);});arrow(461,358,552,358,C.gold,step(s,1,2));
 group(s,1.6,()=>{timer(640,350,'3','분',75,.9,C.red);txt('재논의 후 재투표',640,512,25,C.ink,true);});arrow(735,358,819,358,C.gold,step(s,3.1,4.1));
 group(s,3.8,()=>{panel(858,247,345,264,C.gold);txt('다시 동률이면',1031,292,27,C.red,true);person(1031,369,.53,0,false);label('첫 조사 담당자가 결정',1031,493,313,C.ink,24);});break;}
case 'ending':{
 book(315,361,183,240,'엔딩북',step(s,.6,2.2));if(s<2.2){c.save();c.globalAlpha=1-step(s,.5,2.2);lock(330,392,36,C.lightGold,step(s,.5,1.2));c.restore();}
 ['지목 대상의 엔딩','사건의 진실','주요 단서 해설'].forEach((v,j)=>group(s,1.3+j*1.15,()=>{circle(622,275+j*110,22,C.green);tick(622,275+j*110,C.cream,12);txt(v,674,275+j*110,34,j?C.red:C.ink,true,'left',518);}));break;}
case 'score':{
 const heights=[68,123,92,123,48];for(let j=0;j<5;j++){let h=heights[j]*step(s,.4+j*.1,2.6+j*.1),x=188+j*226;rect(x-43,498-h,86,h,gradient(375,498,colors[j],'#34342d'),3);person(x,426-h,.42,j,true);}
 line(86,502,1195,502,'#938165',2);if(s>4){trophy(414,246,26*step(s,4,4.5));trophy(866,246,26*step(s,4,4.5));}label('같은 최고 점수라면 공동 우승',640,554,490,C.ink,25);txt('점수 비교 예시',1181,219,16,C.muted,false,'right');break;}
case 'secrets':{
 [['0개','성공',C.green],['1개','성공',C.green],['2개','실패',C.red]].forEach(([n,v,col],j)=>{let x=280+j*360;panel(x-142,241,284,315,col);for(let k=0;k<2;k++){q=k<j?smooth((s-1.2-j*.65)/.65):0;card(x+(k-.5)*101,345,81,114,'비밀',q>.5,0,Math.cos(Math.PI*q));}txt(n,x,461,45,col,true);label(v,x,527,126,col,27);});break;}
case 'outro':{
 door(302,217,132,269,step(s,1,6)*.7);group(s,.6,()=>{txt('지금부터,',840,285,33,C.muted);txt('당신의 추리가 시작됩니다.',840,342,40,C.ink,true,'center',712);});
 [0,1,2,3,4].forEach(j=>group(s,2.3+j*.22,()=>person(650+j*96,440,.42,j,false)));label('첫 진술을 시작해 주세요',840,546,410,C.red,26);break;}
}}
root.TTOK_RENDER={render,palette:C};
})(typeof globalThis!=='undefined'?globalThis:this);
