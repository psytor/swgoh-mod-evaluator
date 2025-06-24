import { useState, useEffect } from 'react'
import './ModList.css'
import ModCard from './ModCard'
import ModDetailModal from './ModDetailModal'
import { decodeModData } from '../utils/modDecoder'
import { evaluateModWithWorkflow } from '../utils/workflowEvaluator';
import { EVALUATION_WORKFLOWS } from '../config/evaluationWorkflows';
import charactermodsAtlas from '../assets/charactermods_datacard_atlas.png';
import miscAtlas from '../assets/misc_atlas.png';

// Filter configuration with sprites
const FILTER_CONFIG = {
  slots: {
    "1": { name: "Square", sprite: { x: 696, y: 117, w: 79, h: 77 } },
    "2": { name: "Arrow", sprite: { x: 696, y: 195, w: 79, h: 77 } },
    "3": { name: "Diamond", sprite: { x: 696, y: 433, w: 79, h: 79 } },
    "4": { name: "Triangle", sprite: { x: 854, y: 212, w: 78, h: 64 } },
    "5": { name: "Circle", sprite: { x: 775, y: 354, w: 79, h: 78 } },
    "6": { name: "Cross", sprite: { x: 729, y: 37, w: 76, h: 79 } }
  },
  sets: {
    "1": { name: "Health", sprite: { x: 1278, y: 1128, w: 120, h: 120 } },
    "2": { name: "Offense", sprite: { x: 1408, y: 1126, w: 120, h: 120 } },
    "3": { name: "Defense", sprite: { x: 1250, y: 1255, w: 120, h: 120 } },
    "4": { name: "Speed", sprite: { x: 1107, y: 747, w: 120, h: 120 } },
    "5": { name: "Critical Chance", sprite: { x: 1265, y: 358, w: 120, h: 120 } },
    "6": { name: "Critical Damage", sprite: { x: 1195, y: 992, w: 120, h: 120 } },
    "7": { name: "Potency", sprite: { x: 1143, y: 1117, w: 120, h: 120 } },
    "8": { name: "Tenacity", sprite: { x: 1288, y: 1385, w: 120, h: 120 } }
  },
  tiers: {
    "1": { name: "Grey (E)", color: "#6b7280" },
    "2": { name: "Green (D)", color: "#10b981" },
    "3": { name: "Blue (C)", color: "#3b82f6" },
    "4": { name: "Purple (B)", color: "#8b5cf6" },
    "5": { name: "Gold (A)", color: "#f59e0b" }
  },
  rarity: {
    "1-4": { name: "1-4 Dots", description: "Low quality mods" },
    "5": { name: "5 Dots", description: "Standard max quality" },
    "6": { name: "6 Dots", description: "Premium quality" }
  },
  primaryStats: {
    "1": "Health",
    "5": "Speed", 
    "16": "Critical Damage %",
    "17": "Potency %",
    "18": "Tenacity %",
    "28": "Protection",
    "41": "Offense",
    "42": "Defense",
    "48": "Offense %",
    "49": "Defense %",
    "52": "Accuracy %",
    "53": "Critical Chance %",
    "54": "Critical Avoidance %",
    "55": "Health %",
    "56": "Protection %"
  },
  secondaryStats: {
    "1": "Health",
    "5": "Speed",
    "16": "Critical Damage %",
    "17": "Potency %",
    "18": "Tenacity %",
    "28": "Protection",
    "41": "Offense",
    "42": "Defense",
    "48": "Offense %",
    "49": "Defense %",
    "53": "Critical Chance %",
    "55": "Health %",
    "56": "Protection %"
  }
};

// Sprite component for visual filters
function FilterSprite({ spriteData, atlasUrl, size = 32, className = "" }) {
  if (!spriteData) return null;
  
  const scale = size / Math.max(spriteData.w, spriteData.h);
  const scaledW = spriteData.w * scale;
  const scaledH = spriteData.h * scale;
  
  return (
    <div 
      className={`filter-sprite ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${atlasUrl})`,
        backgroundPosition: `-${spriteData.x * scale}px -${spriteData.y * scale}px`,
        backgroundSize: `${1600 * scale}px ${1600 * scale}px`,
        imageRendering: 'pixelated'
      }}
    />
  );
}

// Individual filter section component
function FilterSection({ title, filters, selectedFilters, onToggleFilter, type, atlasUrl }) {
  return (
    <div className="filter-section">
      <h4 className="filter-section-title">{title}</h4>
      <div className="filter-grid">
        {Object.entries(filters).map(([key, config]) => {
          const isSelected = selectedFilters.includes(key);
          
          return (
            <button
              key={key}
              className={`filter-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleFilter(type, key)}
              title={config.description || config.name}
            >
              {/* Show sprite for slots and sets */}
              {config.sprite && (
                <FilterSprite 
                  spriteData={config.sprite} 
                  atlasUrl={atlasUrl}
                  size={24}
                />
              )}
              
              {/* Show color indicator for tiers */}
              {config.color && (
                <div 
                  className="tier-color-indicator"
                  style={{ backgroundColor: config.color }}
                />
              )}
              
              <span className="filter-name">{config.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Calculate collection efficiency using pre-calculated values
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
    const modEfficiency = mod.efficiency || 0;

    if (modEfficiency > 0) {
      totalEfficiency += modEfficiency;
      modCount++;

      const isLocked = mod.locked || tempLockedMods.includes(mod.id);
      const evaluation = isLocked 
        ? { verdict: 'keep' } 
        : evaluateModWithWorkflow(mod, evaluationMode);
      
      const verdict = evaluation.verdict;
      
      if (breakdown[verdict]) {
        breakdown[verdict].total += modEfficiency;
        breakdown[verdict].count++;
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
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState('all')
  const [characterList, setCharacterList] = useState([])
  const [activeFilters, setActiveFilters] = useState(['all'])
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // New filter states - all start empty (show everything by default)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedSets, setSelectedSets] = useState([])
  const [selectedTiers, setSelectedTiers] = useState([])
  const [selectedRarity, setSelectedRarity] = useState([])
  const [selectedPrimaryStats, setSelectedPrimaryStats] = useState([])
  const [selectedSecondaryStats, setSelectedSecondaryStats] = useState([])

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

  // Toggle individual filter
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

  // Handle new filter toggles
  const handleFilterToggle = (type, key) => {
    const setterMap = {
      slots: setSelectedSlots,
      sets: setSelectedSets,
      tiers: setSelectedTiers,
      rarity: setSelectedRarity,
      primaryStats: setSelectedPrimaryStats,
      secondaryStats: setSelectedSecondaryStats
    };

    const setter = setterMap[type];
    if (!setter) return;

    setter(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSlots([]);
    setSelectedSets([]);
    setSelectedTiers([]);
    setSelectedRarity([]);
    setSelectedPrimaryStats([]);
    setSelectedSecondaryStats([]);
    setActiveFilters(['all']);
    setSelectedCharacter('all');
  };

  useEffect(() => {
    let extractedMods = []

    // Check if we have the new API response structure
    if (playerData?.apiResponse?.mods) {
      extractedMods = playerData.apiResponse.mods.map(mod => {
        // Check if it's the new compact format (has 'd' instead of 'definitionId')
        if (mod.d !== undefined) {
          return decodeModData(mod);
        }
        // Old format - use as-is
        return {
          ...mod,
          characterName: mod.characterId.split(':')[0],
          // Map old evaluation format to new structure
          basicEvaluation: mod.evaluations?.basic || {},
          strictEvaluation: mod.evaluations?.strict || {}
        };
      });
    } else if (playerData?.rosterUnit) {
      // Original roster unit processing remains the same
      playerData.rosterUnit.forEach(unit => {
        if (unit.equippedStatMod && unit.equippedStatMod.length > 0) {
          unit.equippedStatMod.forEach(mod => {
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

    // Rest of the function remains the same...
    const uniqueCharacters = [...new Set(extractedMods.map(mod => mod.characterName))]
    .sort((a, b) => {
      // Find the display names from the mods
      const modA = extractedMods.find(m => m.characterName === a)
      const modB = extractedMods.find(m => m.characterName === b)
      const nameA = modA?.characterDisplayName || a
      const nameB = modB?.characterDisplayName || b
      return nameA.localeCompare(nameB)
    })
    setCharacterList(uniqueCharacters)

    setMods(extractedMods)
    setLoading(false)
  }, [playerData])

  if (loading) {
    return <div className="loading">Processing mods...</div>
  }

  // Enhanced filtering logic
  const filteredMods = mods.filter(mod => {
    // Character filter
    if (selectedCharacter !== 'all' && mod.characterName !== selectedCharacter) {
      return false
    }

    // New filters - if any are selected, mod must match at least one
    
    // Slot filter
    if (selectedSlots.length > 0) {
      const modSlot = mod.definitionId[2];
      if (!selectedSlots.includes(modSlot)) {
        return false;
      }
    }

    // Set filter
    if (selectedSets.length > 0) {
      const modSet = mod.definitionId[0];
      if (!selectedSets.includes(modSet)) {
        return false;
      }
    }

    // Tier filter
    if (selectedTiers.length > 0) {
      if (!selectedTiers.includes(mod.tier.toString())) {
        return false;
      }
    }

    // Rarity filter (dots)
    if (selectedRarity.length > 0) {
      const dots = parseInt(mod.definitionId[1]);
      const rarityKey = dots <= 4 ? '1-4' : dots.toString();
      if (!selectedRarity.includes(rarityKey)) {
        return false;
      }
    }

    // Primary stat filter
    if (selectedPrimaryStats.length > 0) {
      const primaryStatId = mod.primaryStat?.stat?.unitStatId?.toString();
      if (!selectedPrimaryStats.includes(primaryStatId)) {
        return false;
      }
    }

    // Secondary stat filter
    if (selectedSecondaryStats.length > 0) {
      const hasMatchingSecondary = mod.secondaryStat?.some(stat => 
        selectedSecondaryStats.includes(stat.stat.unitStatId.toString())
      );
      if (!hasMatchingSecondary) {
        return false;
      }
    }

    // Original recommendation filters
    if (activeFilters.includes('all')) return true

    // Check if mod is locked
    const isLocked = mod.locked || tempLockedMods.includes(mod.id);
    
    // If locked filter is active AND mod is locked, include it
    if (activeFilters.includes('locked') && isLocked) return true;

    // Evaluate the mod using the workflow
    const evaluation = isLocked 
      ? { verdict: 'keep' } 
      : evaluateModWithWorkflow(mod, evaluationMode);

    // Check if the mod's verdict matches any active filter
    return activeFilters.includes(evaluation.verdict);
  });

  // Debug logging
  if (window.location.hash === '#debug' && filteredMods.length > 0) {
    const now = Date.now();
    if (!window._lastDebugLog || now - window._lastDebugLog > 1000) {
      window._lastDebugLog = now;
      console.log('=== MOD SCORES DEBUG TABLE ===');
      console.table(
        filteredMods.slice(0, 50).map(mod => {
          const evaluation = evaluateModWithWorkflow(mod, evaluationMode);
          
          return {
            character: mod.characterName.split(':')[0],
            verdict: evaluation.verdict,
            totalScore: evaluation.score?.totalScore || 0,
            basePoints: evaluation.score?.basePoints || 0,
            synergyBonus: evaluation.score?.synergyBonus || 0,
            speed: evaluation.score?.speedValue || 0,
            offense: evaluation.score?.offenseValue || 0
          };
        })
      );
    }
  }

  // Calculate summary statistics
  const modStats = filteredMods.reduce((acc, mod) => {
    const isLocked = mod.locked || tempLockedMods.includes(mod.id);
    
    // Evaluate using workflow
    const evaluation = isLocked 
      ? { verdict: 'keep' } 
      : evaluateModWithWorkflow(mod, evaluationMode);
    
    const verdict = evaluation.verdict;
    acc[verdict] = (acc[verdict] || 0) + 1;
    return acc;
  }, {});

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

  // Check if any filters are active
  const hasActiveFilters = selectedSlots.length > 0 || selectedSets.length > 0 || 
    selectedTiers.length > 0 || selectedRarity.length > 0 || 
    selectedPrimaryStats.length > 0 || selectedSecondaryStats.length > 0 || 
    !activeFilters.includes('all') || selectedCharacter !== 'all';

  // Filter controls content (enhanced)
  const filterControls = (
    <>
      {/* Character Filter */}
      <div className="filter-group">
        <label>Character:</label>
        <select
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="all">All Characters</option>
          {characterList.map(charId => {
            const mod = mods.find(m => m.characterName === charId)
            const displayName = mod?.characterDisplayName || charId
            return (
              <option key={charId} value={charId}>
                {displayName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Evaluation Mode */}
      <div className="filter-group">
        <label>Evaluation Mode:</label>
        <select
          value={evaluationMode}
          onChange={(e) => onModeChange(e.target.value)}
          className="filter-dropdown"
        >
          {Object.entries(EVALUATION_WORKFLOWS).map(([key, workflow]) => (
            <option key={key} value={key}>
              {workflow.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recommendation Filters */}
      <div className="filter-group">
        <label>Recommendation:</label>
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

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <div className="filter-group">
          <button 
            className="clear-filters-btn"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* New Enhanced Filters */}
      <FilterSection
        title="Mod Slots"
        filters={FILTER_CONFIG.slots}
        selectedFilters={selectedSlots}
        onToggleFilter={handleFilterToggle}
        type="slots"
        atlasUrl={charactermodsAtlas}
      />

      <FilterSection
        title="Mod Sets"
        filters={FILTER_CONFIG.sets}
        selectedFilters={selectedSets}
        onToggleFilter={handleFilterToggle}
        type="sets"
        atlasUrl={miscAtlas}
      />

      <FilterSection
        title="Mod Tiers"
        filters={FILTER_CONFIG.tiers}
        selectedFilters={selectedTiers}
        onToggleFilter={handleFilterToggle}
        type="tiers"
      />

      <FilterSection
        title="Mod Rarity"
        filters={FILTER_CONFIG.rarity}
        selectedFilters={selectedRarity}
        onToggleFilter={handleFilterToggle}
        type="rarity"
      />

      <FilterSection
        title="Primary Stats"
        filters={FILTER_CONFIG.primaryStats}
        selectedFilters={selectedPrimaryStats}
        onToggleFilter={handleFilterToggle}
        type="primaryStats"
      />

      <FilterSection
        title="Secondary Stats"
        filters={FILTER_CONFIG.secondaryStats}
        selectedFilters={selectedSecondaryStats}
        onToggleFilter={handleFilterToggle}
        type="secondaryStats"
      />
    </>
  )

  return (
    <div className="mod-list-wrapper">
      {/* Mobile Filter Toggle Tab */}
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

      {/* Desktop Filter Bar / Mobile Header + Filter Panel */}
      {!isMobile && (
        <div className="filter-bar">
          <div className="filter-bar-content">
            <div className="filter-bar-header">
              <h1>Your Mods</h1>
              <p className="mod-count">
                Showing {filteredMods.length} of {mods.length} mods
                {hasActiveFilters && ` (filtered)`}
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
            {hasActiveFilters && ` (filtered)`}
          </p>
          {filteredMods.length > 0 && (
            <CollectionEfficiencyDisplay collectionStats={collectionStats} modStats={modStats} />
          )}
        </div>
      )}

      {/* Enhanced Filter Panel */}
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