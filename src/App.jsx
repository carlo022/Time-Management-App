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

// --- HISTORY STATE ---
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('timerHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('stopwatch');

  // Apply Dark Mode Class to Body
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save History to LocalStorage
  useEffect(() => {
    localStorage.setItem('timerHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (entry) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      ...entry
    };
    // Add to top of list
    setHistory(prev => [newEntry, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
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
          <Stopwatch />
        </div>

        <div style={{ display: activeTab === 'timer' ? 'block' : 'none' }}>
          <Timer onFinish={addToHistory} history={history} onClearHistory={clearHistory} />
        </div>

      </div>
    </div>
  )
}

export default App
