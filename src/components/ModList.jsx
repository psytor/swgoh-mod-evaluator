import { useState, useEffect } from 'react'
import ModCard from './ModCard'
import ModDetailModal from './ModDetailModal'
import { getSpeedRecommendation, getCharacterDisplayName, calculateModEfficiency, useCharacterNames } from './ModCard'
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
function CollectionEfficiencyDisplay({ collectionStats, modStats }) {
  return (
    <div className="collection-efficiency">
      <div className="collection-overall">
        <span className="efficiency-label">Collection Average:</span>
        <span className="efficiency-value">{collectionStats.average.toFixed(1)}%</span>
      </div>

      <div className="collection-breakdown">
        {modStats.keep > 0 && (
          <div className="breakdown-item breakdown-keep">
            <span className="breakdown-label">Keep: {modStats.keep}</span>
            <span className="breakdown-separator">-</span>
            <span className="breakdown-value">{collectionStats.breakdown.keep?.average.toFixed(1) || '0.0'}%</span>
          </div>
        )}
        {modStats.sell > 0 && (
          <div className="breakdown-item breakdown-sell">
            <span className="breakdown-label">Sell: {modStats.sell}</span>
            <span className="breakdown-separator">-</span>
            <span className="breakdown-value">{collectionStats.breakdown.sell?.average.toFixed(1) || '0.0'}%</span>
          </div>
        )}
        {modStats.slice > 0 && (
          <div className="breakdown-item breakdown-slice">
            <span className="breakdown-label">Slice: {modStats.slice}</span>
            <span className="breakdown-separator">-</span>
            <span className="breakdown-value">{collectionStats.breakdown.slice?.average.toFixed(1) || '0.0'}%</span>
          </div>
        )}
        {modStats.level > 0 && (
          <div className="breakdown-item breakdown-level">
            <span className="breakdown-label">Level: {modStats.level}</span>
            <span className="breakdown-separator">-</span>
            <span className="breakdown-value">{collectionStats.breakdown.level?.average.toFixed(1) || '0.0'}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ModList({ playerData, evaluationMode, onModeChange, filterType, onFilterChange }) {
  const { characterNames } = useCharacterNames();
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')
  const [characterList, setCharacterList] = useState([])
  const [activeFilters, setActiveFilters] = useState(['all'])
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [tempLockedMods, setTempLockedMods] = useState(() => {
    const saved = localStorage.getItem('swgoh_temp_locked_mods')
    return saved ? JSON.parse(saved) : []
  })

  // Modal state
  const [selectedMod, setSelectedMod] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModClick = (mod) => {
    setSelectedMod(mod)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Don't clear selectedMod immediately to prevent flicker
    setTimeout(() => setSelectedMod(null), 300)
  }

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
      if (filterPanelOpen && !event.target.closest('.filter-panel') && !event.target.closest('.filter-toggle-tab')) {
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
        const nameA = getCharacterDisplayName(a, characterNames).name
        const nameB = getCharacterDisplayName(b, characterNames).name
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

    if (selectedTier !== 'all' && mod.tier !== parseInt(selectedTier)) {
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
            const charInfo = getCharacterDisplayName(charId, characterNames);
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

      {/* UPDATED MOD TIER FILTER */}
      <div className="filter-group">
        <label>Mod Tier:</label>
        <div className="toggle-filters">
          <button
            className={`toggle-button ${selectedTier === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTier('all')}
          >
            All
          </button>
          <button
            className={`toggle-button ${selectedTier === '5' ? 'active' : ''}`}
            onClick={() => setSelectedTier('5')}
          >
            Gold (A)
          </button>
          <button
            className={`toggle-button ${selectedTier === '4' ? 'active' : ''}`}
            onClick={() => setSelectedTier('4')}
          >
            Purple (B)
          </button>
          <button
            className={`toggle-button ${selectedTier === '3' ? 'active' : ''}`}
            onClick={() => setSelectedTier('3')}
          >
            Blue (C)
          </button>
          <button
            className={`toggle-button ${selectedTier === '2' ? 'active' : ''}`}
            onClick={() => setSelectedTier('2')}
          >
            Green (D)
          </button>
          <button
            className={`toggle-button ${selectedTier === '1' ? 'active' : ''}`}
            onClick={() => setSelectedTier('1')}
          >
            Grey (E)
          </button>
        </div>
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
      {(
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

      {/* Desktop Filter Bar / Mobile Header + Filter Panel */}
      {!isMobile && (
        <div className="filter-bar">
          <div className="filter-bar-content">
            <div className="filter-bar-header">
              <h1>Your Mods</h1>
              <p className="mod-count">
                Showing {filteredMods.length} of {mods.length} mods
                {!activeFilters.includes('all') && ` (${activeFilters.join(', ')})`}
              </p>
              {filteredMods.length > 0 && (
                <CollectionEfficiencyDisplay collectionStats={collectionStats} modStats={modStats} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile scrollable header */}
      {isMobile && (
        <div className="mobile-header">
          <h1>Your Mods</h1>
          <p className="mod-count">
            Showing {filteredMods.length} of {mods.length} mods
            {!activeFilters.includes('all') && ` (${activeFilters.join(', ')})`}
          </p>
          {filteredMods.length > 0 && (
            <CollectionEfficiencyDisplay collectionStats={collectionStats} modStats={modStats} />
          )}
        </div>
      )}

      {/* Filter Panel (for both mobile and desktop) */}
      <div className={`filter-panel ${filterPanelOpen ? 'open' : ''}`}>
        <div className="filter-panel-content">
          <button
            className="filter-panel-close"
            onClick={() => setFilterPanelOpen(false)}
          >
            ×
          </button>

          <h2 className="filter-panel-title">Filters</h2>

          <div className="filter-controls-panel">
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
              onClick={handleModClick}
            />
          ))}
        </div>
      </div>
      
      <ModDetailModal 
        mod={selectedMod}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        evaluationMode={evaluationMode}
      />
    </div>
  )
}

export default ModList