import './ModCard.css';
import charactermodsAtlas from '../assets/charactermods_datacard_atlas.png';
import miscAtlas from '../assets/misc_atlas.png';
import characterNames from '../assets/charname.json';

// Mappings from the API documentation
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
  48: "Offense %", 49: "Defense %", 52: "Accuracy %", 53: "Critical Chance %", 54: "Critical Avoidance %",
  55: "Health %", 56: "Protection %"
};

// Divisor values for decoding API bounds
const STAT_BOUND_DIVISORS = {
  1: 100000,   // Health (flat)
  5: 100000,   // Speed (flat)
  16: 1000,    // Critical Damage % (percentage)
  17: 1000,    // Potency % (percentage)
  18: 1000,    // Tenacity % (percentage)
  28: 100000,  // Protection (flat)
  41: 100000,  // Offense (flat)
  42: 100000,  // Defense (flat)
  48: 1000,    // Offense % (percentage)
  49: 1000,    // Defense % (percentage)
  52: 1000,    // Accuracy %
  53: 1000,    // Critical Chance % (percentage)
  54: 1000,    // Critical Avoidance % (percentage)
  55: 1000,    // Health % (percentage)
  56: 1000     // Protection % (percentage)
};

// Fallback values if API data is missing (these match your documentation)
const STAT_ROLL_RANGES = {
  1: { min: 270, max: 540 },      // Health
  5: { min: 3, max: 6 },          // Speed
  16: { min: 1.175, max: 2.35 },  // Critical Damage %
  17: { min: 1.5, max: 3 },       // Potency %
  18: { min: 1.5, max: 3 },       // Tenacity %
  28: { min: 460, max: 920 },     // Protection
  41: { min: 25, max: 50 },       // Offense
  42: { min: 8, max: 16 },        // Defense
  48: { min: 0.85, max: 1.7 },    // Offense %
  49: { min: 2, max: 4 },         // Defense %
  53: { min: 1.175, max: 2.35 },  // Critical Chance %
  55: { min: 1, max: 2 },         // Health %
  56: { min: 1.5, max: 3 }        // Protection %
};

// 6-dot mods use same values according to your documentation
const STAT_ROLL_RANGES_6DOT = STAT_ROLL_RANGES;

function getCalibrationInfo(mod) {
  const dots = parseInt(mod.definitionId[1]);
  if (dots !== 6) return null;
  
  const tier = mod.tier;
  const rerolledCount = mod.rerolledCount || 0;
  
  // Calculate total calibrations based on tier
  const totalCalibrations = {
    1: 2, // Grey (6-E)
    2: 3, // Green (6-D)
    3: 4, // Blue (6-C)
    4: 5, // Purple (6-B)
    5: 6  // Gold (6-A)
  };
  
  const total = totalCalibrations[tier] || 0;
  const remaining = Math.max(0, total - rerolledCount);
  
  return { remaining, total };
}

// Speed-Only Evaluation Logic
function getSpeedRecommendation(mod, evaluationMode, isLocked = false) {

  const tier = mod.tier;
  const level = mod.level;
  const dots = parseInt(mod.definitionId[1]);
  
  // Check if this is an Arrow with Speed Primary
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const slotTypeKey = mod.definitionId[2];

  if (isLocked) {
    return {
      type: 'keep',
      text: 'Locked',
      className: 'keep'
    }
  }
  
  if (slotTypeKey === '2' && primaryStatId === 5) { // Arrow slot with Speed primary
    // 6-dot Gold mods are already maxed
    if (dots === 6 && tier === 5) {
      return {
        type: 'keep',
        text: 'Keep',
        className: 'keep'
      };
    }
    
    if (level === 15) {
      return {
        type: 'slice',
        text: 'Slice',
        className: 'slice'
      };
    } else {
      return {
        type: 'keep',
        text: 'Keep',
        className: 'keep'
      };
    }
  }

  // Find speed in secondary stats
  let speedValue = 0;
  let hasSpeed = false;
  
  if (mod.secondaryStat) {
    const speedStat = mod.secondaryStat.find(stat => stat.stat.unitStatId === 5);
    if (speedStat) {
      hasSpeed = true;
      speedValue = Math.floor(parseInt(speedStat.stat.statValueDecimal) / 10000);
    }
  }
  
  // Determine if we can fully evaluate the mod
  const canFullyEvaluate = canModBeFullyEvaluated(tier, level);
  
  // If we can't fully evaluate yet, tell them to level up
  if (!canFullyEvaluate) {
    return {
      type: 'level',
      text: `Level to ${getNextLevelTarget(tier, level)}`,
      className: 'level'
    };
  }
  
  // At this point, we can fully evaluate (level 12+)
  // If no speed at all, it's a sell
  if (!hasSpeed) {
    return {
      type: 'sell',
      text: 'Sell',
      className: 'sell'
    };
  }
  
  // Check thresholds based on tier and mode
  const keepThreshold = getKeepThreshold(tier, evaluationMode);
  const sliceThreshold = getSliceThreshold(tier, evaluationMode);
  
  // If the mod doesn't meet keep threshold, sell it
  if (speedValue < keepThreshold) {
    return {
      type: 'sell',
      text: 'Sell',
      className: 'sell'
    };
  }
  
  // If mod is level 15 and meets slice threshold, recommend slicing
  // UNLESS it's a 6-dot Gold mod (already maxed)
  if (level === 15 && speedValue >= sliceThreshold && !(dots === 6 && tier === 5)) {
    return {
      type: 'slice',
      text: 'Slice',
      className: 'slice'
    };
  }
  
  // Otherwise, it's a keeper
  return {
    type: 'keep',
    text: 'Keep',
    className: 'keep'
  };
}

function canModBeFullyEvaluated(tier, level) {
  // We need level 12 to see all rolls
  return level >= 12;
}

function getNextLevelTarget(tier, level) {
  // Grey: straight to 12
  if (tier === 1) return 12;
  
  // For others, we need to see all secondaries first
  const neededReveals = 4 - (tier - 1); // How many reveals we need
  
  if (neededReveals > 0) {
    // Need to reveal secondaries
    if (level < 3 && neededReveals >= 4) return 3;
    if (level < 6 && neededReveals >= 3) return 6;
    if (level < 9 && neededReveals >= 2) return 9;
    if (level < 12 && neededReveals >= 1) return 12;
  }
  
  // If all secondaries visible but not level 12, go to 12
  return 12;
}

function getKeepThreshold(tier, mode) {
  if (mode === 'basic') {
    // Basic mode thresholds
    switch(tier) {
      case 1: // Grey
      case 2: // Green
        return 0; // Any speed
      case 3: // Blue
      case 4: // Purple
        return 6;
      case 5: // Gold
        return 8;
      default:
        return 0;
    }
  } else {
    // Strict mode thresholds
    switch(tier) {
      case 1: // Grey
        return 0; // Any speed
      case 2: // Green
        return 5;
      case 3: // Blue
        return 8;
      case 4: // Purple
        return 10;
      case 5: // Gold
        return 10;
      default:
        return 0;
    }
  }
}

function getSliceThreshold(tier, mode) {
  if (mode === 'basic') {
    // Basic slicing thresholds
    switch(tier) {
      case 1: // Grey
        return 0; // Any speed
      case 2: // Green
        return 5;
      case 3: // Blue
        return 8;
      case 4: // Purple
        return 10;
      default:
        return 0;
    }
  } else {
    // Strict slicing thresholds
    switch(tier) {
      case 1: // Grey
        return 0; // Any speed
      case 2: // Green
        return 8;
      case 3: // Blue
        return 12;
      case 4: // Purple
        return 15;
      default:
        return 0;
    }
  }
}

// Calculate efficiency for a single secondary stat using position-based approach
function calculateStatEfficiency(stat, is6Dot = false) {
  const statId = stat.stat.unitStatId;
  const statValue = parseInt(stat.stat.statValueDecimal) / 10000;
  const rolls = stat.statRolls || 1;
  
  // Extract bounds from the stat data if available
  let min, max;
  if (stat.statRollerBoundsMin && stat.statRollerBoundsMax) {
    const divisor = STAT_BOUND_DIVISORS[statId] || 100000;
    min = parseInt(stat.statRollerBoundsMin) / divisor;
    max = parseInt(stat.statRollerBoundsMax) / divisor;
  } else {
    // Fallback to hardcoded values if API data is missing
    const ranges = is6Dot ? STAT_ROLL_RANGES_6DOT : STAT_ROLL_RANGES;
    const range = ranges[statId];
    if (!range) return 0;
    min = range.min;
    max = range.max;
  }
  
  if (rolls === 0) return 0;
  
  // For percentage stats, ensure we're working with the right scale
  let actualValue = statValue;
  if ([16, 17, 18, 48, 49, 52, 53, 54, 55, 56].includes(statId)) {
    actualValue = statValue * 100;
  }
  
  // Calculate the average roll value
  const avgRollValue = actualValue / rolls;
  
  // Use continuous positioning for ALL stats (including Speed)
  const positions = 10; // Reasonable granularity for continuous stats
  const rawEfficiency = (avgRollValue - min) / (max - min);
  const adjustedPosition = 1 + rawEfficiency * (positions - 1);
  return (adjustedPosition / positions) * 100;
}

// Calculate overall mod efficiency (average of all secondaries)
function calculateModEfficiency(secondaryStats, is6Dot = false) {
  if (!secondaryStats || secondaryStats.length === 0) return 0;
  
  let totalEfficiency = 0;
  let statCount = 0;
  
  secondaryStats.forEach(stat => {
    const efficiency = calculateStatEfficiency(stat, is6Dot);
    if (efficiency >= 0) { // Include 0% efficiency in the average
      totalEfficiency += efficiency;
      statCount++;
    }
  });
  
  // Return average efficiency
  return statCount > 0 ? totalEfficiency / statCount : 0;
}

// Sprite data for 5-Dot Mod Shapes (Main and Inner layers)
const MOD_SHAPE_SPRITES_5DOT = {
  "Square":   { "Main": { "x": 696, "y": 117, "w": 79, "h": 77 }, "Inner": { "x": 647, "y": 31, "w": 80, "h": 80 } },
  "Arrow":    { "Main": { "x": 696, "y": 195, "w": 79, "h": 77 }, "Inner": { "x": 566, "y": 31, "w": 80, "h": 80 } },
  "Diamond":  { "Main": { "x": 696, "y": 433, "w": 79, "h": 79 }, "Inner": { "x": 161, "y": 31, "w": 80, "h": 80 } },
  "Triangle": { "Main": { "x": 854, "y": 212, "w": 78, "h": 64 }, "Inner": { "x": 851, "y": 130, "w": 81, "h": 67 } },
  "Circle":   { "Main": { "x": 775, "y": 354, "w": 79, "h": 78 }, "Inner": { "x": 404, "y": 31, "w": 80, "h": 80 } },
  "Cross":    { "Main": { "x": 729, "y": 37,  "w": 76, "h": 79 }, "Inner": { "x": 696, "y": 352, "w": 78, "h": 80 } }
};

// Sprite data for 6-Dot Mod Shapes (6 Dots frame and Inner layer)
const MOD_SHAPE_SPRITES_6DOT = {
  "Square":   { "Main": { "x": 855, "y": 278, "w": 78, "h": 75 }, "Inner": { "x": 647, "y": 31, "w": 80, "h": 80 } },
  "Arrow":    { "Main": { "x": 776, "y": 198, "w": 77, "h": 76 }, "Inner": { "x": 566, "y": 31, "w": 80, "h": 80 } },
  "Diamond":  { "Main": { "x": 777, "y": 434, "w": 77, "h": 78 }, "Inner": { "x": 161, "y": 31, "w": 80, "h": 80 } },
  "Triangle": { "Main": { "x": 887, "y": 66,  "w": 76, "h": 63 }, "Inner": { "x": 851, "y": 130, "w": 81, "h": 67 } },
  "Circle":   { "Main": { "x": 696, "y": 273, "w": 78, "h": 78 }, "Inner": { "x": 404, "y": 31, "w": 80, "h": 80 } },
  "Cross":    { "Main": { "x": 776, "y": 275, "w": 76, "h": 78 }, "Inner": { "x": 696, "y": 352, "w": 78, "h": 80 } }
};

// Sprite data for Mod Set Icons
const MOD_SET_SPRITES = {
  "Critical Chance": { "x": 1265, "y": 358, "w": 120, "h": 120 },
  "Critical Damage": { "x": 1195, "y": 992, "w": 120, "h": 120 },
  "Defense": { "x": 1250, "y": 1255, "w": 120, "h": 120 },
  "Health": { "x": 1278, "y": 1128, "w": 120, "h": 120 },
  "Offense": { "x": 1408, "y": 1126, "w": 120, "h": 120 },
  "Potency": { "x": 1143, "y": 1117, "w": 120, "h": 120 },
  "Speed": { "x": 1107, "y": 747, "w": 120, "h": 120 },
  "Tenacity": { "x": 1288, "y": 1385, "w": 120, "h": 120 }
};

const SET_ICON_LAYOUT_CONFIG = {
  "Square": {
    "Critical Chance": { "size": 31, "offsetX": 34, "offsetY": 16 },
    "Critical Damage": { "size": 31, "offsetX": 34, "offsetY": 16 },
    "Defense": { "size": 31, "offsetX": 34, "offsetY": 16 },
    "Health": { "size": 30, "offsetX": 35, "offsetY": 19 },
    "Offense": { "size": 30, "offsetX": 34, "offsetY": 17 },
    "Potency": { "size": 29, "offsetX": 35, "offsetY": 18 },
    "Speed": { "size": 29, "offsetX": 36, "offsetY": 17 },
    "Tenacity": { "size": 26, "offsetX": 37, "offsetY": 20 }
  },
  "Arrow": {
    "Critical Chance": { "size": 24, "offsetX": 40, "offsetY": 17 },
    "Critical Damage": { "size": 24, "offsetX": 40, "offsetY": 17 },
    "Defense": { "size": 24, "offsetX": 41, "offsetY": 17 },
    "Health": { "size": 21, "offsetX": 44, "offsetY": 17 },
    "Offense": { "size": 23, "offsetX": 41, "offsetY": 17 },
    "Potency": { "size": 23, "offsetX": 41, "offsetY": 18 },
    "Speed": { "size": 22, "offsetX": 42, "offsetY": 17 },
    "Tenacity": { "size": 21, "offsetX": 42, "offsetY": 18 }
  },
  "Diamond": {
    "Critical Chance": { "size": 28, "offsetX": 26, "offsetY": 25 },
    "Critical Damage": { "size": 28, "offsetX": 26, "offsetY": 25 },
    "Offense": { "size": 27, "offsetX": 27, "offsetY": 26 },
    "Defense": { "size": 25, "offsetX": 28, "offsetY": 26 },
    "Health": { "size": 26, "offsetX": 28, "offsetY": 26 },
    "Potency": { "size": 28, "offsetX": 26, "offsetY": 25 },
    "Speed": { "size": 26, "offsetX": 27, "offsetY": 26 },
    "Tenacity": { "size": 25, "offsetX": 28, "offsetY": 25 }
  },
  "Triangle": {
    "Critical Chance": { "size": 22, "offsetX": 29, "offsetY": 35 },
    "Critical Damage": { "size": 22, "offsetX": 29, "offsetY": 36 },
    "Offense": { "size": 21, "offsetX": 30, "offsetY": 36 },
    "Defense": { "size": 22, "offsetX": 30, "offsetY": 34 },
    "Health": { "size": 20, "offsetX": 31, "offsetY": 36 },
    "Potency": { "size": 22, "offsetX": 30, "offsetY": 34 },
    "Speed": { "size": 20, "offsetX": 29, "offsetY": 35 },
    "Tenacity": { "size": 20, "offsetX": 31, "offsetY": 36 }
  },
  "Circle": {
    "Critical Chance": { "size": 27, "offsetX": 27, "offsetY": 27 },
    "Critical Damage": { "size": 27, "offsetX": 27, "offsetY": 27 },
    "Offense": { "size": 27, "offsetX": 27, "offsetY": 27 },
    "Defense": { "size": 26, "offsetX": 28, "offsetY": 26 },
    "Health": { "size": 25, "offsetX": 29, "offsetY": 29 },
    "Potency": { "size": 28, "offsetX": 26, "offsetY": 26 },
    "Speed": { "size": 24, "offsetX": 28, "offsetY": 27 },
    "Tenacity": { "size": 24, "offsetX": 30, "offsetY": 28 }
  },
  "Cross": {
    "Critical Chance": { "size": 23, "offsetX": 27, "offsetY": 28 },
    "Critical Damage": { "size": 23, "offsetX": 27, "offsetY": 28 },
    "Offense": { "size": 22, "offsetX": 28, "offsetY": 29 },
    "Defense": { "size": 23, "offsetX": 29, "offsetY": 28 },
    "Health": { "size": 21, "offsetX": 31, "offsetY": 29 },
    "Potency": { "size": 25, "offsetX": 27, "offsetY": 27 },
    "Speed": { "size": 22, "offsetX": 28, "offsetY": 28 },
    "Tenacity": { "size": 21, "offsetX": 29, "offsetY": 29 }
  }
};

// Hex colors for mod tiers (matching CSS border colors)
const MOD_TIER_COLORS = {
  "Grey": "#6b7280", "Green": "#10b981", "Blue": "#3b82f6",
  "Purple": "#8b5cf6", "Gold": "#f59e0b"
};

/**
 * Component to render the visual mod shape with its set icon.
 */
function ModShapeVisual({ shapeType, setType, modTierName, is6Dot, shapeAtlasUrl, setAtlasUrl, shapeSpriteData5Dot, shapeSpriteData6Dot, setSpriteData, setIconLayoutConfig }) {
  // Select appropriate sprite data based on 5-dot or 6-dot
  const shapeSpriteData = is6Dot ? shapeSpriteData6Dot : shapeSpriteData5Dot;
  
  if (!shapeType || !shapeSpriteData[shapeType]) {
    return <div style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b'}}>?</div>;
  }

  const mainShapeCoords = shapeSpriteData[shapeType]?.Main;
  const innerShapeCoords = shapeSpriteData[shapeType]?.Inner;
  const layers = [];

  const tintClassName = modTierName ? `tint-${modTierName.toLowerCase()}` : '';

  // 1. Main Shape Layer (No tint)
  if (mainShapeCoords) {
    const leftOffset = (80 - mainShapeCoords.w) / 2;
    const topOffset = (80 - mainShapeCoords.h) / 2;
    layers.push(
      <div
        key="main-shape"
        className="mod-shape-layer mod-shape-main"
        style={{
          width: `${mainShapeCoords.w}px`, height: `${mainShapeCoords.h}px`,
          backgroundImage: `url(${shapeAtlasUrl})`,
          backgroundPosition: `-${mainShapeCoords.x}px -${mainShapeCoords.y}px`,
          left: `${leftOffset}px`, top: `${topOffset}px`,
        }}
      />
    );
  }

  // 2. Inner Shape Layer (colored via CSS class)
  if (innerShapeCoords) {
    const leftOffset = (80 - innerShapeCoords.w) / 2;
    const topOffset = (80 - innerShapeCoords.h) / 2;
    
    layers.push(
      <div
        key="inner-shape"
        className={`mod-shape-layer mod-shape-inner ${tintClassName}`}
        style={{
          width: `${innerShapeCoords.w}px`, height: `${innerShapeCoords.h}px`,
          backgroundImage: `url(${shapeAtlasUrl})`,
          backgroundPosition: `-${innerShapeCoords.x}px -${innerShapeCoords.y}px`,
          left: `${leftOffset}px`, top: `${topOffset}px`,
        }}
      />
    );
  }

  // 3. Set Icon Layer
  const setIconAtlasCoords = setType ? setSpriteData[setType] : null;
  const setIconLayout = (shapeType && setType) ? setIconLayoutConfig[shapeType]?.[setType] : null;

  if (setIconAtlasCoords && setIconLayout) {
    const { size: targetSize, offsetX, offsetY } = setIconLayout;
    const { w: originalSpriteWidth, h: originalSpriteHeight, x: spriteX, y: spriteY } = setIconAtlasCoords;

    const scaleX = targetSize / originalSpriteWidth;
    const scaleY = targetSize / originalSpriteHeight;

    layers.push(
      <div
        key="set-icon-container"
        className={`mod-shape-set-icon-container ${tintClassName}`}
        style={{
          width: `${targetSize}px`, height: `${targetSize}px`,
          left: `${offsetX}px`, top: `${offsetY}px`,
        }}
      >
        <img
          src={setAtlasUrl}
          alt={`${setType || ''} set icon`}
          style={{
            position: 'absolute',
            transform: `scale(${scaleX}, ${scaleY})`,
            transformOrigin: '0 0',
            left: `-${spriteX * scaleX}px`,
            top: `-${spriteY * scaleY}px`,
          }}
        />
      </div>
    );
  } else if (setType) {
    layers.push(
        <div key="set-text-fallback" className="mod-set-text" style={{position: 'absolute', bottom: '5px', left: '0', right: '0', textAlign: 'center'}}>
            {setType}
        </div>
    );
  }

  return <>{layers}</>;
}

const CHARACTER_ID_FIXES = {
  'VEERS': 'VEERS_GENERAL',
  // Add more mappings here as you find them
};

function getCharacterDisplayName(characterId) {
  if (!characterId) return { name: 'Unknown', hasWarning: true };
  
  // Extract the base ID (before the colon)
  let baseId = characterId.split(':')[0];
  
  // Check if this ID needs to be remapped
  if (CHARACTER_ID_FIXES[baseId]) {
    baseId = CHARACTER_ID_FIXES[baseId];
  }
  
  // Search through the array for matching unit
  const character = characterNames.find(char => char[0] === baseId);
  
  if (!character || !character[2]) {
    return { 
      name: baseId, 
      hasWarning: true 
    };
  }
  
  return { 
    name: character[2], 
    hasWarning: false 
  };
}

function ModCard({ mod, evaluationMode = 'basic', isTempLocked = false, onToggleTempLock }) {

  const setTypeKey = mod.definitionId[0];
  const setType = MOD_SETS[setTypeKey] || "UnknownSet";

  const dots = parseInt(mod.definitionId[1]);
  const is6Dot = dots === 6;
  
  const slotTypeKey = mod.definitionId[2];
  const slotType = MOD_SLOTS[slotTypeKey] || "UnknownShape";
  
  const modColorName = MOD_TIERS[mod.tier] || "Grey";
  
  // Calculate mod efficiency
  const modEfficiency = calculateModEfficiency(mod.secondaryStat, is6Dot);
  
  // Get speed recommendation
  const isLocked = mod.locked || isTempLocked
  const recommendation = getSpeedRecommendation(mod, evaluationMode, isLocked)
  
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const primaryStatName = STAT_NAMES[primaryStatId] || `Stat ${primaryStatId}`;
  const primaryStatValue = parseInt(mod.primaryStat?.stat?.statValueDecimal) / 10000;
  
  const formatPrimaryStat = () => {
    if ([16, 17, 18, 48, 49, 52, 53, 54, 55, 56].includes(primaryStatId)) {
      return `${(primaryStatValue * 100).toFixed(2)}%`;
    }
    return Math.floor(primaryStatValue).toString();
  };

  return (
    <div className={`mod-card mod-${modColorName.toLowerCase()} ${is6Dot ? 'mod-6dot' : ''}`}>
      {/* Recommendation Badge */}
      <div className={`mod-recommendation ${recommendation.className}`}>
        {recommendation.text}
      </div>
      
      <div className="mod-efficiency">
        {modEfficiency.toFixed(1)}%
      </div>
      
      <div className="mod-top-section">
        <div className="mod-left-side">
          <div className="mod-dots">
            {[...Array(7)].map((_, i) => (
              <span key={i} className={`dot ${i < dots ? 'filled' : 'empty'}`}>●</span>
            ))}
          </div>
          <div className="mod-shape-placeholder">
            <ModShapeVisual
              shapeType={slotType === "UnknownShape" ? null : slotType}
              setType={setType === "UnknownSet" ? null : setType}
              modTierName={modColorName}
              is6Dot={is6Dot}
              shapeAtlasUrl={charactermodsAtlas}
              setAtlasUrl={miscAtlas}
              shapeSpriteData5Dot={MOD_SHAPE_SPRITES_5DOT}
              shapeSpriteData6Dot={MOD_SHAPE_SPRITES_6DOT}
              setSpriteData={MOD_SET_SPRITES}
              setIconLayoutConfig={SET_ICON_LAYOUT_CONFIG}
            />
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
              const statId = stat.stat.unitStatId;
              const statName = STAT_NAMES[statId] || `Stat ${statId}`;
              const statValue = parseInt(stat.stat.statValueDecimal) / 10000;
              const rolls = stat.statRolls || 1;
              
              // Calculate individual stat efficiency
              const statEfficiency = calculateStatEfficiency(stat, is6Dot);
              
              const formatValue = () => {
                if ([16, 17, 18, 48, 49, 52, 53, 54, 55, 56].includes(statId)) {
                  return `${(statValue * 100).toFixed(2)}%`;
                }
                return Math.floor(statValue).toString();
              };
              
              return (
                <div key={index} className="secondary-stat">
                  <span className="stat-value">{formatValue()}</span>
                  <span className="stat-name">{statName}</span>
                  <span className="stat-rolls">({rolls}) {statEfficiency > 0 ? `${statEfficiency.toFixed(0)}%` : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(() => {
        const calibrationInfo = getCalibrationInfo(mod);
        if (calibrationInfo) {
          return (
            <div className="mod-calibration">
              <span className="calibration-label">Calibrations Left:</span>
              <span className="calibration-value">{calibrationInfo.remaining}/{calibrationInfo.total}</span>
            </div>
          );
        }
        return null;
      })()}
      
      <div className="mod-character">
        {(() => {
          const charInfo = getCharacterDisplayName(mod.characterName);
          return (
            <>
              {charInfo.hasWarning && <span className="character-warning">⚠️ </span>}
              {charInfo.name}
            </>
          );
        })()}
      </div>
      <div className="mod-lock-container">
        <button 
          className={`mod-lock-button ${mod.locked ? 'game-locked' : ''} ${isTempLocked ? 'temp-locked' : ''}`}
          onClick={() => !mod.locked && onToggleTempLock(mod.id)}
          disabled={mod.locked}
          title={mod.locked ? 'Locked in game' : (isTempLocked ? 'Click to unlock' : 'Click to lock')}
        >
          {(mod.locked || isTempLocked) ? '🔒' : '🔓'}
        </button>
      </div>
    </div>
  );
}

export { getSpeedRecommendation, getCharacterDisplayName, calculateModEfficiency };

export default ModCard;