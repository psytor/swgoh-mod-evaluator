import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import './ModList.css'

function ModList({ playerData }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extract all mods from player data
    const extractedMods = []
    
    if (playerData?.rosterUnit) {
      playerData.rosterUnit.forEach(unit => {
        if (unit.equippedStatMod && unit.equippedStatMod.length > 0) {
          unit.equippedStatMod.forEach(mod => {
            extractedMods.push({
              ...mod,
              characterName: unit.definitionId // We'll make this pretty later
            })
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

  return (
    <div className="mod-list-container">
      <div className="mod-list-header">
        <h1>Your Mods</h1>
        <p>Found {mods.length} mods equipped on your characters</p>
      </div>
      
      <div className="mod-grid">
        {mods.map((mod, index) => (
          <ModCard key={mod.id || index} mod={mod} />
        ))}
      </div>
    </div>
  )
}

export default ModList
