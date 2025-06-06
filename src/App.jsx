import { useState, useEffect } from 'react'
import AllyCodeEntry from './components/AllyCodeEntry'
import ModList from './components/ModList'
import './App.css'
import NavBar from './components/NavBar'

function App() {
  const [playerData, setPlayerData] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('basic') // 'basic' or 'strict'
  const [filterType, setFilterType] = useState('all') // 'all', 'keep', 'sell', 'slice', 'level'
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (currentPlayer && currentPlayer.data) {
      setPlayerData(currentPlayer.data)
    }
  }, [])

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

  const [savedPlayers, setSavedPlayers] = useState(loadSavedPlayers())
  const [currentPlayer, setCurrentPlayer] = useState(loadLastUsedPlayer())

  // Handle player switch
  const handlePlayerSwitch = (allyCode) => {
    const player = savedPlayers.find(p => p.allyCode === allyCode)
    if (player) {
      setCurrentPlayer(player)
      setPlayerData(player.data)
      saveLastUsedPlayer(allyCode)
    }
  }

  // Handle refresh
const handleRefresh = async () => {
  if (!currentPlayer || isRefreshing) return
  
  setIsRefreshing(true)
  
  try {
    // ... existing code ...
    
  } catch (error) {
    console.error('Error refreshing player data:', error)
    alert('Failed to refresh player data')
  } finally {
    setIsRefreshing(false)
  }
}

  // Handle add new player
  const handleAddNew = () => {
    setPlayerData(null)
    setCurrentPlayer(null)
  }

  return (
    <div className="app">
      <NavBar 
        currentPlayer={currentPlayer}
        savedPlayers={savedPlayers}
        onPlayerSwitch={handlePlayerSwitch}
        onRefresh={handleRefresh}
        onAddNew={handleAddNew}
        isRefreshing={isRefreshing}
      />
      
      {!playerData ? (
        <AllyCodeEntry onDataFetched={(data) => {
          // Reload saved players to get the new/updated player
          const players = loadSavedPlayers()
          const player = players.find(p => p.data.allyCode === data.allyCode)
          if (player) {
            setCurrentPlayer(player)
            setSavedPlayers(players)
            setPlayerData(data)
          }
        }} />
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