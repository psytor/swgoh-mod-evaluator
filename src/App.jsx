import { useState, useEffect } from 'react'
import AllyCodeEntry from './components/AllyCodeEntry'
import ModList from './components/ModList'
import './App.css'
import NavBar from './components/NavBar'

function App() {
  const [playerData, setPlayerData] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('basic') // 'basic' or 'strict'
  const [filterType, setFilterType] = useState('all') // 'all', 'keep', 'sell', 'slice', 'level'
  const [savedPlayers, setSavedPlayers] = useState(loadSavedPlayers())
  const [currentPlayer, setCurrentPlayer] = useState(loadLastUsedPlayer())

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
    if (!currentPlayer) return
    
    try {
      const response = await fetch('http://farmroadmap.dynv6.net/comlink/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: { allyCode: currentPlayer.allyCode },
          enums: false
        })
      })
      
      if (!response.ok) throw new Error('Failed to fetch player data')
      
      const data = await response.json()
      
      // Update saved players
      const updatedPlayers = savedPlayers.map(p => 
        p.allyCode === currentPlayer.allyCode 
          ? { ...p, data, lastUpdated: Date.now() }
          : p
      )
      setSavedPlayers(updatedPlayers)
      savePlayers(updatedPlayers)
      
      // Update current data
      setPlayerData(data)
      setCurrentPlayer({ ...currentPlayer, data, lastUpdated: Date.now() })
      
    } catch (error) {
      console.error('Error refreshing player data:', error)
      alert('Failed to refresh player data')
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