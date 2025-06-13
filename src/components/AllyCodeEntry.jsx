import { useState } from 'react'
import './AllyCodeEntry.css'

function AllyCodeEntry({ onDataFetched }) {
  const [allyCode, setAllyCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatAllyCode = (value) => {
    const numbers = value.replace(/\D/g, '')
    let formatted = ''
    
    for (let i = 0; i < numbers.length && i < 9; i++) {
      if (i === 3 || i === 6) {
        formatted += '-'
      }
      formatted += numbers[i]
    }
    
    return formatted
  }

  const handleInputChange = (e) => {
    setAllyCode(formatAllyCode(e.target.value))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const cleanAllyCode = allyCode.replace(/\D/g, '')
    
    if (cleanAllyCode.length !== 9) {
      setError('Please enter a valid 9-digit ally code')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`https://farmroadmap.dynv6.net/api/player/${cleanAllyCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch player data')
      }
      
      const apiResponse = await response.json()

      // Check if the API request was successful
      if (!apiResponse.success) {
        throw new Error('API returned an error')
      }

      // Create player object
      const playerInfo = {
        allyCode: cleanAllyCode,
        name: apiResponse.playerName,
        data: {
          ...apiResponse,
          apiResponse: apiResponse
        },
        lastUpdated: Date.now()
      }

      // Load existing players
      const existingPlayers = JSON.parse(localStorage.getItem('swgoh_saved_players') || '[]')

      // Check if player already exists
      const existingIndex = existingPlayers.findIndex(p => p.allyCode === cleanAllyCode)

      if (existingIndex >= 0) {
        // Update existing player
        existingPlayers[existingIndex] = playerInfo
      } else {
        // Add new player
        existingPlayers.push(playerInfo)
      }

      // Save updated players list
      localStorage.setItem('swgoh_saved_players', JSON.stringify(existingPlayers))
      localStorage.setItem('swgoh_last_used_player', cleanAllyCode)

      // Notify parent - pass the complete data structure
      onDataFetched(playerInfo.data)
      
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch player data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ally-code-container">
      <div className="ally-code-card">
        <h1>SWGOH Mod Evaluator</h1>
        <p className="subtitle">Enter your ally code to analyze your mods</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="allyCode">Ally Code</label>
            <input
              type="text"
              id="allyCode"
              value={allyCode}
              onChange={handleInputChange}
              placeholder="123-456-789"
              maxLength="11"
              autoComplete="off"
              disabled={loading}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Analyze Mods'}
          </button>
        </form>
        
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching player data...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllyCodeEntry
