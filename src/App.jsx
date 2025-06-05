import { useState, useEffect } from 'react'
import AllyCodeEntry from './components/AllyCodeEntry'
import ModList from './components/ModList'
import './App.css'

function App() {
  const [playerData, setPlayerData] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('basic') // 'basic' or 'strict'
  const [filterType, setFilterType] = useState('all') // 'all', 'keep', 'sell', 'slice', 'level'

  // Load saved players from localStorage
  const loadSavedPlayers = () => {
    const saved = localStorage.getItem('swgoh_saved_players')
    return saved ? JSON.parse(saved) : []
  }

  // Save players to localStorage
  const savePlayers = (players) => {
    localStorage.setItem('swgoh_saved_players', JSON.stringify(players))
  }

  // Load last used player
  const loadLastUsedPlayer = () => {
    const lastUsed = localStorage.getItem('swgoh_last_used_player')
    if (lastUsed) {
      const players = loadSavedPlayers()
      return players.find(p => p.allyCode === lastUsed)
    }
    return null
  }

  // Save last used player
  const saveLastUsedPlayer = (allyCode) => {
    localStorage.setItem('swgoh_last_used_player', allyCode)
  }

  const [savedPlayers, setSavedPlayers] = useState(loadSavedPlayers())
  const [currentPlayer, setCurrentPlayer] = useState(loadLastUsedPlayer())

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
        <ModList 
          playerData={playerData} 
          evaluationMode={evaluationMode}
          onModeChange={handleModeChange}
          filterType={filterType}
          onFilterChange={setFilterType}
        />
      )}
    </div>
  )
}

export default App