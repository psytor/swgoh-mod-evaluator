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
function ModShapeVisual({ shapeType, setType, modTierName, shapeAtlasUrl, setAtlasUrl, shapeSpriteData, setSpriteData, setIconLayoutConfig }) {
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
        className="mod-shape-layer mod-shape-main" // No tint class
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
        // CHANGED: Apply tintClassName, remove inline filter
        className={`mod-shape-layer mod-shape-inner ${tintClassName}`}
        style={{
          width: `${innerShapeCoords.w}px`, height: `${innerShapeCoords.h}px`,
          backgroundImage: `url(${shapeAtlasUrl})`,
          backgroundPosition: `-${innerShapeCoords.x}px -${innerShapeCoords.y}px`,
          left: `${leftOffset}px`, top: `${topOffset}px`,
          // filter: filterStyle, WebkitFilter: filterStyle, // REMOVE THIS LINE
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
    
    // const filterStyle = ... // REMOVE THIS filterStyle definition

    layers.push(
      <div
        key="set-icon-container"
        // CHANGED: Apply tintClassName to the container
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
            // filter: filterStyle, WebkitFilter: filterStyle, // REMOVE THIS LINE
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
  
  const slotTypeKey = mod.definitionId[2];
  const slotType = MOD_SLOTS[slotTypeKey] || "UnknownShape";
  
  // modColorName will be "Grey", "Green", "Blue", "Purple", "Gold" (from MOD_TIERS)
  const modColorName = MOD_TIERS[mod.tier] || "Grey";
  // const actualColorHex = MOD_TIER_COLORS[modColorName]; // This was for the old filter, can be removed if not used elsewhere by ModShapeVisual

  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  // ... (rest of primary stat logic is fine) ...
  
  const formatPrimaryStat = () => { /* ... (unchanged) ... */ };

  return (
    <div className={`mod-card mod-${modColorName.toLowerCase()}`}>
      <div className="mod-recommendation-placeholder">
        {/* Recommendation will go here */}
      </div>
      
      <div className="mod-top-section">
        <div className="mod-left-side">
          <div className="mod-dots">
            {/* ... (dots rendering unchanged) ... */}
          </div>
          <div className="mod-shape-placeholder">
            <ModShapeVisual
              shapeType={slotType === "UnknownShape" ? null : slotType}
              setType={setType === "UnknownSet" ? null : setType}
              // CHANGED: Pass modColorName (e.g., "Green") instead of actualColorHex
              modTierName={modColorName}
              shapeAtlasUrl={charactermodsAtlas}
              setAtlasUrl={miscAtlas}
              shapeSpriteData={MOD_SHAPE_SPRITES}
              setSpriteData={MOD_SET_SPRITES}
              setIconLayoutConfig={SET_ICON_LAYOUT_CONFIG} // This correctly uses the embedded constant
            />
          </div>
          <div className="mod-level">
            Level {mod.level}/15
          </div>
        </div>
        
        <div className="mod-right-side">
          {/* ... (Primary and Secondary stats - unchanged) ... */}
        </div>
      </div>
      
      <div className="mod-character">
        {mod.characterName}
      </div>
    </div>
  );
}

export default ModCard;