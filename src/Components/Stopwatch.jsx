import { useState, useEffect } from 'react';

export default function Stopwatch({ onRecord, history, onClearHistory }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (time) => {
    const minutes = ("0" + Math.floor((time / 60000) % 60)).slice(-2);
    const seconds = ("0" + Math.floor((time / 1000) % 60)).slice(-2);
    const milliseconds = ("0" + ((time / 10) % 100)).slice(-2);
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  const handleRecord = () => {
    try {
      if (time > 0) {
        onRecord(formatTime(time));
        console.log('Stopwatch recorded:', formatTime(time));
      } else {
        alert('Please start the stopwatch before recording');
      }
    } catch (err) {
      console.error('Error recording stopwatch:', err);
      alert('Error recording stopwatch. Check console for details.');
    }
  };

  return (
    <div className="stopwatch">
      <div className="time-display">{formatTime(time)}</div>
      <div className="controls">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Stop" : "Start"}
        </button>
        <button onClick={() => { setIsRunning(false); setTime(0); }}>Reset</button>
        <button onClick={handleRecord} style={{ backgroundColor: '#4CAF50' }}>📝 Record</button>
      </div>

      {/* --- HISTORY SECTION --- */}
      {history && history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h3>Stopwatch History</h3>
            <button className="clear-btn" onClick={onClearHistory}>Clear</button>
          </div>
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <span className="history-time">{item.timestamp}</span>
                <span className="history-label">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}