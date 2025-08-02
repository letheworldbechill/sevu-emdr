document.addEventListener('DOMContentLoaded', () => {

  /* ---- DOM Refs ---- */
  const stage = document.getElementById('stage');
  const dot = document.getElementById('dot');
  const startStop = document.getElementById('startStop');
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const speedRange = document.getElementById('speedRange');
  const speedLabel = document.getElementById('speedLabel');
  const durationSelect = document.getElementById('durationSelect');
  const timerDisplay = document.getElementById('timer');
  const heartbeat = document.getElementById('heartbeat');

  /* ---- State ---- */
  let running = false, direction = 1, pos = 0, lastTimestamp = null, beatTimer = null, animFrame = null, timerInterval = null;
  let speedBPM = parseInt(speedRange.value, 10);
  let durationSec = parseInt(durationSelect.value, 10);
  let remainingSec = durationSec;

  /* ---- UI Helpers ---- */
  const updateSpeedLabel = () => speedLabel.textContent = speedBPM;
  const formatTime = s => ('0' + Math.floor(s)).slice(-2);

  /* ---- Audio ---- */
  const startBeats = () => {
    stopBeats();
    playBeat();
    const interval = 60000 / speedBPM;
    beatTimer = setInterval(playBeat, interval);
  };

  const stopBeats = () => {
    if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
    heartbeat.pause(); heartbeat.currentTime = 0;
  };

  const playBeat = () => { heartbeat.currentTime = 0; heartbeat.play().catch(() => { }); };

  /* ---- Timer ---- */
  const startTimer = () => {
    remainingSec = durationSec;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      remainingSec--;
      updateTimerDisplay();
      if (remainingSec <= 0) { stop(); }
    }, 1000);
  };

  const stopTimer = () => { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } };
  const updateTimerDisplay = () => { timerDisplay.textContent = `${formatTime(remainingSec)} s`; };

  /* ---- Animation ---- */
  const step = timestamp => {
    if (!running) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000; // seconds
    lastTimestamp = timestamp;

    const bps = speedBPM / 60;
    const cycleTime = 2 / bps; // 2 beats for a full left-right-left cycle
    const distancePerSecond = 2 / cycleTime; // pos units per second

    pos += direction * distancePerSecond * dt;

    if (pos >= 1) { pos = 1; direction = -1; }
    else if (pos <= 0) { pos = 0; direction = 1; }

    updateDotPosition();
    animFrame = requestAnimationFrame(step);
  };

  const updateDotPosition = () => {
    const stageWidth = stage.clientWidth;
    const dotWidth = dot.clientWidth;
    const offset = 20; // 20px padding on either side
    const travel = stageWidth - dotWidth - offset * 2;
    const x = offset + pos * travel; // Move ball proportionally to the percentage
    dot.style.transform = `translate(${x}px, -50%)`;
  };

  /* ---- Control Flow ---- */
  const start = () => {
    running = true;
    startStop.textContent = 'Stop';
    lastTimestamp = null;
    startBeats();
    startTimer();
    animFrame = requestAnimationFrame(step);
  };

  const stop = () => {
    running = false;
    startStop.textContent = 'Start';
    stopBeats();
    stopTimer();
    if (animFrame) cancelAnimationFrame(animFrame);
  };

  startStop.addEventListener('click', () => running ? stop() : start());

  /* ---- Menu ---- */
  menuBtn.addEventListener('click', () => { menu.classList.toggle('hidden'); menu.setAttribute('aria-hidden', menu.classList.contains('hidden')); });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target) && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      menu.setAttribute('aria-hidden', 'true');
    }
  });
  speedRange.addEventListener('input', () => { speedBPM = parseInt(speedRange.value, 10); updateSpeedLabel(); if (running) { startBeats(); } });
  durationSelect.addEventListener('change', () => { durationSec = parseInt(durationSelect.value, 10); if (!running) remainingSec = durationSec; });

  updateSpeedLabel();
  remainingSec = durationSec;
  updateTimerDisplay();

  window.addEventListener('resize', updateDotPosition);
  updateDotPosition();
});
