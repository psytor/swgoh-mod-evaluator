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

// Sprite data for Mod Shapes (Main and Inner layers)
const MOD_SHAPE_SPRITES = {
    "Square":   { "Main": { "x": 696, "y": 117, "w": 79, "h": 77 }, "Inner": { "x": 647, "y": 31, "w": 80, "h": 80 } },
    "Arrow":    { "Main": { "x": 696, "y": 195, "w": 79, "h": 77 }, "Inner": { "x": 566, "y": 31, "w": 80, "h": 80 } },
    "Diamond":  { "Main": { "x": 696, "y": 433, "w": 79, "h": 79 }, "Inner": { "x": 161, "y": 31, "w": 80, "h": 80 } },
    "Triangle": { "Main": { "x": 854, "y": 212, "w": 78, "h": 64 }, "Inner": { "x": 851, "y": 130, "w": 81, "h": 67 } },
    "Circle":   { "Main": { "x": 775, "y": 354, "w": 79, "h": 78 }, "Inner": { "x": 404, "y": 31, "w": 80, "h": 80 } },
    "Cross":    { "Main": { "x": 729, "y": 37,  "w": 76, "h": 79 }, "Inner": { "x": 696, "y": 352, "w": 78, "h": 80 } }
};

// Sprite data for Mod Set Icons
const MOD_SET_SPRITES = {
    "Critical Chance": { "x": 1265, "y": 358, "w": 120, "h": 120 }, "Critical Damage": { "x": 1195, "y": 992, "w": 120, "h": 120 },
    "Defense": { "x": 1250, "y": 1255, "w": 120, "h": 120 }, "Health": { "x": 1278, "y": 1128, "w": 120, "h": 120 },
    "Offense": { "x": 1408, "y": 1126, "w": 120, "h": 120 }, "Potency": { "x": 1143, "y": 1117, "w": 126, "h": 126 },
    "Speed": { "x": 1107, "y": 747, "w": 120, "h": 120 }, "Tenacity": { "x": 1288, "y": 1385, "w": 120, "h": 120 }
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
}

// Hex colors for mod tiers (matching CSS border colors)
const MOD_TIER_COLORS = {
  "Grey": "#6b7280", "Green": "#10b981", "Blue": "#3b82f6",
  "Purple": "#8b5cf6", "Gold": "#f59e0b"
};

/**
 * Component to render the visual mod shape with its set icon.
 */
function ModShapeVisual({ shapeType, setType, colorHex, shapeAtlasUrl, setAtlasUrl, shapeSpriteData, setSpriteData, setIconLayoutConfig }) {
  if (!shapeType || !shapeSpriteData[shapeType]) {
    // Fallback if shapeType is invalid or not found in sprite data
    return <div style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b'}}>?</div>;
  }

  const mainShapeCoords = shapeSpriteData[shapeType]?.Main;
  const innerShapeCoords = shapeSpriteData[shapeType]?.Inner;
  const layers = [];

  // 1. Main Shape Layer
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

  // 2. Inner Shape Layer (colored)
  if (innerShapeCoords) {
    const leftOffset = (80 - innerShapeCoords.w) / 2;
    const topOffset = (80 - innerShapeCoords.h) / 2;
    const filterStyle = colorHex && colorHex !== MOD_TIER_COLORS.Grey // Don't apply brightness filter for grey
      ? `brightness(0) saturate(100%) drop-shadow(0 0 0 ${colorHex})`
      : undefined;

    layers.push(
      <div
        key="inner-shape"
        className="mod-shape-layer mod-shape-inner"
        style={{
          width: `${innerShapeCoords.w}px`, height: `${innerShapeCoords.h}px`,
          backgroundImage: `url(${shapeAtlasUrl})`,
          backgroundPosition: `-${innerShapeCoords.x}px -${innerShapeCoords.y}px`,
          left: `${leftOffset}px`, top: `${topOffset}px`,
          filter: filterStyle, WebkitFilter: filterStyle,
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
    
    const filterStyle = colorHex && colorHex !== MOD_TIER_COLORS.Grey
      ? `brightness(0) saturate(100%) drop-shadow(0 0 0 ${colorHex})`
      : undefined;

    layers.push(
      <div
        key="set-icon-container"
        className="mod-shape-set-icon-container"
        style={{
          width: `${targetSize}px`, height: `${targetSize}px`,
          left: `${offsetX}px`, top: `${offsetY}px`,
        }}
      >
        <img // Using <img> tag as in test-shape.html for easier scaling/positioning of full atlas
          src={setAtlasUrl}
          alt={`${setType || ''} set icon`}
          style={{
            position: 'absolute',
            transform: `scale(${scaleX}, ${scaleY})`,
            transformOrigin: '0 0',
            left: `-${spriteX * scaleX}px`,
            top: `-${spriteY * scaleY}px`,
            filter: filterStyle, WebkitFilter: filterStyle,
          }}
        />
      </div>
    );
  } else if (setType) {
    // Fallback for set text if visual config is missing (should not happen with full correction.json)
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
  
  const slotTypeKey = mod.definitionId[2];
  const slotType = MOD_SLOTS[slotTypeKey] || "UnknownShape";
  
  const modColorName = MOD_TIERS[mod.tier] || "Grey";
  const actualColorHex = MOD_TIER_COLORS[modColorName];
  
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
    <div className={`mod-card mod-${modColorName.toLowerCase()}`}>
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
            <ModShapeVisual
              shapeType={slotType === "UnknownShape" ? null : slotType}
              setType={setType === "UnknownSet" ? null : setType}
              colorHex={actualColorHex}
              shapeAtlasUrl={charactermodsAtlas}
              setAtlasUrl={miscAtlas}
              shapeSpriteData={MOD_SHAPE_SPRITES}
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
                  <span className="stat-rolls">({rolls})</span>
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