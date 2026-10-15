const canvas=document.querySelector('#game');
const ctx=canvas.getContext('2d');

const scoreEl=document.querySelector('#score');
const bestEl=document.querySelector('#best');
const deliveredEl=document.querySelector('#delivered');
const timeEl=document.querySelector('#time');

const switchALabel=document.querySelector('#switch-a-label');
const switchBLabel=document.querySelector('#switch-b-label');
const switchABtn=document.querySelector('#switch-a');
const switchBBtn=document.querySelector('#switch-b');

const statusTitle=document.querySelector('#status-title');
const statusCopy=document.querySelector('#status-copy');

const overlay=document.querySelector('#overlay');
const overlayKicker=document.querySelector('#overlay-kicker');
const overlayTitle=document.querySelector('#overlay-title');
const overlayCopy=document.querySelector('#overlay-copy');
const startBtn=document.querySelector('#start');
const restartBtn=document.querySelector('#restart');
const pauseBtn=document.querySelector('#pause');

const W=canvas.width;
const H=canvas.height;

const ENTRY={x:70,y:350};
const J1={x:340,y:350};
const J2_TOP={x:610,y:230};
const J2_BOTTOM={x:610,y:470};

const PLATFORM_BLUE={x:835,y:150};
const PLATFORM_ORANGE={x:835,y:350};
const PLATFORM_MINT={x:835,y:550};

const COLORS={
  blue:'#6ea8e8',
  orange:'#f1ae5b',
  mint:'#64cf9a'
};

let running=false;
let paused=false;
let ended=false;
let last=0;
let raf=0;

let trains=[];
let particles=[];

let elapsed=0;
let spawnTimer=0;
let score=0;
let delivered=0;
let best=Number(window.TRAIN_STATS.highScore||0);

let switchA='upper';
let switchB='lower';
let lives=3;

function reset(){
  cancelAnimationFrame(raf);

  running=false;
  paused=false;
  ended=false;
  last=0;

  trains=[];
  particles=[];

  elapsed=0;
  spawnTimer=0;
  score=0;
  delivered=0;
  switchA='upper';
  switchB='lower';
  lives=3;

  ui();
  draw();

  show(
    'READY',
    'Control the junctions.',
    'Blue trains need blue, orange trains need orange, mint trains need mint.',
    'Start game'
  );
}

function start(){
  if(ended) reset();

  if(!running){
    running=true;
    paused=false;
    hide();
    last=performance.now();
    ui();
    raf=requestAnimationFrame(loop);
  }
}

function show(k,t,c,b){
  overlayKicker.textContent=k;
  overlayTitle.textContent=t;
  overlayCopy.textContent=c;
  startBtn.textContent=b;
  overlay.hidden=false;
}

function hide(){
  overlay.hidden=true;
}

function difficulty(){
  return 1+Math.min(elapsed/40,2.4);
}

function ui(){
  scoreEl.textContent=score;
  bestEl.textContent=best;
  deliveredEl.textContent=delivered;
  timeEl.textContent=`${Math.floor(elapsed)}s`;

  switchALabel.textContent=switchA.toUpperCase();
  switchBLabel.textContent=switchB.toUpperCase();

  if(paused){
    statusTitle.textContent='Paused';
    statusCopy.textContent='Continue when ready.';
  }else if(running){
    statusTitle.textContent=`Traffic ${difficulty().toFixed(1)}×`;
    statusCopy.textContent=`${trains.length} train(s) active · ${lives} mistake(s) left`;
  }else{
    statusTitle.textContent='Ready';
    statusCopy.textContent='Route trains to matching platforms before traffic gets too dense.';
  }
}

function toggleA(){
  if(!running||paused||ended) return;
  switchA=switchA==='upper'?'lower':'upper';
  ui();
}

function toggleB(){
  if(!running||paused||ended) return;
  switchB=switchB==='upper'?'lower':'upper';
  ui();
}

function spawnTrain(){
  if(trains.some(t=>t.segment==='entry'&&t.progress<0.24)) return;

  const types=['blue','orange','mint'];
  const type=types[Math.floor(Math.random()*types.length)];

  trains.push({
    type,
    segment:'entry',
    progress:0,
    speed:(0.12+Math.random()*0.025)*difficulty(),
    routeA:null,
    routeB:null,
    finished:false,
    wrong:false,
    x:ENTRY.x,
    y:ENTRY.y
  });
}

function pointOnLine(a,b,t){
  return {
    x:a.x+(b.x-a.x)*t,
    y:a.y+(b.y-a.y)*t
  };
}

function updateTrainPosition(train){
  let p;

  if(train.segment==='entry'){
    p=pointOnLine(ENTRY,J1,train.progress);
  }else if(train.segment==='upper-a'){
    p=pointOnLine(J1,J2_TOP,train.progress);
  }else if(train.segment==='lower-a'){
    p=pointOnLine(J1,J2_BOTTOM,train.progress);
  }else if(train.segment==='top-blue'){
    p=pointOnLine(J2_TOP,PLATFORM_BLUE,train.progress);
  }else if(train.segment==='top-orange'){
    p=pointOnLine(J2_TOP,PLATFORM_ORANGE,train.progress);
  }else if(train.segment==='bottom-orange'){
    p=pointOnLine(J2_BOTTOM,PLATFORM_ORANGE,train.progress);
  }else{
    p=pointOnLine(J2_BOTTOM,PLATFORM_MINT,train.progress);
  }

  train.x=p.x;
  train.y=p.y;
}

function advanceTrain(train,dt){
  train.progress+=train.speed*dt;

  if(train.progress<1){
    updateTrainPosition(train);
    return;
  }

  train.progress=0;

  if(train.segment==='entry'){
    train.routeA=switchA;
    train.segment=switchA==='upper'?'upper-a':'lower-a';
  }else if(train.segment==='upper-a'){
    train.routeB=switchB;
    train.segment=switchB==='upper'?'top-blue':'top-orange';
  }else if(train.segment==='lower-a'){
    train.routeB=switchB;
    train.segment=switchB==='upper'?'bottom-orange':'bottom-mint';
  }else{
    finishTrain(train);
    return;
  }

  updateTrainPosition(train);
}

function finishTrain(train){
  let destination='orange';

  if(train.segment==='top-blue') destination='blue';
  if(train.segment==='bottom-mint') destination='mint';

  train.finished=true;

  if(destination===train.type){
    delivered++;
    score+=100+Math.floor(difficulty()*20);
    best=Math.max(best,score);
    burst(train.x,train.y,COLORS[train.type]);
  }else{
    lives--;
    train.wrong=true;
    burst(train.x,train.y,'#ef6675');

    if(lives<=0){
      gameOver('Too many wrong platforms.');
    }
  }
}

function update(dt){
  elapsed+=dt;
  spawnTimer+=dt;

  const interval=Math.max(.85,2.4-difficulty()*.45);

  if(spawnTimer>=interval){
    spawnTimer=0;
    spawnTrain();

    if(Math.random()<Math.min(.25,(difficulty()-1)*.10)){
      spawnTrain();
    }
  }

  for(const train of trains){
    if(!train.finished) advanceTrain(train,dt);
  }

  trains=trains.filter(train=>!train.finished);

  const collision=findCollision();

  if(collision){
    burst(
      (collision[0].x+collision[1].x)/2,
      (collision[0].y+collision[1].y)/2,
      '#ef6675'
    );
    gameOver('Train collision.');
    return;
  }

  for(const p of particles){
    p.x+=p.vx*dt;
    p.y+=p.vy*dt;
    p.life-=dt;
  }

  particles=particles.filter(p=>p.life>0);

  score=Math.max(score,Math.floor(elapsed*2)+delivered*100);
  best=Math.max(best,score);

  ui();
}

function findCollision(){
  for(let i=0;i<trains.length;i++){
    for(let j=i+1;j<trains.length;j++){
      const a=trains[i];
      const b=trains[j];

      if(Math.hypot(a.x-b.x,a.y-b.y)<30){
        return [a,b];
      }
    }
  }

  return null;
}

function burst(x,y,color){
  for(let i=0;i<22;i++){
    const a=Math.random()*Math.PI*2;
    const s=40+Math.random()*140;

    particles.push({
      x,y,
      vx:Math.cos(a)*s,
      vy:Math.sin(a)*s,
      life:.35+Math.random()*.5,
      max:.85,
      color
    });
  }
}

function drawTrack(a,b,active=true){
  ctx.strokeStyle=active?'#7a828c':'#49515a';
  ctx.lineWidth=9;
  ctx.lineCap='round';

  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();

  ctx.strokeStyle='#1c2229';
  ctx.lineWidth=3;
  ctx.setLineDash([8,8]);

  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawPlatform(point,color,label){
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.roundRect(point.x-25,point.y-26,50,52,9);
  ctx.fill();

  ctx.fillStyle='#0e141a';
  ctx.font='900 11px system-ui';
  ctx.textAlign='center';
  ctx.fillText(label,point.x,point.y+4);
}

function drawJunction(point,activeUpper){
  ctx.fillStyle='#dce3ea';
  ctx.beginPath();
  ctx.arc(point.x,point.y,12,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle=activeUpper?'#64cf9a':'#f1ae5b';
  ctx.beginPath();
  ctx.arc(point.x,point.y,5,0,Math.PI*2);
  ctx.fill();
}

function drawBackground(){
  ctx.fillStyle='#182119';
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle='#1d281e';
  for(let i=0;i<15;i++){
    ctx.fillRect((i*83)%W,(i*47)%H,34,34);
  }

  drawTrack(ENTRY,J1,true);
  drawTrack(J1,J2_TOP,switchA==='upper');
  drawTrack(J1,J2_BOTTOM,switchA==='lower');

  drawTrack(J2_TOP,PLATFORM_BLUE,switchB==='upper');
  drawTrack(J2_TOP,PLATFORM_ORANGE,switchB==='lower');

  drawTrack(J2_BOTTOM,PLATFORM_ORANGE,switchB==='upper');
  drawTrack(J2_BOTTOM,PLATFORM_MINT,switchB==='lower');

  drawJunction(J1,switchA==='upper');
  drawJunction(J2_TOP,switchB==='upper');
  drawJunction(J2_BOTTOM,switchB==='upper');

  drawPlatform(PLATFORM_BLUE,COLORS.blue,'BLUE');
  drawPlatform(PLATFORM_ORANGE,COLORS.orange,'ORG');
  drawPlatform(PLATFORM_MINT,COLORS.mint,'MINT');

  ctx.fillStyle='rgba(255,255,255,.55)';
  ctx.font='700 11px system-ui';
  ctx.textAlign='left';
  ctx.fillText('ENTRY',30,330);
}

function drawTrain(train){
  const color=COLORS[train.type];

  ctx.save();
  ctx.translate(train.x,train.y);

  ctx.fillStyle=color;
  ctx.shadowColor='rgba(0,0,0,.28)';
  ctx.shadowBlur=8;
  ctx.shadowOffsetY=4;

  ctx.beginPath();
  ctx.roundRect(-24,-13,48,26,6);
  ctx.fill();

  ctx.shadowBlur=0;
  ctx.shadowOffsetY=0;

  ctx.fillStyle='rgba(235,246,255,.75)';
  ctx.fillRect(-13,-8,8,8);
  ctx.fillRect(0,-8,8,8);

  ctx.fillStyle='#11161d';
  ctx.beginPath();
  ctx.arc(-14,13,4,0,Math.PI*2);
  ctx.arc(14,13,4,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=Math.max(0,p.life/p.max);
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,3,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawHUD(){
  ctx.fillStyle='rgba(255,255,255,.58)';
  ctx.font='700 12px system-ui';
  ctx.textAlign='left';
  ctx.fillText(`LIVES ${lives}`,14,20);

  ctx.textAlign='right';
  ctx.fillText(`${trains.length} TRAINS`,W-14,20);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawBackground();
  drawHUD();

  for(const train of trains) drawTrain(train);
  drawParticles();
}

function loop(time){
  if(!running||paused||ended){
    draw();
    return;
  }

  const dt=Math.min((time-last)/1000,.032);
  last=time;

  update(dt);
  draw();

  if(running&&!paused&&!ended){
    raf=requestAnimationFrame(loop);
  }
}

async function saveResult(){
  try{
    const response=await fetch('score.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        score,
        delivered,
        time:Math.floor(elapsed)
      })
    });

    const data=await response.json();

    if(response.ok){
      best=Number(data.highScore||best);
      ui();
    }
  }catch(_){}
}

function gameOver(reason){
  if(ended) return;

  running=false;
  paused=false;
  ended=true;
  void saveResult();

  show(
    'GAME OVER',
    `${score} points`,
    `${reason} ${delivered} train(s) delivered in ${Math.floor(elapsed)} seconds.`,
    'Play again'
  );
}

function togglePause(){
  if(ended||(!running&&!paused)) return;

  paused=!paused;

  if(paused){
    running=false;
    cancelAnimationFrame(raf);
    ui();
    show('PAUSED','Rail traffic frozen.','Continue when ready.','Continue');
  }else{
    hide();
    running=true;
    last=performance.now();
    ui();
    raf=requestAnimationFrame(loop);
  }
}

switchABtn.addEventListener('click',toggleA);
switchBBtn.addEventListener('click',toggleB);

startBtn.addEventListener('click',()=>{
  if(paused) togglePause();
  else start();
});

restartBtn.addEventListener('click',reset);
pauseBtn.addEventListener('click',()=>paused?togglePause():running&&togglePause());

canvas.addEventListener('pointerdown',event=>{
  event.preventDefault();

  if(!running&&!paused){
    start();
    return;
  }

  if(!running) return;

  const rect=canvas.getBoundingClientRect();
  const x=(event.clientX-rect.left)*canvas.width/rect.width;
  const y=(event.clientY-rect.top)*canvas.height/rect.height;

  if(Math.hypot(x-J1.x,y-J1.y)<70){
    toggleA();
  }else if(
    Math.hypot(x-J2_TOP.x,y-J2_TOP.y)<70 ||
    Math.hypot(x-J2_BOTTOM.x,y-J2_BOTTOM.y)<70
  ){
    toggleB();
  }
});

document.addEventListener('keydown',event=>{
  if(event.key==='1'){
    event.preventDefault();
    toggleA();
  }

  if(event.key==='2'){
    event.preventDefault();
    toggleB();
  }

  if(event.key.toLowerCase()==='p'){
    event.preventDefault();
    togglePause();
  }

  if(event.key===' '&&!running&&!paused){
    event.preventDefault();
    start();
  }
});

reset();
