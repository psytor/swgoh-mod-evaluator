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

  const handleDeletePlayer = async (allyCodeToDelete) => {
    // Remove from saved players
    const updatedPlayers = savedPlayers.filter(p => p.allyCode !== allyCodeToDelete)
    setSavedPlayers(updatedPlayers)
    savePlayers(updatedPlayers)
    
    // If we're deleting the current player, switch to another or clear
    if (currentPlayer && currentPlayer.allyCode === allyCodeToDelete) {
      if (updatedPlayers.length > 0) {
        // Switch to the first available player
        handlePlayerSwitch(updatedPlayers[0].allyCode)
      } else {
        // No players left, clear everything
        setCurrentPlayer(null)
        setPlayerData(null)
        localStorage.removeItem('swgoh_last_used_player')
      }
    }
    
    // Optional: Clear server-side cache
    try {
      await fetch(`https://farmroadmap.dynv6.net/api/cache/${allyCodeToDelete}`, {
        method: 'DELETE'
      })
    } catch (error) {
      // Ignore errors - cache will expire anyway
      console.log('Could not clear server cache:', error)
    }
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
const handleRefresh = async (event) => {
  if (!currentPlayer || isRefreshing) return
  
  // Check for dev mode - hold Shift key while clicking refresh
  const isDevMode = event?.shiftKey === true
  
  // Check rate limit - 1 hour (3600000 ms)
  if (!isDevMode) {
    const ONE_HOUR = 3600000
    const lastRefresh = currentPlayer.lastUpdated || 0
    const timeSinceLastRefresh = Date.now() - lastRefresh
    
    if (timeSinceLastRefresh < ONE_HOUR) {
      const minutesRemaining = Math.ceil((ONE_HOUR - timeSinceLastRefresh) / 60000)
      alert(`Please wait ${minutesRemaining} minutes before refreshing again.`)
      return
    }
  }
  
  setIsRefreshing(true)
  console.log(isDevMode ? 'DEV MODE: Force refreshing...' : 'Refreshing player data...')
  
  try {
    const response = await fetch(`https://farmroadmap.dynv6.net/api/player/${currentPlayer.allyCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!apiResponse.success) {
      throw new Error('API returned an error')
    }
    
    const apiResponse = await response.json()
    
    // Update saved players
    const updatedPlayers = savedPlayers.map(p => 
      p.allyCode === currentPlayer.allyCode 
        ? { 
            ...p, 
            data: {
              ...apiResponse,
              apiResponse: apiResponse
            }, 
            lastUpdated: Date.now() 
          }
        : p
    )
    setSavedPlayers(updatedPlayers)
    savePlayers(updatedPlayers)
    
    // Update current data - Force new object reference
    setPlayerData({ ...data })
    setCurrentPlayer({ ...currentPlayer, data, lastUpdated: Date.now() })
    
    // Show success message
    alert('Player data refreshed successfully!')
    console.log('Player data refreshed successfully!')
    
  } catch (error) {
    console.error('Error refreshing player data:', error)
    alert('Failed to refresh player data. Please try again.')
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
        onDeletePlayer={handleDeletePlayer}
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