# SWGOH Mod Evaluation System - Core Documentation

## Project Philosophy
**"We're not looking for perfection, just potential"**

This system identifies mods with potential value through intelligent evaluation of stats and synergies, going beyond simple speed checks to find hidden gems.

## Evaluation Order

The system evaluates mods in this specific order:

### 1. Speed Check
- Meets threshold? → **KEEP**
- Otherwise → Continue to step 2

### 2. Offense Check  
- Meets threshold? → **KEEP**
- Otherwise → Continue to step 3

### 3. Combined Speed + Offense Check
- Both present and combined score meets threshold? → **KEEP**
- Otherwise → Continue to step 4

### 4. Full Scoring with Synergies
- Calculate base points for all stats
- Add synergy bonuses
- Total ≥ threshold? → **KEEP**
- Otherwise → **SELL**

---

## Existing Application Architecture

### Overview
The current application is a React-based web application that evaluates mods based on speed-only criteria. The new comprehensive evaluation system will be added as an additional evaluation mode, not replacing the existing functionality.

### Technology Stack
- **Frontend**: React 18.2 with Vite
- **Styling**: Custom CSS
- **Data Source**: SWGOH Comlink API
- **Hosting**: farmroadmap.dynv6.net

### Current Features

#### 1. Player Management
- Stores multiple player profiles in localStorage
- Tracks last update time (1-hour rate limit)
- Allows switching between saved players
- Dev mode (Shift+click refresh) bypasses rate limit

#### 2. Speed-Only Evaluation
Currently uses two evaluation modes:
- **Basic Mode**: Keep any speed on Grey/Green, specific thresholds for others
- **Strict Mode**: Higher thresholds for limited inventory

Current thresholds implemented:
```javascript
// Basic Mode
Grey/Green: Any speed
Blue/Purple: ≥6 speed
Gold: ≥8 speed

// Strict Mode  
Grey: Any speed
Green: ≥5 speed
Blue: ≥8 speed
Purple/Gold: ≥10 speed
```

#### 3. Mod Display Features
- Visual mod representation with sprites
- Efficiency calculation (roll quality)
- Character assignment display
- Lock/unlock functionality (game locks + temporary locks)
- Filter by recommendation type (Keep/Sell/Slice/Level)
- Filter by character
- Filter by tier (Grey through Gold)
- Mobile-responsive design

#### 4. Special Current Rules
- Speed Arrows: Always KEEP, then graded
- 6-dot mods: Auto-KEEP (already invested)
- Locked mods: Always KEEP

### Key Components

#### ModCard.jsx
- Displays individual mod with all stats
- Shows efficiency percentage
- Handles recommendation logic
- Manages visual sprites

#### ModList.jsx
- Grid layout for all mods
- Filtering and sorting
- Collection efficiency statistics
- Mobile-responsive filters

#### App.jsx
- Main application logic
- Player data management
- Navigation between views

### API Integration
```javascript
// Fetch player data
POST http://farmroadmap.dynv6.net/comlink/player
{
  "payload": { "allyCode": "123456789" },
  "enums": false
}
```

### Data Processing
1. Extract mods from all roster units
2. Filter to only 5-dot and 6-dot mods
3. Decode stat values (÷10000 for most stats)
4. Calculate efficiency per stat
5. Apply evaluation rules

### Adding the New System

The comprehensive evaluation system will be integrated as:

1. **New Evaluation Mode**: Add "Comprehensive" option alongside Basic/Strict
2. **Extended Logic**: Implement 4-step evaluation in `getRecommendation()` function
3. **Point Calculation**: Add `calculatePoints()` and `calculateSynergies()` functions
4. **UI Updates**: Show point scores and synergy bonuses in ModCard
5. **New Verdicts**: Expand from 4 to 6 verdict types (add EVALUATE, future CALIBRATE)

### Implementation Integration Points

```javascript
// In ModCard.jsx - extend getSpeedRecommendation()
function getComprehensiveRecommendation(mod, isLocked = false) {
  // 1. Special rules (6-dot, Speed Arrow, locked)
  // 2. Level checks
  // 3. Speed threshold
  // 4. Offense threshold  
  // 5. Combined speed+offense
  // 6. Full scoring with synergies
}

// New functions to add
function calculateBasePoints(mod) { /* ... */ }
function calculateSynergies(mod) { /* ... */ }
function evaluateByTier(mod, tier, level) { /* ... */ }
```

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Evaluation Stages](#evaluation-stages)
3. [Verdict Categories](#verdict-categories)
4. [Stat Values and Thresholds](#stat-values-and-thresholds)
5. [Point Calculation System](#point-calculation-system)
6. [Synergy System](#synergy-system)
7. [Special Rules](#special-rules)
8. [Implementation by Tier](#implementation-by-tier)
9. [Complete Examples](#complete-examples)
10. [Future Enhancements](#future-enhancements)

---

## System Overview

### Purpose
Evaluate Star Wars Galaxy of Heroes mods to determine their potential value, providing actionable recommendations for keeping, selling, leveling, or improving mods.

### Core Principles
1. **Speed is the first check** - Critical stat that affects turn order
2. **Offense is the second check** - Direct damage increase, valuable independently
3. **Combined scoring rewards both** - Speed + Offense together create exceptional value
4. **Synergy reveals hidden potential** - Well-matched stats outperform random high rolls
5. **Early evaluation saves resources** - Don't waste credits on mods without potential

### What Makes This System Different
- Multi-stage evaluation (catches bad mods early)
- Synergy-aware scoring (finds valuable combinations)
- Resource-conscious (considers credit costs)
- Actionable verdicts (not just keep/sell)

---

## Evaluation Stages

### Stage 1: Initial Assessment (Level 1)
Evaluate visible stats to determine if mod is worth leveling.

| Tier | Visible Secondaries | Level Checkpoints |
|------|-------------------|-------------------|
| Gold | 4 (all visible) | 1 → 12 → 15 |
| Purple | 3 visible | 1 → 3 → 12 → 15 |
| Blue | 2 visible | 1 → 6 → 12 → 15 |
| Green | 1 visible | 1 → 9 → 12 → 15 |
| Grey | 0 visible | 1 → 9 → 12 → 15 |

### Stage 2: Checkpoint Evaluation
Re-evaluate at key levels when new secondaries are revealed.

### Stage 3: Final Scoring (Level 15)
Complete evaluation with all stats visible and maxed.

---

## Verdict Categories

### 1. **SELL**
- No potential value detected
- Fails all evaluation criteria
- Action: Sell immediately

### 2. **LEVEL**
- Shows potential but needs more stats revealed
- Action: Level to next checkpoint (3/6/9/12)

### 3. **KEEP**
- Meets evaluation criteria
- Action: Keep and use on characters

### 4. **EVALUATE**
- Borderline mod with uncertain value
- Action: Check if mod optimizer tools find uses, otherwise sell

### 5. **SLICE**
- High-scoring mod within its tier
- Action: Priority for slicing to next tier when resources available

### 6. **CALIBRATE** *(Future Enhancement)*
- Good mod with correctable flaws
- Action: Use calibration to improve weak stats
- Note: This feature is under development

---

## Stat Values and Thresholds

### Secondary Stat Ranges (5-dot mods)
| Stat | Min Roll | Max Roll | Average |
|------|----------|----------|---------|
| Speed | 3 | 6 | 4.5 |
| Offense | 22.8 | 45.6 | 34.2 |
| Critical Chance % | 1.125% | 2.25% | 1.69% |
| Defense | 4.9 | 9.8 | 7.35 |
| Defense % | 0.85% | 1.70% | 1.28% |
| Health | 214.3 | 428.6 | 321.5 |
| Health % | 0.563% | 1.125% | 0.84% |
| Offense % | 0.281% | 0.563% | 0.42% |
| Potency % | 1.125% | 2.25% | 1.69% |
| Protection | 415.3 | 830.6 | 623.0 |
| Protection % | 1.125% | 2.25% | 1.69% |
| Tenacity % | 1.125% | 2.25% | 1.69% |

### Quick Check Thresholds

| Tier | Speed | Offense | Notes |
|------|-------|---------|-------|
| Grey | Any | Any | Any speed or offense = keep |
| Green | Any | Any | Any speed or offense = keep |
| Blue | ≥ 6 | ≥ 30 | ~88% of average roll |
| Purple | ≥ 8 | ≥ 50 | ~1.5 good rolls |
| Gold | ≥ 10 | ≥ 70 | 2+ good rolls |

### Combined Speed + Offense Scoring
When BOTH speed and offense are present but neither meets individual thresholds:

| Tier | Combined Requirement | Example |
|------|---------------------|---------|
| Grey | Not applicable | Any speed OR offense passes |
| Green | Not applicable | Any speed OR offense passes |
| Blue | Speed + (Offense × 0.15) ≥ 10 | Speed 4 + Offense 40 = 10 ✓ |
| Purple | Speed + (Offense × 0.12) ≥ 14 | Speed 6 + Offense 67 = 14 ✓ |
| Gold | Speed + (Offense × 0.10) ≥ 17 | Speed 8 + Offense 90 = 17 ✓ |

*Formula rationale: Converts offense to speed-equivalent value for combined assessment*

### Full Evaluation Thresholds
When speed, offense, AND combined checks fail:

| Tier | Required Points |
|------|----------------|
| Grey | 130 |
| Green | 165 |
| Blue | 240 |
| Purple | 330 |
| Gold | 380 |

---

## Point Calculation System

### Base Point Values
Each stat is normalized so an average roll = 100 points:

```javascript
const POINT_MULTIPLIERS = {
    'Speed': 22.222,           // 4.5 avg × 22.222 = 100
    'Offense': 2.924,          // 34.2 avg × 2.924 = 100
    'Critical Chance %': 59.259,
    'Defense': 13.605,
    'Defense %': 78.431,
    'Health': 0.311,
    'Health %': 118.483,
    'Offense %': 236.967,
    'Potency %': 59.259,
    'Protection': 0.161,
    'Protection %': 59.259,
    'Tenacity %': 59.259
};
```

### Calculation Example
```
Mod has: Speed +9, Offense +45, Health +300
Speed: 9 × 22.222 = 200.0 points
Offense: 45 × 2.924 = 131.6 points
Health: 300 × 0.311 = 93.3 points
Total Base: 424.9 points
```

---

## Synergy System

### Set Categorization

**Offensive Sets:**
- Speed: Speed, Offense, Offense %, CC %, Potency %
- Offense: Offense, Offense %, CC %, CD %, Speed
- Critical Damage: CC %, Offense, Offense %, Speed
- Critical Chance: CD %, Offense, Offense %, Speed
- Potency: Potency %, Speed, Offense, Offense %

**Defensive Sets:**
- Health: Health, Health %, Protection, Protection %, Defense %
- Defense: Defense, Defense %, Health %, Protection %, Tenacity %
- Tenacity: Tenacity %, Speed, Defense, Defense %, Health %

### Synergy Bonuses

#### 1. Set + Primary Synergies (Choice Slots Only)
| Combination | Bonus | Applies To |
|------------|-------|------------|
| Speed Arrow on Speed Set | +25 | Arrow only |
| Potency % Cross on Potency Set | +20 | Cross only |
| Tenacity % Cross on Tenacity Set | +20 | Cross only |
| CD % Triangle on CD Set | +15 | Triangle only |
| CC % Triangle on CC Set | +15 | Triangle only |
| Good match (set category matches primary) | +10 | Choice slots |

*Note: Square (always Offense %) and Diamond (always Defense %) are excluded*

#### 2. Set + Secondary Synergies
Each matching secondary: **+15 points**

#### 3. Secondary Combinations
| Combination | Bonus |
|------------|-------|
| Offense + Offense % | +20 |
| Defense + Defense % | +20 |
| Health + Health % | +15 |
| Protection + Protection % | +15 |
| Speed + Offense | +15 |
| Speed + CC % | +15 |
| Speed + Potency % | +10 |

### Early Synergy Detection
- **Gold/Purple (Level 1-3)**: All/most secondaries visible - full synergy check
- **Blue (Level 6)**: Partial synergy check with visible stats
- **Green/Grey**: Limited early detection, re-evaluate at checkpoints

---

## Special Rules

### 1. Speed Arrow Rule
```javascript
if (slot === 'Arrow' && primary === 'Speed') {
    result = 'KEEP';
    // Calculate grade based on total score
    grade = score >= 500 ? 'S-Tier' :
            score >= 400 ? 'A-Tier' :
            score >= 300 ? 'B-Tier' :
            score >= 200 ? 'C-Tier' : 'D-Tier';
}
```
**Rationale**: Only source of speed primary in the game

### 2. Six-Dot Mod Rule
```javascript
if (dots === 6) {
    result = 'KEEP';
    // Calculate score for slice priority ranking
}
```
**Rationale**: Significant resource investment already made

### 3. Rare Primary Reductions
| Primary | Slot | Threshold Multiplier |
|---------|------|---------------------|
| Critical Damage % | Triangle | ×0.5 |
| Critical Chance % | Triangle | ×0.5 |
| Potency % | Cross | ×0.6 |
| Tenacity % | Cross | ×0.6 |

**Rationale**: Only sources of these primaries

### 4. Low Dots Auto-Sell
```javascript
if (dots <= 4) {
    result = 'SELL';
}
```
**Rationale**: Cannot compete with 5-6 dot mods

---

## Implementation by Tier

### Grey Mod Evaluation Flow
```
Level 1 (no secondaries visible):
├─ Check set + primary compatibility
├─ Obvious mismatch? (e.g., Offense set + Defense % on Diamond) → SELL
└─ Otherwise → LEVEL to 9

Level 9 (3 secondaries revealed):
├─ Speed check: Any → KEEP
├─ Offense check: Any → KEEP
├─ Combined score ≥130 → KEEP
└─ Otherwise → SELL

Level 12 (all secondaries revealed):
├─ Speed check: Any → KEEP
├─ Offense check: Any → KEEP
├─ Combined score ≥130 → KEEP
└─ Otherwise → SELL
```

### Green Mod Evaluation Flow
```
Level 1 (1 secondary visible):
├─ Has speed or offense visible? → LEVEL to 9
├─ Check visible stat + set/primary synergy
├─ Strong anti-synergy? → CONSIDER SELL
└─ Otherwise → LEVEL to 9

Level 9 (all secondaries revealed):
├─ Speed check: Any → KEEP
├─ Offense check: Any → KEEP
├─ Combined score ≥165 → KEEP
└─ Otherwise → SELL

Level 12 (all stats maxed):
├─ Speed check: Any → KEEP
├─ Offense check: Any → KEEP
├─ Combined score ≥165 → KEEP
└─ Otherwise → SELL
```

### Blue Mod Evaluation Flow
```
Level 1 (2 secondaries visible):
├─ Has speed ≥6 or any offense visible? → LEVEL to 12
├─ No speed + no offense but good synergy? → LEVEL to 6
└─ Otherwise → CONSIDER SELL

Level 6 (all secondaries visible):
├─ Speed ≥6 → Continue to 12
├─ Any offense → Continue to 12
├─ Good synergy potential? → Continue to 12
└─ Otherwise → SELL

Level 12 (all stats maxed):
├─ Speed check: ≥6 → KEEP
├─ Offense check: Any → KEEP
├─ Combined: Speed + (Offense × 0.15) ≥ 10 → KEEP
├─ Full score ≥240 → KEEP
└─ Otherwise → SELL
```

### Purple Mod Evaluation Flow
```
Level 1 (3 secondaries visible):
├─ Has speed ≥8 or offense ≥50? → LEVEL to 12
├─ Has both speed and offense? Check combined → LEVEL to 12 if good
├─ Calculate preliminary synergy
├─ Obvious mismatch? → SELL
└─ Otherwise → LEVEL to 3

Level 3 (all 4 secondaries visible):
├─ Speed ≥8 → Continue to 12
├─ Offense ≥50 → Continue to 12
├─ Combined: Speed + (Offense × 0.12) ≥ 14 → Continue to 12
├─ Strong synergy? → Continue to 12
└─ Otherwise → EVALUATE or SELL

Level 12:
├─ Full evaluation with all checks
```

### Gold Mod Evaluation Flow
```
Level 1 (all 4 secondaries visible):
├─ Speed ≥10 → KEEP (calculate score for SLICE priority)
├─ Offense ≥70 → KEEP (calculate score for SLICE priority)
├─ Combined: Speed + (Offense × 0.10) ≥ 17 → KEEP
├─ Calculate full synergy score
│  ├─ Score ≥380 → KEEP
│  ├─ Score 300-379 → EVALUATE
│  └─ Score <300 → SELL

Level 12:
├─ Full evaluation with all checks
```

---

## Complete Examples

### Example 1: Gold Mod Early Detection
```
Critical Damage Set, Cross, Level 1
Primary: Protection %
Visible secondaries: Tenacity %, Health %, Potency %, Protection

Analysis:
- CD set wants: CC %, Offense, Speed
- Has: All defensive stats
- Set/Primary mismatch (offensive set, defensive primary)
- No synergistic secondaries

Verdict: SELL (no potential detected)
Credits saved: 484,750
```

### Example 2: Blue Mod Progression
```
Speed Set, Square, Level 1
Primary: Offense % (fixed)
Visible: Speed +5, Defense +7

Level 1 → LEVEL to 6 (has speed)

Level 6 reveals: Potency % +1.3%
Has speed but only 5 → Continue to 12

Level 12 reveals: Health +250
Final: Speed +5, Defense +7, Potency % +1.3%, Health +250

Evaluation:
- Speed: 5 < 6 ✗
- Offense: 0 < any ✗
- Base points: 195.5
- Synergies: +40 (Speed set bonuses)
- Total: 235.5 < 240 ✗

Verdict: SELL (close but failed all thresholds)
```

### Example 3: Purple Slice Candidate
```
Offense Set, Triangle, Level 15
Primary: Critical Damage %
Secondaries: Speed +12, Offense +68, CC % +2.8%, Defense +6

Evaluation:
- Speed: 12 > 8 ✓ → KEEP
- Calculate score for SLICE priority:
  - Base: 580 points
  - Synergies: +65
  - Total: 645 points

Verdict: SLICE (high priority - excellent offensive stats)
```

---

## Future Enhancements

### 1. Calibration Analysis
- Identify stats with 2+ low rolls
- Calculate potential improvement
- Provide calibration recommendations

### 2. Dynamic Slice Recommendations
- When no mods meet SLICE threshold in a tier
- Show top 10 mods as slice candidates
- Ensures progression even with limited options

### 3. Resource Cost Display
- Credits needed for leveling
- Slice material requirements
- Help players budget resources

### 4. Character-Specific Evaluation
- Adjust weights based on character needs
- Example: Tanks value defense more than offense

---

## Implementation Priority

1. **Phase 1**: Grey mod complete flow
2. **Phase 2**: Green mod additions
3. **Phase 3**: Blue mod checkpoints
4. **Phase 4**: Purple early detection
5. **Phase 5**: Gold instant evaluation
6. **Phase 6**: Special rules integration
7. **Phase 7**: Slice recommendations
8. **Phase 8**: Calibration system

Each phase should be tested thoroughly before proceeding to ensure the foundation remains stable.