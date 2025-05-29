import './ModCard.css';
import charactermodsAtlas from '../assets/charactermods_datacard_atlas.png';
import miscAtlas from '../assets/misc_atlas.png';
import setIconConfigData from './correction.json';

// Mappings from the API documentation (MOD_SETS, MOD_SLOTS, MOD_TIERS, STAT_NAMES - unchanged)
// ... (keep these as they are)
const MOD_SETS = { /* ... */ };
const MOD_SLOTS = { /* ... */ };
const MOD_TIERS = { /* ... */ };
const STAT_NAMES = { /* ... */ };


// Sprite data (MOD_SHAPE_SPRITES, MOD_SET_SPRITES, SET_ICON_LAYOUT_CONFIG - unchanged)
// ... (keep these as they are)
const MOD_SHAPE_SPRITES = { /* ... */ };
const MOD_SET_SPRITES = { /* ... */ };
const SET_ICON_LAYOUT_CONFIG = setIconConfigData;

// Hex colors for mod tiers (MOD_TIER_COLORS - unchanged, still useful for borders)
// ... (keep this as it is)
const MOD_TIER_COLORS = { /* ... */ };


/**
 * Component to render the visual mod shape with its set icon.
 * MODIFIED: Takes modTierName to apply CSS tint class.
 */
function ModShapeVisual({ shapeType, setType, modTierName, shapeAtlasUrl, setAtlasUrl, shapeSpriteData, setSpriteData, setIconLayoutConfig }) {
  if (!shapeType || !shapeSpriteData[shapeType]) {
    return <div style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b'}}>?</div>;
  }

  const mainShapeCoords = shapeSpriteData[shapeType]?.Main;
  const innerShapeCoords = shapeSpriteData[shapeType]?.Inner;
  const layers = [];

  // Determine the tinting class based on the mod tier name
  const tintClassName = modTierName ? `tint-${modTierName.toLowerCase()}` : '';

  // 1. Main Shape Layer (no tinting needed for this layer usually)
  if (mainShapeCoords) {
    const leftOffset = (80 - mainShapeCoords.w) / 2;
    const topOffset = (80 - mainShapeCoords.h) / 2;
    layers.push(
      <div
        key="main-shape"
        className="mod-shape-layer mod-shape-main" // No tint class here
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
        className={`mod-shape-layer mod-shape-inner ${tintClassName}`} // Apply tint class
        style={{
          width: `${innerShapeCoords.w}px`, height: `${innerShapeCoords.h}px`,
          backgroundImage: `url(${shapeAtlasUrl})`,
          backgroundPosition: `-${innerShapeCoords.x}px -${innerShapeCoords.y}px`,
          left: `${leftOffset}px`, top: `${topOffset}px`,
          // Removed inline filter style
        }}
      />
    );
  }

  // 3. Set Icon Layer (container gets the tint class, affecting the img child)
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
        className={`mod-shape-set-icon-container ${tintClassName}`} // Apply tint class to container
        style={{
          width: `${targetSize}px`, height: `${targetSize}px`,
          left: `${offsetX}px`, top: `${offsetY}px`,
          // Removed inline filter style
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
            // Removed inline filter style from img as parent handles it
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
  
  // modColorName will be "Grey", "Green", "Blue", "Purple", "Gold"
  const modColorName = MOD_TIERS[mod.tier] || "Grey"; 
  // actualColorHex is still used for the card's border
  // const actualColorHex = MOD_TIER_COLORS[modColorName]; 
  
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const primaryStatName = STAT_NAMES[primaryStatId] || `Stat ${primaryStatId}`;
  const primaryStatValue = parseInt(mod.primaryStat?.stat?.statValueDecimal) / 10000;
  
  const formatPrimaryStat = () => { /* ... (unchanged) ... */ };

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
              modTierName={modColorName} // Pass the tier name (e.g., "Green")
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