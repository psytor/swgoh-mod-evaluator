import { useState, useEffect } from 'react'
import './ModList.css'
import ModCard from './ModCard'
import ModDetailModal from './ModDetailModal'
import { decodeModData } from '../utils/modDecoder'
import { evaluateModWithWorkflow } from '../utils/workflowEvaluator';
import { EVALUATION_WORKFLOWS } from '../config/evaluationWorkflows';
import charactermodsAtlas from '../assets/charactermods_datacard_atlas.png';
import miscAtlas from '../assets/misc_atlas.png';

// Import the constants we need
const MOD_SETS = {
  1: "Health", 2: "Offense", 3: "Defense", 4: "Speed",
  5: "Critical Chance", 6: "Critical Damage", 7: "Potency", 8: "Tenacity"
};

const MOD_SLOTS = {
  1: "Square", 2: "Arrow", 3: "Diamond",
  4: "Triangle", 5: "Circle", 6: "Cross"
};

const MOD_TIERS = {
  1: "Grey", 2: "Green", 3: "Blue", 4: "Purple", 5: "Gold"
};

const STAT_NAMES = {
  1: "Health", 5: "Speed", 16: "Critical Damage %", 17: "Potency %",
  18: "Tenacity %", 28: "Protection", 41: "Offense", 42: "Defense",
  48: "Offense %", 49: "Defense %", 52: "Accuracy %", 53: "Critical Chance %", 
  54: "Critical Avoidance %", 55: "Health %", 56: "Protection %"
};

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

const mistAtlasWidth = 2048;
const mistAtlasHeight = 2048;


// Primary stats available by slot
const PRIMARY_STATS_BY_SLOT = {
  "Square": [48], // Always Offense %
  "Arrow": [5, 52, 54, 55, 56, 48, 49], // Speed, Accuracy %, Crit Avoidance %, Health %, Protection %, Offense %, Defense %
  "Diamond": [49], // Always Defense %
  "Triangle": [53, 16, 55, 56, 48, 49], // Crit Chance %, Crit Damage %, Health %, Protection %, Offense %, Defense %
  "Circle": [55, 56], // Health %, Protection %
  "Cross": [18, 17, 55, 56, 48, 49] // Tenacity %, Potency %, Health %, Protection %, Offense %, Defense %
};

const datacardAtlasWidth = 1024;
const atacardAtlasHeight = 512;

// Component for sprite-based slot filter
function SlotFilterSprite({ slot, isActive, onClick }) {
  const sprite = MOD_SHAPE_SPRITES[slot];
  if (!sprite) return null;

  return (
    <div 
      className={`sprite-filter-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div 
        className="filter-sprite-shape"
        style={{
          width: '40px',
          height: '40px',
          backgroundImage: `url(${charactermodsAtlas})`,
          backgroundPosition: `-${sprite.x}px -${sprite.y}px`,
          backgroundSize: `${datacardAtlasWidth}px ${atacardAtlasHeight}px`,
          transform: `scale(${40 / sprite.w})`,
          transformOrigin: 'center'
        }}
      />
      <span>{slot}</span>
    </div>
  );
}

// Component for sprite-based set filter
function SetFilterSprite({ set, isActive, onClick }) {
  const sprite = MOD_SET_SPRITES[set];
  if (!sprite) return null;

  return (
    <div 
      className={`sprite-filter-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div 
        className="filter-sprite-set"
        style={{
          width: '40px',
          height: '40px',
          backgroundImage: `url(${miscAtlas})`,
          backgroundPosition: `-${sprite.x}px -${sprite.y}px`,
          backgroundSize: `${mistAtlasWidth}px ${atacardAtlasHeight}px`,
          transform: `scale(${40 / sprite.w})`,
          transformOrigin: 'center'
        }}
      />
      <span>{set.split(' ').map(word => word.charAt(0)).join('')}</span>
    </div>
  );
}

// Enhanced ModList component
function ModList({ playerData, evaluationMode, onModeChange }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Enhanced filter state
  const [activeFilters, setActiveFilters] = useState({
    slots: [],          // ['Square', 'Arrow', ...]
    sets: [],           // ['Speed', 'Offense', ...]
    tiers: [],          // [1, 2, 3, 4, 5]
    rarities: [],       // ['1-4', '5', '6']
    primaryStats: [],   // [5, 48, ...] (stat IDs)
    secondaryStats: [], // [5, 41, ...] (stat IDs)
    character: 'all',
    recommendations: ['all'],
    locked: false
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
    setActiveFilters(prev => ({
      ...prev,
      slots: prev.slots.includes(slot) 
        ? prev.slots.filter(s => s !== slot)
        : [...prev.slots, slot]
    }));
  };

  const toggleSetFilter = (set) => {
    setActiveFilters(prev => ({
      ...prev,
      sets: prev.sets.includes(set) 
        ? prev.sets.filter(s => s !== set)
        : [...prev.sets, set]
    }));
  };

  const toggleTierFilter = (tier) => {
    setActiveFilters(prev => ({
      ...prev,
      tiers: prev.tiers.includes(tier) 
        ? prev.tiers.filter(t => t !== tier)
        : [...prev.tiers, tier]
    }));
  };

  const toggleRarityFilter = (rarity) => {
    setActiveFilters(prev => ({
      ...prev,
      rarities: prev.rarities.includes(rarity) 
        ? prev.rarities.filter(r => r !== rarity)
        : [...prev.rarities, rarity]
    }));
  };

  const togglePrimaryStatFilter = (statId) => {
    setActiveFilters(prev => ({
      ...prev,
      primaryStats: prev.primaryStats.includes(statId) 
        ? prev.primaryStats.filter(s => s !== statId)
        : [...prev.primaryStats, statId]
    }));
  };

  const toggleSecondaryStatFilter = (statId) => {
    setActiveFilters(prev => ({
      ...prev,
      secondaryStats: prev.secondaryStats.includes(statId) 
        ? prev.secondaryStats.filter(s => s !== statId)
        : [...prev.secondaryStats, statId]
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      slots: [],
      sets: [],
      tiers: [],
      rarities: [],
      primaryStats: [],
      secondaryStats: [],
      character: 'all',
      recommendations: ['all'],
      locked: false
    });
  };

  // Extract and process mods
  useEffect(() => {
    let extractedMods = []

    if (playerData?.apiResponse?.mods) {
      extractedMods = playerData.apiResponse.mods.map(mod => {
        if (mod.d !== undefined) {
          return decodeModData(mod);
        }
        return mod;
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

    setMods(extractedMods)
    setLoading(false)
  }, [playerData])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return <div className="loading">Processing mods...</div>
  }

  // Enhanced filter function
  const filteredMods = mods.filter(mod => {
    // Slots filter
    if (activeFilters.slots.length > 0) {
      const modSlot = MOD_SLOTS[mod.definitionId[2]];
      if (!activeFilters.slots.includes(modSlot)) return false;
    }
    
    // Sets filter
    if (activeFilters.sets.length > 0) {
      const modSet = MOD_SETS[mod.definitionId[0]];
      if (!activeFilters.sets.includes(modSet)) return false;
    }
    
    // Tiers filter
    if (activeFilters.tiers.length > 0) {
      if (!activeFilters.tiers.includes(mod.tier)) return false;
    }
    
    // Rarity filter
    if (activeFilters.rarities.length > 0) {
      const dots = parseInt(mod.definitionId[1]);
      const rarityGroup = dots <= 4 ? '1-4' : dots.toString();
      if (!activeFilters.rarities.includes(rarityGroup)) return false;
    }
    
    // Primary stats filter
    if (activeFilters.primaryStats.length > 0) {
      const primaryStatId = mod.primaryStat?.stat?.unitStatId;
      if (!activeFilters.primaryStats.includes(primaryStatId)) return false;
    }
    
    // Secondary stats filter
    if (activeFilters.secondaryStats.length > 0) {
      const modSecondaryIds = mod.secondaryStat?.map(s => s.stat.unitStatId) || [];
      const hasAnySecondary = activeFilters.secondaryStats.some(statId => 
        modSecondaryIds.includes(statId)
      );
      if (!hasAnySecondary) return false;
    }

    // Character filter
    if (activeFilters.character !== 'all' && mod.characterName !== activeFilters.character) {
      return false;
    }

    // Recommendation filter
    if (!activeFilters.recommendations.includes('all')) {
      const isLocked = mod.locked || tempLockedMods.includes(mod.id);
      if (activeFilters.locked && !isLocked) return false;
      
      const evaluation = isLocked 
        ? { verdict: 'keep' } 
        : evaluateModWithWorkflow(mod, evaluationMode);
      
      if (!activeFilters.recommendations.includes(evaluation.verdict)) return false;
    }

    return true;
  });

  // Get active filter count
  const activeFilterCount = 
    activeFilters.slots.length +
    activeFilters.sets.length +
    activeFilters.tiers.length +
    activeFilters.rarities.length +
    activeFilters.primaryStats.length +
    activeFilters.secondaryStats.length +
    (activeFilters.character !== 'all' ? 1 : 0) +
    (activeFilters.recommendations.length > 0 && !activeFilters.recommendations.includes('all') ? 1 : 0);

  return (
    <div className="mod-list-wrapper">
      {/* Filter Toggle Tab */}
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

      {/* Header */}
      <div className="mod-list-header">
        <h1>Your Mods</h1>
        <p className="mod-count">
          Showing {filteredMods.length} of {mods.length} mods
          {activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}
        </p>
      </div>

      {/* Enhanced Filter Panel */}
      <div className={`filter-panel enhanced ${filterPanelOpen ? 'open' : ''}`}>
        <div className="filter-panel-content">
          <button
            className="filter-panel-close"
            onClick={() => setFilterPanelOpen(false)}
          >
            ×
          </button>

          <div className="filter-panel-header">
            <h2>Filters</h2>
            <button 
              className="clear-all-filters"
              onClick={clearAllFilters}
              disabled={activeFilterCount === 0}
            >
              Clear All
            </button>
          </div>

          {/* Slot Filter */}
          <div className="filter-section">
            <h3>Slots</h3>
            <div className="filter-sprites-grid">
              {Object.entries(MOD_SLOTS).map(([key, name]) => (
                <SlotFilterSprite
                  key={key}
                  slot={name}
                  isActive={activeFilters.slots.includes(name)}
                  onClick={() => toggleSlotFilter(name)}
                />
              ))}
            </div>
          </div>

          {/* Set Filter */}
          <div className="filter-section">
            <h3>Sets</h3>
            <div className="filter-sprites-grid sets">
              {Object.entries(MOD_SETS).map(([key, name]) => (
                <SetFilterSprite
                  key={key}
                  set={name}
                  isActive={activeFilters.sets.includes(name)}
                  onClick={() => toggleSetFilter(name)}
                />
              ))}
            </div>
          </div>

          {/* Tier Filter */}
          <div className="filter-section">
            <h3>Tier</h3>
            <div className="filter-buttons-row">
              {Object.entries(MOD_TIERS).map(([tier, name]) => (
                <button
                  key={tier}
                  className={`filter-button tier-${name.toLowerCase()} ${
                    activeFilters.tiers.includes(parseInt(tier)) ? 'active' : ''
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
            <h3>Rarity</h3>
            <div className="filter-buttons-row">
              <button
                className={`filter-button rarity ${
                  activeFilters.rarities.includes('1-4') ? 'active' : ''
                }`}
                onClick={() => toggleRarityFilter('1-4')}
              >
                <span className="dots">●●●●</span>
                <span>1-4 Dots</span>
              </button>
              <button
                className={`filter-button rarity ${
                  activeFilters.rarities.includes('5') ? 'active' : ''
                }`}
                onClick={() => toggleRarityFilter('5')}
              >
                <span className="dots">●●●●●</span>
                <span>5 Dots</span>
              </button>
              <button
                className={`filter-button rarity ${
                  activeFilters.rarities.includes('6') ? 'active' : ''
                }`}
                onClick={() => toggleRarityFilter('6')}
              >
                <span className="dots">●●●●●●</span>
                <span>6 Dots</span>
              </button>
            </div>
          </div>

          {/* Secondary Stats Filter */}
          <div className="filter-section">
            <h3>Secondary Stats</h3>
            <div className="stat-filter-grid">
              {Object.entries(STAT_NAMES).map(([id, name]) => (
                <button
                  key={id}
                  className={`stat-filter-chip ${
                    activeFilters.secondaryStats.includes(parseInt(id)) ? 'active' : ''
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

      {/* Mod Grid */}
      <div className={`mod-list-container ${isMobile ? 'mobile' : ''}`}>
        <div className="mod-grid">
          {filteredMods.map((mod, index) => (
            <ModCard
              key={mod.id || index}
              mod={mod}
              evaluationMode={evaluationMode}
              isTempLocked={tempLockedMods.includes(mod.id)}
              onToggleTempLock={(modId) => {
                setTempLockedMods(prev => {
                  const newLocks = prev.includes(modId)
                    ? prev.filter(id => id !== modId)
                    : [...prev, modId]
                  localStorage.setItem('swgoh_temp_locked_mods', JSON.stringify(newLocks))
                  return newLocks
                })
              }}
              onClick={(mod) => {
                setSelectedMod(mod)
                setIsModalOpen(true)
              }}
            />
          ))}
        </div>
      </div>
      
      <ModDetailModal 
        mod={selectedMod}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTimeout(() => setSelectedMod(null), 300)
        }}
        evaluationMode={evaluationMode}
      />
    </div>
  )
}

export default ModList