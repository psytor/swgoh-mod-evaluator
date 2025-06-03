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

      {!playerData ? (
        <AllyCodeEntry onDataFetched={setPlayerData} />
      ) : (
        <ModList playerData={playerData} evaluationMode={evaluationMode} filterType={filterType} />
      )}
    </div>
  )
}

export default App