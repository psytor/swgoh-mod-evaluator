import { useState, useEffect } from 'react'
import AllyCodeEntry from './components/AllyCodeEntry'
import ModList from './components/ModList'
import './App.css'

function App() {
  const [playerData, setPlayerData] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('basic') // 'basic' or 'strict'

  // Load saved mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('swgoh_evaluation_mode')
    if (savedMode) {
      setEvaluationMode(savedMode)
    }
  }, [])

  // Save mode to localStorage when it changes
  const handleModeChange = (mode) => {
    setEvaluationMode(mode)
    localStorage.setItem('swgoh_evaluation_mode', mode)
  }

  return (
    <div className="app">
      {/* Persistent Mode Selector Bar */}
      <div className="mode-selector-bar">
        <div className="mode-selector-container">
          <span className="mode-label">Evaluation Mode:</span>
          <div className="mode-buttons">
            <button 
              className={`mode-button ${evaluationMode === 'basic' ? 'active' : ''}`}
              onClick={() => handleModeChange('basic')}
            >
              Basic (Keep Any Speed)
            </button>
            <button 
              className={`mode-button ${evaluationMode === 'strict' ? 'active' : ''}`}
              onClick={() => handleModeChange('strict')}
            >
              Strict (Limited Inventory)
            </button>
          </div>
        </div>
      </div>

      {!playerData ? (
        <AllyCodeEntry onDataFetched={setPlayerData} />
      ) : (
        <ModList playerData={playerData} evaluationMode={evaluationMode} />
      )}
    </div>
  )
}

export default App