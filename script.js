document.addEventListener('DOMContentLoaded',()=>{

/* ---- DOM Refs ---- */
const stage=document.getElementById('stage'),dot=document.getElementById('dot');
const startStop=document.getElementById('startStop'),menuBtn=document.getElementById('menuBtn'),menu=document.getElementById('menu');
const speedRange=document.getElementById('speedRange'),speedLabel=document.getElementById('speedLabel');
const durationSelect=document.getElementById('durationSelect');
const timerDisplay=document.getElementById('timer');
const heartbeat=document.getElementById('heartbeat');

/* ---- State ---- */
let running=false,direction=1,pos=0,lastTimestamp=null,beatTimer=null,animFrame=null,timerInterval=null;
let speedBPM=parseInt(speedRange.value,10);
let durationSec=parseInt(durationSelect.value,10);
let remainingSec=durationSec;

/* ---- UI Helpers ---- */
const updateSpeedLabel=()=>speedLabel.textContent=speedBPM;
const formatTime=s=>('0'+Math.floor(s)).slice(-2);

/* ---- Audio ---- */
const startBeats=()=>{
  stopBeats();
  playBeat();
  const interval=60000/speedBPM;
  beatTimer=setInterval(playBeat,interval);
};
const stopBeats=()=>{
  if(beatTimer){clearInterval(beatTimer);beatTimer=null;}
  heartbeat.pause();heartbeat.currentTime=0;
};
const playBeat=()=>{heartbeat.currentTime=0;heartbeat.play().catch(()=>{});};

/* ---- Timer ---- */
const startTimer=()=>{
  remainingSec=durationSec;
  updateTimerDisplay();
  timerInterval=setInterval(()=>{
    remainingSec--;
    updateTimerDisplay();
    if(remainingSec<=0){stop();}
  },1000);
};
const stopTimer=()=>{if(timerInterval){clearInterval(timerInterval);timerInterval=null;}};
const updateTimerDisplay=()=>{timerDisplay.textContent=`${formatTime(remainingSec)} s`;};

/* ---- Animation ---- */
const step=timestamp=>{
  if(!running)return;
  if(!lastTimestamp)lastTimestamp=timestamp;
  const dt=(timestamp-lastTimestamp)/1000;
  lastTimestamp=timestamp;

  const bps=speedBPM/60,cycleTime=2/bps,distPerSec=2/cycleTime;
  pos+=direction*distPerSec*dt;
  if(pos>=1){pos=1;direction=-1;}
  else if(pos<=0){pos=0;direction=1;}
  updateDotPos();
  animFrame=requestAnimationFrame(step);
};
const updateDotPos=()=>{
  const stageW=stage.clientWidth,dotW=dot.clientWidth,offset=20,travel=stageW-dotW-offset*2;
  const x=offset+pos*travel;
  dot.style.transform=`translate(${x}px,-50%)`;
};

/* ---- Control Flow ---- */
const start=()=>{
  running=true;startStop.textContent='Stop';lastTimestamp=null;
  startBeats();startTimer();animFrame=requestAnimationFrame(step);
};
const stop=()=>{
  running=false;startStop.textContent='Start';
  stopBeats();stopTimer();if(animFrame)cancelAnimationFrame(animFrame);
};

startStop.addEventListener('click',()=>running?stop():start());

/* ---- Menu ---- */
menuBtn.addEventListener('click',()=>{menu.classList.toggle('hidden');menu.setAttribute('aria-hidden',menu.classList.contains('hidden'));});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!menuBtn.contains(e.target)&&!menu.classList.contains('hidden')){menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');}});
speedRange.addEventListener('input',()=>{speedBPM=parseInt(speedRange.value,10);updateSpeedLabel();if(running){startBeats();}});
durationSelect.addEventListener('change',()=>{durationSec=parseInt(durationSelect.value,10);if(!running)remainingSec=durationSec;});

updateSpeedLabel();remainingSec=durationSec;updateTimerDisplay();
window.addEventListener('resize',updateDotPos);updateDotPos();

});
