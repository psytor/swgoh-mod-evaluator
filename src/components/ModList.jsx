import { useState, useEffect } from 'react'
import './ModList.css'
import ModCard from './ModCard'
import ModDetailModal from './ModDetailModal'
import { decodeModData } from '../utils/modDecoder'
import { evaluateModWithWorkflow } from '../utils/workflowEvaluator';
import { EVALUATION_WORKFLOWS } from '../config/evaluationWorkflows';
import charactermodsAtlas from '../assets/charactermods_datacard_atlas.png';
import miscAtlas from '../assets/misc_atlas.png';

// Import the constants from ModCard
import { MOD_SETS, MOD_SLOTS, MOD_TIERS, STAT_NAMES } from './ModCard';

// Sprite data for filter display
const MOD_SHAPE_SPRITES = {
  "Square":   { x: 696, y: 117, w: 79, h: 77 },
  "Arrow":    { x: 696, y: 195, w: 79, h: 77 },
  "Diamond":  { x: 696, y: 433, w: 79, h: 79 },
  "Triangle": { x: 854, y: 212, w: 78, h: 64 },
  "Circle":   { x: 775, y: 354, w: 79, h: 78 },
  "Cross":    { x: 729, y: 37,  w: 76, h: 79 }
};

const MOD_SET_SPRITES = {
  "Critical Chance": { x: 1265, y: 358, w: 120, h: 120 },
  "Critical Damage": { x: 1195, y: 992, w: 120, h: 120 },
  "Defense": { x: 1250, y: 1255, w: 120, h: 120 },
  "Health": { x: 1278, y: 1128, w: 120, h: 120 },
  "Offense": { x: 1408, y: 1126, w: 120, h: 120 },
  "Potency": { x: 1143, y: 1117, w: 120, h: 120 },
  "Speed": { x: 1107, y: 747, w: 120, h: 120 },
  "Tenacity": { x: 1288, y: 1385, w: 120, h: 120 }
};

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

function ModList({ playerData, evaluationMode, onModeChange }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState('all')
  const [characterList, setCharacterList] = useState([])
  const [activeFilters, setActiveFilters] = useState(['all'])
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Enhanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    slots: [],          // ['Square', 'Arrow', ...]
    sets: [],           // ['Speed', 'Offense', ...]
    tiers: [],          // [1, 2, 3, 4, 5]
    rarities: [],       // ['1-4', '5', '6']
    primaryStats: [],   // [5, 48, ...] (stat IDs)
    secondaryStats: [], // [5, 41, ...] (stat IDs)
  });

  const [tempLockedMods, setTempLockedMods] = useState(() => {
    const saved = localStorage.getItem('swgoh_temp_locked_mods')
    return saved ? JSON.parse(saved) : []
  })

  // Modal state
  const [selectedMod, setSelectedMod] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter toggle functions
  const toggleSlotFilter = (slot) => {
    setAdvancedFilters(prev => ({
      ...prev,
      slots: prev.slots.includes(slot) 
        ? prev.slots.filter(s => s !== slot)
        : [...prev.slots, slot]
    }));
  };

  const toggleSetFilter = (set) => {
    setAdvancedFilters(prev => ({
      ...prev,
      sets: prev.sets.includes(set) 
        ? prev.sets.filter(s => s !== set)
        : [...prev.sets, set]
    }));
  };

  const toggleTierFilter = (tier) => {
    setAdvancedFilters(prev => ({
      ...prev,
      tiers: prev.tiers.includes(tier) 
        ? prev.tiers.filter(t => t !== tier)
        : [...prev.tiers, tier]
    }));
  };

  const toggleRarityFilter = (rarity) => {
    setAdvancedFilters(prev => ({
      ...prev,
      rarities: prev.rarities.includes(rarity) 
        ? prev.rarities.filter(r => r !== rarity)
        : [...prev.rarities, rarity]
    }));
  };

  const toggleSecondaryStatFilter = (statId) => {
    setAdvancedFilters(prev => ({
      ...prev,
      secondaryStats: prev.secondaryStats.includes(statId) 
        ? prev.secondaryStats.filter(s => s !== statId)
        : [...prev.secondaryStats, statId]
    }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      slots: [],
      sets: [],
      tiers: [],
      rarities: [],
      primaryStats: [],
      secondaryStats: [],
    });
  };

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
  }, [filterPanelOpen])

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
    let extractedMods = []

    if (playerData?.apiResponse?.mods) {
      extractedMods = playerData.apiResponse.mods.map(mod => {
        if (mod.d !== undefined) {
          return decodeModData(mod);
        }
        return {
          ...mod,
          characterName: mod.characterId.split(':')[0],
          basicEvaluation: mod.evaluations?.basic || {},
          strictEvaluation: mod.evaluations?.strict || {}
        };
      });
    } else if (playerData?.rosterUnit) {
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

    const uniqueCharacters = [...new Set(extractedMods.map(mod => mod.characterName))]
    .sort((a, b) => {
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

  // Filter mods based on all filters
  const filteredMods = mods.filter(mod => {
    // Character filter
    if (selectedCharacter !== 'all' && mod.characterName !== selectedCharacter) {
      return false
    }

    // Advanced filters
    // Slots filter
    if (advancedFilters.slots.length > 0) {
      const modSlot = MOD_SLOTS[mod.definitionId[2]];
      if (!advancedFilters.slots.includes(modSlot)) return false;
    }
    
    // Sets filter
    if (advancedFilters.sets.length > 0) {
      const modSet = MOD_SETS[mod.definitionId[0]];
      if (!advancedFilters.sets.includes(modSet)) return false;
    }
    
    // Tiers filter
    if (advancedFilters.tiers.length > 0) {
      if (!advancedFilters.tiers.includes(mod.tier)) return false;
    }
    
    // Rarity filter
    if (advancedFilters.rarities.length > 0) {
      const dots = parseInt(mod.definitionId[1]);
      const rarityGroup = dots <= 4 ? '1-4' : dots.toString();
      if (!advancedFilters.rarities.includes(rarityGroup)) return false;
    }

    if (advancedFilters.primaryStats.length > 0) {
      const primaryStatId = mod.primaryStat?.stat?.unitStatId;
      if (!advancedFilters.primaryStats.includes(primaryStatId)) return false;
    }
    
    // Secondary stats filter
    if (advancedFilters.secondaryStats.length > 0) {
      const modSecondaryIds = mod.secondaryStat?.map(s => s.stat.unitStatId) || [];
      const hasAnySecondary = advancedFilters.secondaryStats.some(statId => 
        modSecondaryIds.includes(statId)
      );
      if (!hasAnySecondary) return false;
    }

    // If "all" is selected, show everything
    if (activeFilters.includes('all')) return true

    // Check if mod is locked
    const isLocked = mod.locked || tempLockedMods.includes(mod.id);
    
    // If locked filter is active AND mod is locked, include it
    if (activeFilters.includes('locked') && isLocked) return true;

    // Evaluate the mod
    const evaluation = isLocked 
      ? { verdict: 'keep' } 
      : evaluateModWithWorkflow(mod, evaluationMode);

    // Check if the mod's verdict matches any active filter
    return activeFilters.includes(evaluation.verdict);
  });

  // Calculate summary statistics
  const modStats = filteredMods.reduce((acc, mod) => {
    const isLocked = mod.locked || tempLockedMods.includes(mod.id);
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

      localStorage.setItem('swgoh_temp_locked_mods', JSON.stringify(newLocks))
      return newLocks
    })
  }

  const togglePrimaryStatFilter = (statId) => {
    setAdvancedFilters(prev => ({
      ...prev,
      primaryStats: prev.primaryStats.includes(statId) 
        ? prev.primaryStats.filter(s => s !== statId)
        : [...prev.primaryStats, statId]
    }));
  };

  // Calculate active filter count
  const activeFilterCount = 
    advancedFilters.slots.length +
    advancedFilters.sets.length +
    advancedFilters.tiers.length +
    advancedFilters.rarities.length +
    advancedFilters.primaryStats.length +
    advancedFilters.secondaryStats.length +
    (selectedCharacter !== 'all' ? 1 : 0) +
    (activeFilters.length > 0 && !activeFilters.includes('all') ? 1 : 0);

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
        {activeFilterCount > 0 && (
          <div className="filter-count-badge">{activeFilterCount}</div>
        )}
      </div>

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

      {/* Enhanced Filter Panel */}
      <div className={`filter-panel enhanced ${filterPanelOpen ? 'open' : ''}`}>
        <div className="filter-panel-content">
          <button
            className="filter-panel-close"
            onClick={() => setFilterPanelOpen(false)}
          >
            ×
          </button>

          <h2 className="filter-panel-title">Filters</h2>

          <div className="filter-controls-panel">
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

            {/* Evaluation Mode Filter */}
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
              <label>Recommendations:</label>
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

            {/* Advanced Filters Header */}
            <div className="advanced-filters-header">
              <h3>Advanced Filters</h3>
              <button 
                className="clear-advanced-btn"
                onClick={clearAdvancedFilters}
                disabled={activeFilterCount === 0}
              >
                Clear
              </button>
            </div>

            {/* Slot Filter with Sprites */}
            <div className="filter-section">
              <h4>Slots</h4>
              <div className="filter-sprites-grid">
                {Object.entries(MOD_SLOTS).map(([key, name]) => {
                  const sprite = MOD_SHAPE_SPRITES[name];
                  if (!sprite) return null;
                  
                  // Calculate scale to fit in 40x40
                  const scale = Math.min(30 / sprite.w, 30 / sprite.h);
                  const scaledWidth = sprite.w * scale;
                  const scaledHeight = sprite.h * scale;
                  
                  return (
                    <div
                      key={key}
                      className={`sprite-filter-item ${advancedFilters.slots.includes(name) ? 'active' : ''}`}
                      onClick={() => toggleSlotFilter(name)}
                    >
                      <div className="filter-sprite-container">
                        <div
                          className="filter-sprite-shape"
                          style={{
                            width: `${scaledWidth}px`,
                            height: `${scaledHeight}px`,
                            backgroundImage: `url(${charactermodsAtlas})`,
                            backgroundPosition: `-${sprite.x * scale}px -${sprite.y * scale}px`,
                            backgroundSize: `${1024 * scale}px auto`,
                            imageRendering: 'pixelated'
                          }}
                        />
                      </div>
                      <span>{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Set Filter with Sprites */}
            <div className="filter-section">
              <h4>Sets</h4>
              <div className="filter-sprites-grid sets">
                {Object.entries(MOD_SETS).map(([key, name]) => {
                  const sprite = MOD_SET_SPRITES[name];
                  if (!sprite) return null;
                  
                  // Scale from 120x120 to 40x40
                  const scale = Math.min(30 / sprite.w, 120 / sprite.h);
                  const scaledWidth = sprite.w * scale;
                  const scaledHeight = sprite.h * scale;
                  
                  return (
                    <div
                      key={key}
                      className={`sprite-filter-item ${advancedFilters.sets.includes(name) ? 'active' : ''}`}
                      onClick={() => toggleSetFilter(name)}
                    >
                      <div className="filter-sprite-container">
                        <div
                          className="filter-sprite-set"
                          style={{
                            width: `${scaledWidth}px`,
                            height: `${scaledHeight}px`,
                            backgroundImage: `url(${miscAtlas})`,
                            backgroundPosition: `-${sprite.x * scale}px -${sprite.y * scale}px`,
                            backgroundSize: `${2048 * scale}px auto`,
                            imageRendering: 'pixelated'
                          }}
                        />
                      </div>
                      <span>{name.split(' ').map(word => word.charAt(0)).join('')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tier Filter */}
            <div className="filter-section">
              <h4>Tier</h4>
              <div className="filter-buttons-row">
                {Object.entries(MOD_TIERS).map(([tier, name]) => (
                  <button
                    key={tier}
                    className={`filter-button tier-${name.toLowerCase()} ${
                      advancedFilters.tiers.includes(parseInt(tier)) ? 'active' : ''
                    }`}
                    onClick={() => toggleTierFilter(parseInt(tier))}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div className="filter-section">
              <h4>Rarity (Dots)</h4>
              <div className="filter-buttons-row">
                <button
                  className={`filter-button rarity ${
                    advancedFilters.rarities.includes('1-4') ? 'active' : ''
                  }`}
                  onClick={() => toggleRarityFilter('1-4')}
                >
                  <span className="dots">●●●●</span>
                  <span>1-4</span>
                </button>
                <button
                  className={`filter-button rarity ${
                    advancedFilters.rarities.includes('5') ? 'active' : ''
                  }`}
                  onClick={() => toggleRarityFilter('5')}
                >
                  <span className="dots">●●●●●</span>
                  <span>5</span>
                </button>
                <button
                  className={`filter-button rarity ${
                    advancedFilters.rarities.includes('6') ? 'active' : ''
                  }`}
                  onClick={() => toggleRarityFilter('6')}
                >
                  <span className="dots">●●●●●●</span>
                  <span>6</span>
                </button>
              </div>
            </div>

            {/* Primary Stats Filter */}
            <div className="filter-section">
              <h4>Primary Stats</h4>
              <div className="stat-filter-grid">
                {/* You'll need to show only stats that can be primary stats */}
                {[5, 48, 49, 52, 53, 54, 55, 56, 16, 17, 18].map(statId => (
                  <button
                    key={statId}
                    className={`stat-filter-chip ${
                      advancedFilters.primaryStats.includes(statId) ? 'active' : ''
                    }`}
                    onClick={() => togglePrimaryStatFilter(statId)}
                  >
                    {STAT_NAMES[statId]}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Stats Filter */}
            <div className="filter-section">
              <h4>Secondary Stats</h4>
              <div className="stat-filter-grid">
                {Object.entries(STAT_NAMES).map(([id, name]) => (
                  <button
                    key={id}
                    className={`stat-filter-chip ${
                      advancedFilters.secondaryStats.includes(parseInt(id)) ? 'active' : ''
                    }`}
                    onClick={() => toggleSecondaryStatFilter(parseInt(id))}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
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