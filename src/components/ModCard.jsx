import './ModCard.css'

// Mappings from the API documentation
const MOD_SETS = {
  1: "Health",
  2: "Offense", 
  3: "Defense",
  4: "Speed",
  5: "Critical Chance",
  6: "Critical Damage",
  7: "Potency",
  8: "Tenacity"
}

const MOD_SLOTS = {
  1: "Square",
  2: "Arrow",
  3: "Diamond",
  4: "Triangle",
  5: "Circle",
  6: "Cross"
}

const MOD_TIERS = {
  1: "Grey",
  2: "Green",
  3: "Blue",
  4: "Purple",
  5: "Gold"
}

const STAT_NAMES = {
  1: "Health",
  5: "Speed",
  16: "Critical Damage %",
  17: "Potency %",
  18: "Tenacity %",
  28: "Protection",
  41: "Offense",
  42: "Defense",
  48: "Offense %",
  49: "Defense %",
  53: "Critical Chance %",
  55: "Health %",
  56: "Protection %"
}

function ModCard({ mod }) {
  // Parse definitionId (e.g., "451" = Speed set, 5 dots, Square slot)
  const setType = MOD_SETS[mod.definitionId[0]] || "Unknown"
  const dots = parseInt(mod.definitionId[1])
  const slotType = MOD_SLOTS[mod.definitionId[2]] || "Unknown"
  
  // Get mod color/tier
  const modColor = MOD_TIERS[mod.tier] || "Unknown"
  
  // Decode primary stat
  const primaryStatId = mod.primaryStat?.stat?.unitStatId
  const primaryStatName = STAT_NAMES[primaryStatId] || `Stat ${primaryStatId}`
  const primaryStatValue = parseInt(mod.primaryStat?.stat?.statValueDecimal) / 10000
  
  // Format primary stat for display
  const formatPrimaryStat = () => {
    if ([16, 17, 18, 48, 49, 53, 55, 56].includes(primaryStatId)) {
      return `${(primaryStatValue * 100).toFixed(2)}%`
    }
    return Math.floor(primaryStatValue).toString()
  }

  return (
    <div className={`mod-card mod-${modColor.toLowerCase()}`}>
      <div className="mod-recommendation-placeholder">
        {/* Recommendation will go here */}
      </div>
      
      <div className="mod-top-section">
        <div className="mod-left-side">
          <div className="mod-dots">
            {[...Array(7)].map((_, i) => (
              <span key={i} className={`dot ${i < dots ? 'filled' : 'empty'}`}>●</span>
            ))}
          </div>
          <div className="mod-shape-placeholder">
            <div className="mod-slot-text">{slotType}</div>
            <div className="mod-set-text">{setType}</div>
          </div>
          <div className="mod-level">
            Level {mod.level}/15
          </div>
        </div>
        
        <div className="mod-right-side">
          <div className="mod-primary">
            <span className="stat-name">{primaryStatName}</span>
            <span className="stat-value">{formatPrimaryStat()}</span>
          </div>
          
          <div className="mod-secondaries">
            {mod.secondaryStat && mod.secondaryStat.map((stat, index) => {
              const statId = stat.stat.unitStatId
              const statName = STAT_NAMES[statId] || `Stat ${statId}`
              const statValue = parseInt(stat.stat.statValueDecimal) / 10000
              const rolls = stat.statRolls || 0
              
              // Format secondary stat
              const formatValue = () => {
                if ([16, 17, 18, 48, 49, 53, 55, 56].includes(statId)) {
                  return `${(statValue * 100).toFixed(2)}%`
                }
                return Math.floor(statValue).toString()
              }
              
              return (
                <div key={index} className="secondary-stat">
                  <span className="stat-value">{formatValue()}</span>
                  <span className="stat-name">{statName}</span>
                  <span className="stat-rolls">({rolls})</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="mod-character">
        {mod.characterName}
      </div>
    </div>
  )
}

export default ModCard
