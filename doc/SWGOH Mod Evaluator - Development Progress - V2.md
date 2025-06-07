# SWGOH Mod Evaluator - Development Progress Documentation V2 (Corrected)

## Project Overview
A web-based tool to evaluate Star Wars Galaxy of Heroes (SWGOH) mods using React + Vite. The project is designed to support multiple evaluation approaches, with the first implementation focusing on speed evaluation.

## Current Status: Phase 2 Complete ✅

### Major Updates Since V1

#### 1. **Evaluation System Implemented** ✅
- **First Evaluation Method**: Speed-based recommendations
- **Two Evaluation Modes**:
  - **Basic Mode**: "Keep Any Speed" - More lenient thresholds
  - **Strict Mode**: "Limited Inventory" - Higher speed requirements
- **Persistent Mode Selection**: Saves preference to localStorage
- **Fixed Mode Selector Bar**: Always visible at top of screen

#### 2. **Speed-Based Recommendations** ✅
The app now evaluates mods based on speed secondary stats:

**Recommendation Types:**
- 🟢 **Keep**: Mod meets speed threshold for its tier
- 🔴 **Sell**: Mod doesn't meet minimum requirements
- 🟣 **Slice**: Level 15 mod that's worth upgrading to next tier
- 🟠 **Level to X**: Mod needs more levels before full evaluation

**Evaluation Logic:**
- Checks if mod can be fully evaluated (level 12+ for all secondaries visible)
- Speed arrows always get "Keep" or "Slice" recommendation
- Different thresholds based on mod tier (Grey/Green/Blue/Purple/Gold)
- Mode-specific thresholds (Basic vs Strict)

#### 3. **Visual Mod Representation** ✅
- **Mod Shape Sprites**: Using actual game assets from `charactermods_datacard_atlas.png`
- **Set Icons**: Displaying set bonus icons from `misc_atlas.png`
- **Dynamic Coloring**: Inner shape tinted based on mod tier
- **6-Dot Special Effects**: Gradient backgrounds and enhanced styling
- **Proper Sprite Positioning**: Pixel-perfect alignment using sprite coordinates

#### 4. **Roll Quality Display System** ✅
- **Position-Based Scoring**: Calculates how good each stat roll is (0-100%)
- **Per-Stat Roll Quality**: Shows individual quality for each secondary
- **Overall Roll Quality**: Average of all secondary stat roll qualities
- **Smart Calculations**:
  - Discrete positioning for Speed (3,4,5,6 = 25%, 50%, 75%, 100%)
  - Continuous positioning for other stats
  - Handles API bounds when available, falls back to hardcoded ranges

**Note**: This roll quality display is purely informational and shows how well each stat rolled compared to its possible range. It is NOT an evaluation system.

#### 5. **6-Dot Mod Features** ✅
- **Calibration Tracking**: Shows remaining calibrations (e.g., "2/6 Calibrations Left")
- **Special Visual Effects**: Rainbow gradient borders
- **Enhanced Badges**: Gradient backgrounds for recommendations

#### 6. **UI/UX Improvements** ✅
- **Character Name Display**: Still showing IDs (needs character name mapping)
- **5-Dot and 6-Dot Only**: Filtering out lower tier mods
- **Improved Card Layout**: More space for badges and information
- **Color-Coded Borders**: Matching mod tier colors
- **Hover Effects**: Subtle lift on mouse over

### Technical Implementation Details

#### Sprite System
```javascript
// 5-Dot shapes use one set of coordinates
MOD_SHAPE_SPRITES_5DOT = {
  "Square": { "Main": {...}, "Inner": {...} },
  // etc.
}

// 6-Dot shapes use different frame coordinates
MOD_SHAPE_SPRITES_6DOT = {
  "Square": { "Main": {...}, "Inner": {...} },
  // etc.
}

// Set icons positioned differently per shape
SET_ICON_LAYOUT_CONFIG = {
  "Square": {
    "Speed": { "size": 29, "offsetX": 36, "offsetY": 17 },
    // etc.
  }
}
```

#### Evaluation Thresholds (Speed-Based)
**Basic Mode:**
- Grey/Green: Any speed
- Blue/Purple: 6+ speed
- Gold: 8+ speed

**Strict Mode:**
- Grey: Any speed
- Green: 5+ speed
- Blue: 8+ speed
- Purple/Gold: 10+ speed

### Current File Structure
```
swgoh-mod-evaluator/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── App.css
│   ├── assets/
│   │   ├── charactermods_datacard_atlas.png
│   │   └── misc_atlas.png
│   └── components/
│       ├── AllyCodeEntry.jsx
│       ├── AllyCodeEntry.css
│       ├── ModList.jsx
│       ├── ModList.css
│       ├── ModCard.jsx
│       └── ModCard.css
```

### What's Working Well
- ✅ Complete speed-based evaluation system (first of multiple planned approaches)
- ✅ Visual mod representation with game sprites
- ✅ Roll quality calculations (informational display)
- ✅ Mode persistence
- ✅ 6-dot mod special features
- ✅ Recommendation badges
- ✅ API data decoding and display

### What Still Needs Work
- ❌ Character name mapping (will require server-side API - not yet implemented)
- ❌ Sorting and filtering options (next priority)
- ❌ Bulk actions (select multiple mods)
- ❌ Additional evaluation methods beyond speed

### Known Issues
1. **Character Names**: Need to implement ID-to-name mapping
2. **No Sorting**: Mods appear in roster order
3. **No Filtering**: Can't filter by recommendation, roll quality, etc.
4. **No Stats Summary**: No overview of total mods, recommendations, etc.

## Next Steps (Phase 3)

### Immediate Priorities
1. **Character Name Mapping**: Create lookup table for readable names
2. **Sorting Options**: By roll quality, speed, recommendation, character
3. **Filter Panel**: Filter by recommendation type, minimum roll quality, etc.
4. **Summary Stats**: Show totals (X to keep, Y to sell, Z to slice)

### Future Enhancements
1. **Additional Evaluation Methods**: Implement other approaches beyond speed
2. **Batch Operations**: Select and export multiple mods
3. **Advanced Filters**: By set, slot, primary stat
4. **Mod Optimizer Integration**: Export to HotUtils format
5. **Offline Mode**: Cache player data

## Technical Notes

### Roll Quality Calculation
- Uses position-based approach (not percentage of max)
- Discrete for Speed: 3→25%, 4→50%, 5→75%, 6→100%
- Continuous for others with 10 positions
- Averages all secondaries for overall quality
- **This is purely informational - NOT an evaluation system**

### Sprite Rendering
- Three layers: Main shape, inner shape (tinted), set icon
- CSS filters for color tinting
- Precise positioning using layout config
- Pixel-perfect rendering with `image-rendering: pixelated`

### Recommendation Logic (Current Speed-Based Implementation)
```
1. Speed arrows → Keep/Slice
2. Can't evaluate → Level to X
3. No speed → Sell
4. Below threshold → Sell
5. Level 15 + high speed → Slice
6. Otherwise → Keep
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to nginx
sudo cp -r dist/* /var/www/farmroadmap.dynv6.net/mod-evaluator/
```

## Key Improvements Since V1
1. **First Evaluation System**: Speed-based logic implementation
2. **Visual Polish**: Game-accurate mod representation
3. **User Choice**: Two evaluation modes for different playstyles
4. **Better UX**: Persistent settings, clear recommendations
5. **6-Dot Support**: Special handling for newest mod tier
6. **Roll Quality Display**: Shows how well stats rolled (informational)

---

*Last Updated: Current Session - Phase 2 Complete*