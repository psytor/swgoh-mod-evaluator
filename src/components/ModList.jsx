import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import { getSpeedRecommendation } from './ModCard' // Need to export this from ModCard.jsx
import './ModList.css'

function ModList({ playerData, evaluationMode, filterType = 'all' }) {
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
    <div className="mod-list-container">
      <div className="mod-list-header">
        <h1>Your Mods</h1>
        <p>
          Showing {filteredMods.length} of {mods.length} mods 
          {filterType !== 'all' && ` (${filterType} only)`}
        </p>
      </div>
      
      <div className="mod-grid">
        {filteredMods.map((mod, index) => (
          <ModCard key={mod.id || index} mod={mod} evaluationMode={evaluationMode} />
        ))}
      </div>
    </div>
  )
}

export default ModList