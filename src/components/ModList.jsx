import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import { getSpeedRecommendation, getCharacterDisplayName, calculateModEfficiency } from './ModCard'
import './ModList.css'

// Calculate collection efficiency
function calculateCollectionEfficiency(mods, evaluationMode, tempLockedMods = []) {
  if (!mods || mods.length === 0) return { average: 0, count: 0, breakdown: {} };
  
  let totalEfficiency = 0;
  let modCount = 0;
  const breakdown = {
    keep: { total: 0, count: 0 },
    sell: { total: 0, count: 0 },
    slice: { total: 0, count: 0 },
    level: { total: 0, count: 0 }
  };
  
  mods.forEach(mod => {
    const dots = parseInt(mod.definitionId[1]);
    const is6Dot = dots === 6;
    
    // Calculate mod efficiency
    const modEfficiency = calculateModEfficiency(mod.secondaryStat, is6Dot);
    
    if (modEfficiency > 0) {
      totalEfficiency += modEfficiency;
      modCount++;
      
      // Get recommendation for breakdown
      const isLocked = mod.locked || tempLockedMods.includes(mod.id);
      const recommendation = getSpeedRecommendation(mod, evaluationMode, isLocked);
      if (breakdown[recommendation.type]) {
        breakdown[recommendation.type].total += modEfficiency;
        breakdown[recommendation.type].count++;
      }
    }
  });
  
  return {
    average: modCount > 0 ? totalEfficiency / modCount : 0,
    count: modCount,
    breakdown: Object.keys(breakdown).reduce((acc, key) => {
      acc[key] = {
        ...breakdown[key],
        average: breakdown[key].count > 0 ? breakdown[key].total / breakdown[key].count : 0
      };
      return acc;
    }, {})
  };
}

// Component to display collection efficiency
function CollectionEfficiencyDisplay({ collectionStats }) {
  return (
    <div className="collection-efficiency">
      <div className="collection-overall">
        <span className="efficiency-label">Collection Average:</span>
        <span className="efficiency-value">{collectionStats.average.toFixed(1)}%</span>
        <span className="efficiency-count">({collectionStats.count} mods)</span>
      </div>
      
      <div className="collection-breakdown">
        {Object.entries(collectionStats.breakdown).map(([type, stats]) => {
          if (stats.count === 0) return null;
          
          return (
            <div key={type} className={`breakdown-item breakdown-${type}`}>
              <span className="breakdown-label">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
              <span className="breakdown-value">{stats.average.toFixed(1)}%</span>
              <span className="breakdown-count">({stats.count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModList({ playerData, evaluationMode, onModeChange, filterType, onFilterChange }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState('all')
  const [characterList, setCharacterList] = useState([])
  const [activeFilters, setActiveFilters] = useState(['all'])
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [tempLockedMods, setTempLockedMods] = useState(() => {
    const saved = localStorage.getItem('swgoh_temp_locked_mods')
    return saved ? JSON.parse(saved) : []
  })

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close panel when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && filterPanelOpen && !event.target.closest('.filter-panel') && !event.target.closest('.filter-toggle-tab')) {
        setFilterPanelOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobile, filterPanelOpen])

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
    
    // Handle locked filter specially
    if (activeFilters.includes('locked') && !activeFilters.includes('all')) {
      const isLocked = mod.locked || tempLockedMods.includes(mod.id)
      if (!isLocked) return false
    }
    
    // Recommendation filter
    if (activeFilters.includes('all')) return true
    
    const isLocked = mod.locked || tempLockedMods.includes(mod.id)
    const recommendation = getSpeedRecommendation(mod, evaluationMode, isLocked)
    
    // If we're filtering by locked, also include it
    if (activeFilters.includes('locked') && isLocked) return true
    
    return activeFilters.includes(recommendation.type)
  })

  // Calculate summary statistics
  const modStats = filteredMods.reduce((acc, mod) => {
    const isLocked = mod.locked || tempLockedMods.includes(mod.id)
    const recommendation = getSpeedRecommendation(mod, evaluationMode, isLocked)
    acc[recommendation.type] = (acc[recommendation.type] || 0) + 1
    return acc
  }, {})

  // Calculate collection efficiency 
  const collectionStats = calculateCollectionEfficiency(filteredMods, evaluationMode, tempLockedMods);

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

  // Filter controls content (reusable for both mobile and desktop)
  const filterControls = (
    <>
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
          <button 
            className={`toggle-button ${activeFilters.includes('locked') ? 'active' : ''}`}
            onClick={() => toggleFilter('locked')}
          >
            Locked
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="mod-list-wrapper">
      {/* Mobile Filter Toggle Tab */}
      {isMobile && (
        <div 
          className={`filter-toggle-tab ${filterPanelOpen ? 'open' : ''}`}
          onClick={() => setFilterPanelOpen(!filterPanelOpen)}
        >
          <span>F</span>
          <span>I</span>
          <span>L</span>
          <span>T</span>
          <span>E</span>
          <span>R</span>
          <span>S</span>
        </div>
      )}

      {/* Desktop Filter Bar / Mobile Filter Panel */}
      <div className={`filter-bar ${isMobile ? 'filter-panel' : ''} ${isMobile && filterPanelOpen ? 'open' : ''}`}>
        <div className="filter-bar-content">
          {isMobile && (
            <button 
              className="filter-panel-close"
              onClick={() => setFilterPanelOpen(false)}
            >
              ×
            </button>
          )}
          
          <div className="filter-bar-header">
            <h1>Your Mods</h1>
            <div className="mod-stats">
              <p className="mod-count">
                Showing {filteredMods.length} of {mods.length} mods
                {!activeFilters.includes('all') && ` (${activeFilters.join(', ')})`}
              </p>
              {filteredMods.length > 0 && (
                <div>
                </div>
              )}
            </div>
          </div>
          
          <div className={`filter-controls ${isMobile ? 'mobile' : ''}`}>
            {filterControls}
          </div>
        </div>
      </div>
      
      <div className={`mod-list-container ${isMobile ? 'mobile' : ''}`}>
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