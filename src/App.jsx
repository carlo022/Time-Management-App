import { useState, useEffect } from 'react';
import Stopwatch from './Components/Stopwatch';
import Timer from './Components/Timer';

const App = () => {

  // --- DARK MODE STATE ---
  // Check localStorage for saved preference, default to true (dark)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

// --- TIMER HISTORY STATE ---
  const [timerHistory, setTimerHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('timerHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading timer history:', err);
      return [];
    }
  });

  // --- STOPWATCH HISTORY STATE ---
  const [stopwatchHistory, setStopwatchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('stopwatchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading stopwatch history:', err);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('stopwatch');

  // Apply Dark Mode Class to Body
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save Timer History to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('timerHistory', JSON.stringify(timerHistory));
    } catch (err) {
      console.error('Error saving timer history:', err);
    }
  }, [timerHistory]);

  // Save Stopwatch History to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('stopwatchHistory', JSON.stringify(stopwatchHistory));
    } catch (err) {
      console.error('Error saving stopwatch history:', err);
    }
  }, [stopwatchHistory]);

  const addToTimerHistory = (entry) => {
    try {
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        ...entry
      };
      setTimerHistory(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error('Error adding to timer history:', err);
    }
  };

  const addToStopwatchHistory = (time) => {
    try {
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        time: time
      };
      setStopwatchHistory(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error('Error adding to stopwatch history:', err);
    }
  };

  const clearTimerHistory = () => {
    try {
      setTimerHistory([]);
    } catch (err) {
      console.error('Error clearing timer history:', err);
    }
  };

  const clearStopwatchHistory = () => {
    try {
      setStopwatchHistory([]);
    } catch (err) {
      console.error('Error clearing stopwatch history:', err);
    }
  };

  return (
<div className="app-container">
      <div className="card">
        <header className="app-header">
          <h1>React Time App</h1>
          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>
        
        {/* Toggle Buttons */}
        <div className="tabs">
          <button 
            className={activeTab === 'stopwatch' ? 'active' : ''} 
            onClick={() => setActiveTab('stopwatch')}
          >
            Stopwatch
          </button>
          <button 
            className={activeTab === 'timer' ? 'active' : ''} 
            onClick={() => setActiveTab('timer')}
          >
            Timer
          </button>
        </div>

        {/* KEY CHANGE: We use style={{ display: ... }} instead of conditional rendering 
           so both components stay "alive" in the background.
        */}
        <div style={{ display: activeTab === 'stopwatch' ? 'block' : 'none' }}>
          <Stopwatch onRecord={addToStopwatchHistory} history={stopwatchHistory} onClearHistory={clearStopwatchHistory} />
        </div>

        <div style={{ display: activeTab === 'timer' ? 'block' : 'none' }}>
          <Timer onFinish={addToTimerHistory} history={timerHistory} onClearHistory={clearTimerHistory} />
        </div>

      </div>
    </div>
  )
}

export default App
