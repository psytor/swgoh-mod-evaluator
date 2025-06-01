import { useState, useEffect } from 'react'
import AllyCodeEntry from './components/AllyCodeEntry'
import ModList from './components/ModList'
import './App.css'

function App() {
  const [playerData, setPlayerData] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('basic') // 'basic' or 'strict'
  const [filterType, setFilterType] = useState('all') // 'all', 'keep', 'sell', 'slice', 'level'

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
        <select 
          value={evaluationMode} 
          onChange={(e) => handleModeChange(e.target.value)}
          className="mode-dropdown"
        >
          <option value="basic">Basic (Keep Any Speed)</option>
          <option value="strict">Strict (Limited Inventory)</option>
        </select>
        
        <span className="mode-label">Filter:</span>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="mode-dropdown"
        >
          <option value="all">All Mods</option>
          <option value="keep">Keep Only</option>
          <option value="sell">Sell Only</option>
          <option value="slice">Slice Only</option>
          <option value="level">Need Leveling</option>
        </select>
      </div>
    </div>

      {!playerData ? (
        <AllyCodeEntry onDataFetched={setPlayerData} />
      ) : (
        <ModList playerData={playerData} evaluationMode={evaluationMode} filterType={filterType} />
      )}
    </div>
  )
}

export default App