// simple timer worker: handles START (with optional value), PAUSE, RESET and sends TICK/FINISHED
let remaining = 0;
let intervalId = null;
let paused = true;

const sendTick = () => {
  postMessage({ type: 'TICK', timeLeft: Math.max(0, remaining) });
};

const clearWorkerInterval = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onmessage = (e) => {
  const { command, value } = e.data;
  if (command === 'START') {
    if (typeof value === 'number') {
      remaining = value;
    }
    paused = false;
    clearWorkerInterval();
    // send immediate tick then start interval
    sendTick();
    intervalId = setInterval(() => {
      if (paused) return;
      if (remaining > 0) {
        remaining -= 1;
        sendTick();
        if (remaining <= 0) {
          clearWorkerInterval();
          console.log('Worker: FINISHED message sent'); // DEBUG
          postMessage({ type: 'FINISHED' });
        }
      }
    }, 1000);
  } else if (command === 'PAUSE') {
    paused = true;
  } else if (command === 'RESET') {
    paused = true;
    remaining = 0;
    clearWorkerInterval();
    sendTick();
  }
};