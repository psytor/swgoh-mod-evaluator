import './ModCard.css';
import charactermodsAtlas from '../assets/charactermods_datacard_atlas.png';
import miscAtlas from '../assets/misc_atlas.png';

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
  48: "Offense %", 49: "Defense %", 53: "Critical Chance %",
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
  53: 1000,    // Critical Chance % (percentage)
  55: 1000,    // Health % (percentage)
  56: 1000     // Protection % (percentage)
};

// Stats that should use discrete positioning (integer values)
const DISCRETE_STATS = [5]; // Speed only

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
  if ([16, 17, 18, 48, 49, 53, 55, 56].includes(statId)) {
    actualValue = statValue * 100;
  }
  
  // Calculate the average roll value
  const avgRollValue = actualValue / rolls;
  
  // Use different calculation for discrete vs continuous stats
  if (DISCRETE_STATS.includes(statId)) {
    // Discrete positioning for Speed
    const positions = Math.round(max - min) + 1; // e.g., 3,4,5,6 = 4 positions
    const position = Math.round(avgRollValue - min) + 1; // 1-based position
    return (position / positions) * 100;
  } else {
    // Continuous positioning with adjustment to avoid 0%
    const positions = 10; // Reasonable granularity for continuous stats
    const rawEfficiency = (avgRollValue - min) / (max - min);
    const adjustedPosition = 1 + rawEfficiency * (positions - 1);
    return (adjustedPosition / positions) * 100;
  }
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
  "Potency": { "x": 1122, "y": 1147, "w": 120, "h": 120 },
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

function ModCard({ mod }) {
  const setTypeKey = mod.definitionId[0];
  const setType = MOD_SETS[setTypeKey] || "UnknownSet";
  
  const dots = parseInt(mod.definitionId[1]);
  const is6Dot = dots === 6;
  
  const slotTypeKey = mod.definitionId[2];
  const slotType = MOD_SLOTS[slotTypeKey] || "UnknownShape";
  
  const modColorName = MOD_TIERS[mod.tier] || "Grey";
  
  // Calculate mod efficiency
  const modEfficiency = calculateModEfficiency(mod.secondaryStat, is6Dot);
  
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const primaryStatName = STAT_NAMES[primaryStatId] || `Stat ${primaryStatId}`;
  const primaryStatValue = parseInt(mod.primaryStat?.stat?.statValueDecimal) / 10000;
  
  const formatPrimaryStat = () => {
    if ([16, 17, 18, 48, 49, 53, 55, 56].includes(primaryStatId)) {
      return `${(primaryStatValue * 100).toFixed(2)}%`;
    }
    return Math.floor(primaryStatValue).toString();
  };

  return (
    <div className={`mod-card mod-${modColorName.toLowerCase()} ${is6Dot ? 'mod-6dot' : ''}`}>
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
              const rolls = stat.statRolls || 0;
              
              // Calculate individual stat efficiency
              const statEfficiency = calculateStatEfficiency(stat, is6Dot);
              
              const formatValue = () => {
                if ([16, 17, 18, 48, 49, 53, 55, 56].includes(statId)) {
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
      
      <div className="mod-character">
        {mod.characterName}
      </div>
    </div>
  );
}

export default ModCard;