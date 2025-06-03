import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import { getSpeedRecommendation, getCharacterDisplayName } from './ModCard'
import './ModList.css'

function ModList({ playerData, evaluationMode, onModeChange, filterType, onFilterChange }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCharacter, setSelectedCharacter] = useState('all')
  const [characterList, setCharacterList] = useState([])

  // Build unique character list
  const uniqueCharacters = [...new Set(extractedMods.map(mod => mod.characterName))]
    .sort((a, b) => {
      const nameA = getCharacterDisplayName(a)
      const nameB = getCharacterDisplayName(b)
      return nameA.localeCompare(nameB)
    })
  setCharacterList(uniqueCharacters)

  const [activeFilters, setActiveFilters] = useState(['all'])

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
                characterName: unit.definitionId // We'll make this pretty later
              })
            }
          })
        }
      })
    }
    
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

return (
    <div className="mod-list-wrapper">
      <div className="filter-bar">
        <div className="filter-bar-content">
          <div className="filter-bar-header">
            <h1>Your Mods</h1>
            <p className="mod-count">
              Showing {filteredMods.length} of {mods.length} mods
              {!activeFilters.includes('all') && ` (${activeFilters.join(', ')})`}
            </p>
          </div>
          
          <div className="filter-controls">
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
            <ModCard key={mod.id || index} mod={mod} evaluationMode={evaluationMode} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModList