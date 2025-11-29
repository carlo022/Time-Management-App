import { useState, useEffect, useRef } from 'react';

export default function Timer({ onFinish, history, onClearHistory }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [reminderText, setReminderText] = useState("");
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isActive, setIsActive] = useState(false);

  const workerRef = useRef(null);
  const textRef = useRef(reminderText);

  // REQUEST NOTIFICATION PERMISSION ON MOUNT
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    textRef.current = reminderText;
  }, [reminderText]);

  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('../timerWorker.js', import.meta.url));
    } catch (err) {
      console.error('Failed to create worker', err);
      workerRef.current = null;
      return;
    }

    workerRef.current.onmessage = (e) => {
      const { type, timeLeft: workerTime } = e.data;
      console.log('Component received:', type, workerTime);

      if (type === "TICK") {
        setTimeLeft(workerTime);
      } else if (type === "FINISHED") {
        console.log('FINISHED received, calling playAlarm and sendNotification');
        setIsActive(false);
        setTimeLeft(0);
        playAlarm();
        sendNotification();

        onFinish({
          label: textRef.current || "Untitled Timer",
          duration: "Finished"
        });
      }
    };

    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [onFinish]);

  // Request permission only when user clicks the button (safer than auto-request)
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      console.log('Notification permission:', result);
    } catch (err) {
      console.error('Request notification permission failed', err);
    }
  };

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Beep settings
      oscillator.frequency.value = 800; // Hz (pitch)
      oscillator.type = 'sine'; // wave type
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); // fade out

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5); // 500ms beep
    } catch (err) {
      console.error('Beep failed:', err);
    }
  };

  const sendNotification = () => {
    // Play beep sound
    playBeep();
    
    // Show notification with user's reminderText
    const title = reminderText?.trim() || 'Timer finished';
    const body = reminderText?.trim() 
      ? `⏱️ ${reminderText} - Time's up!` 
      : 'Your timer is done!';
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { 
          body, 
          tag: 'timer-alert',
          icon: '⏱️'
        });
        console.log('Notification shown:', title);
      } catch (err) {
        console.error('Notification error:', err);
        alert(`${title}\n${body}`);
      }
    } else {
      alert(`${title}\n${body}`);
    }
  };

  // Replace playAlarm to call sendNotification (use system sound via Notification)
  const playAlarm = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play 3 beeps
      for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = 1000;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.6 + 0.4);
        
        osc.start(audioContext.currentTime + i * 0.6);
        osc.stop(audioContext.currentTime + i * 0.6 + 0.4);
      }
    } catch (err) {
      console.error('Alarm failed:', err);
    }
  };

  const startTimer = () => {
    if (!isActive && timeLeft === 0) {
      const totalSeconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
      if (totalSeconds > 0) {
        setTimeLeft(totalSeconds);
        setIsActive(true);
        if (workerRef.current) workerRef.current.postMessage({ command: "START", value: totalSeconds });
      }
    } else {
      setIsActive(true);
      if (workerRef.current) workerRef.current.postMessage({ command: "START" });
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (workerRef.current) workerRef.current.postMessage({ command: "PAUSE" });
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    if (workerRef.current) workerRef.current.postMessage({ command: "RESET" });
  };

  const formatTimeLeft = (time) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="timer-container">
      {/* ...existing UI like time display, inputs, controls ... */}
      {isActive || timeLeft > 0 ? (
        <>
          <div className="time-display">
            {formatTimeLeft(timeLeft)}
          </div>
          <div className="reminder-display">{reminderText || "Timer Running..."}</div>
        </>
      ) : (
        <div className="setup-container">
          <input 
            type="text" 
            className="text-input"
            placeholder="Timer label (e.g. Laundry)" 
            value={reminderText} 
            onChange={(e) => setReminderText(e.target.value)} 
          />
          <div className="input-group">
            <input
              type="number"
              min="0"
              placeholder="00"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value || "0", 10) || 0)}
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="00"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value || "0", 10) || 0)}
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="00"
              value={seconds}
              onChange={(e) => setSeconds(parseInt(e.target.value || "0", 10) || 0)}
            />
          </div>
        </div>
      )}

      <div className="controls">
        {!isActive && timeLeft === 0 ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={isActive ? pauseTimer : startTimer}>
            {isActive ? "Pause" : "Resume"}
          </button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>

      {/* --- HISTORY SECTION --- */}
      {history.length > 0 && (
        <div className="history-section">
            <div className="history-header">
                <h3>History</h3>
                <button className="clear-btn" onClick={onClearHistory}>Clear</button>
            </div>
            <ul className="history-list">
                {history.map((item) => (
                    <li key={item.id} className="history-item">
                        <span className="history-time">{item.timestamp}</span>
                        <span className="history-label">{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}