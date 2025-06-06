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
      const response = await fetch('http://farmroadmap.dynv6.net/comlink/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payload: {
            allyCode: cleanAllyCode
          },
          enums: false
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch player data')
      }
      
      const playerData = await response.json()
      
      // Create player object
      const playerInfo = {
        allyCode: cleanAllyCode,
        name: playerData.name,
        data: playerData,
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
      
      // Notify parent
      onDataFetched(playerData)
      
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
