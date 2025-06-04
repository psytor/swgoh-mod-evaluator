import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import { getSpeedRecommendation, getCharacterDisplayName } from './ModCard'
import './ModList.css'

function ModList({ playerData, evaluationMode, onModeChange, filterType, onFilterChange }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCharacter, setSelectedCharacter] = useState('all')
  const [characterList, setCharacterList] = useState([])

  const [activeFilters, setActiveFilters] = useState(['all'])

  const [tempLockedMods, setTempLockedMods] = useState(() => {
    // Load temporary locks from localStorage
    const saved = localStorage.getItem('swgoh_temp_locked_mods')
    return saved ? JSON.parse(saved) : []
  })

  const toggleFilter = (filterName) => {
    setActiveFilters(prev => {
      if (filterName === 'all') {
        return ['all']
      }
      
      let newFilters = prev.filter(f => f !== 'all')
      
      if (prev.includes(filterName)) {
        newFilters = newFilters.filter(f => f !== filterName)
      } else {
        newFilters = [...newFilters, filterName]
      }
      
      return newFilters.length === 0 ? ['all'] : newFilters
    })
  }

  useEffect(() => {
    // Extract all mods from player data
    const extractedMods = []
    
    if (playerData?.rosterUnit) {
      playerData.rosterUnit.forEach(unit => {
        if (unit.equippedStatMod && unit.equippedStatMod.length > 0) {
          unit.equippedStatMod.forEach(mod => {
            // Only include 5-dot and 6-dot mods
            const dots = parseInt(mod.definitionId[1])
            if (dots >= 5) {
              extractedMods.push({
                ...mod,
                characterName: unit.definitionId
              })
            }
          })
        }
      })
    }

    // Build unique character list
    const uniqueCharacters = [...new Set(extractedMods.map(mod => mod.characterName))]
      .sort((a, b) => {
        const nameA = getCharacterDisplayName(a).name
        const nameB = getCharacterDisplayName(b).name
        return nameA.localeCompare(nameB)
      })
    setCharacterList(uniqueCharacters)
    
    setMods(extractedMods)
    setLoading(false)
  }, [playerData])



  if (loading) {
    return <div className="loading">Processing mods...</div>
  }

  // Filter mods based on activeFilters
  const filteredMods = mods.filter(mod => {
    // Character filter
    if (selectedCharacter !== 'all' && mod.characterName !== selectedCharacter) {
      return false
    }
    
    // Recommendation filter
    if (activeFilters.includes('all')) return true
    
    const recommendation = getSpeedRecommendation(mod, evaluationMode)
    return activeFilters.includes(recommendation.type)
  })

  // Calculate summary statistics
  const modStats = filteredMods.reduce((acc, mod) => {
    const recommendation = getSpeedRecommendation(mod, evaluationMode)
    acc[recommendation.type] = (acc[recommendation.type] || 0) + 1
    return acc
  }, {})

  const toggleTempLock = (modId) => {
    setTempLockedMods(prev => {
      const newLocks = prev.includes(modId) 
        ? prev.filter(id => id !== modId)
        : [...prev, modId]
      
      // Save to localStorage
      localStorage.setItem('swgoh_temp_locked_mods', JSON.stringify(newLocks))
      return newLocks
    })
  }

return (
    <div className="mod-list-wrapper">
      <div className="filter-bar">
        <div className="filter-bar-content">
          <div className="filter-bar-header">
            <h1>Your Mods</h1>
            <div className="mod-stats">
              <p className="mod-count">
                Showing {filteredMods.length} of {mods.length} mods
                {!activeFilters.includes('all') && ` (${activeFilters.join(', ')})`}
              </p>
              {filteredMods.length > 0 && (
                <div className="mod-summary">
                  {modStats.keep && <span className="stat-keep">{modStats.keep} to keep</span>}
                  {modStats.sell && <span className="stat-sell">{modStats.sell} to sell</span>}
                  {modStats.slice && <span className="stat-slice">{modStats.slice} to slice</span>}
                  {modStats.level && <span className="stat-level">{modStats.level} to level</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Character:</label>
              <select 
                value={selectedCharacter} 
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="all">All Characters</option>
                  {characterList.map(charId => {
                    const charInfo = getCharacterDisplayName(charId);
                    return (
                      <option key={charId} value={charId}>
                        {charInfo.hasWarning ? `⚠️ ${charInfo.name}` : charInfo.name}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div className="filter-group">
              <label>Evaluation Mode:</label>
              <select 
                value={evaluationMode} 
                onChange={(e) => onModeChange(e.target.value)}
                className="filter-dropdown"
              >
                <option value="basic">Basic (Keep Any Speed)</option>
                <option value="strict">Strict (Limited Inventory)</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Filter:</label>
              <div className="toggle-filters">
                <button 
                  className={`toggle-button ${activeFilters.includes('all') ? 'active' : ''}`}
                  onClick={() => toggleFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`toggle-button ${activeFilters.includes('keep') ? 'active' : ''}`}
                  onClick={() => toggleFilter('keep')}
                >
                  Keep
                </button>
                <button 
                  className={`toggle-button ${activeFilters.includes('sell') ? 'active' : ''}`}
                  onClick={() => toggleFilter('sell')}
                >
                  Sell
                </button>
                <button 
                  className={`toggle-button ${activeFilters.includes('slice') ? 'active' : ''}`}
                  onClick={() => toggleFilter('slice')}
                >
                  Slice
                </button>
                <button 
                  className={`toggle-button ${activeFilters.includes('level') ? 'active' : ''}`}
                  onClick={() => toggleFilter('level')}
                >
                  Level
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mod-list-container">
        <div className="mod-grid">
          {filteredMods.map((mod, index) => (
            <ModCard 
              key={mod.id || index} 
              mod={mod} 
              evaluationMode={evaluationMode}
              isTempLocked={tempLockedMods.includes(mod.id)}
              onToggleTempLock={toggleTempLock}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModList