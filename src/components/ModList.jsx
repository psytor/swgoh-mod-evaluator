import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import { getSpeedRecommendation } from './ModCard' // Need to export this from ModCard.jsx
import './ModList.css'

function ModList({ playerData, evaluationMode, onModeChange, filterType, onFilterChange }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Filter mods based on filterType
  const filteredMods = mods.filter(mod => {
    if (filterType === 'all') return true
    
    const recommendation = getSpeedRecommendation(mod, evaluationMode)
    return recommendation.type === filterType
  })

return (
    <div className="mod-list-wrapper">
      <div className="filter-bar">
        <div className="filter-bar-content">
          <div className="filter-bar-header">
            <h1>Your Mods</h1>
            <p className="mod-count">
              Showing {filteredMods.length} of {mods.length} mods
              {filterType !== 'all' && ` (${filterType} only)`}
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
              <label>Show:</label>
              <select 
                value={filterType} 
                onChange={(e) => onFilterChange(e.target.value)}
                className="filter-dropdown"
              >
                <option value="all">All Mods</option>
                <option value="keep">Keep Only</option>
                <option value="sell">Sell Only</option>
                <option value="slice">Slice Only</option>
                <option value="level">Need Leveling</option>
              </select>
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