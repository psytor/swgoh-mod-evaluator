# SWGOH Mod Evaluation System - Technical Documentation v2.0

## Table of Contents
1. [Overview](#overview)
2. [Core Definitions](#core-definitions)
3. [Evaluation Order](#evaluation-order)
4. [Set-Specific Rules](#set-specific-rules)
5. [Decision Categories](#decision-categories)
6. [Complete Examples](#complete-examples)
7. [Edge Cases](#edge-cases)
8. [Progressive Evaluation](#progressive-evaluation)

## Required Functions List

### Set Type Identification
- `checkSetType` - Returns which evaluation path to follow
- `checkIsSpeedSet` - Returns true if speed set
- `checkIsTenacitySet` - Returns true if tenacity set  
- `checkIsPotencySet` - Returns true if potency set
- `checkIsOffensiveSet` - Returns true if Offense/CC/CD
- `checkIsDefensiveSet` - Returns true if Health/Defense

### Hard Requirement Checks
- `checkHasSpeed` - ⛔ Must have speed (primary OR secondary)
- `checkHasTenacity` - ⛔ Must have tenacity% (primary OR secondary)
- `checkSpeedArrowHighRolls` - Checks if speed arrow with secondary speed has rolls ≥4

### Primary Stat Checks
- `checkPrimaryAlignment` - Returns true if primary matches set preferences
- `checkPrimaryStronglyPreferred` - For Potency/Tenacity cross slots
- `checkHasVariablePrimary` - Returns true for Arrow/Triangle/Cross

### Synergy Analysis
- `identifyTrueSynergies` - Returns list of true synergy stats present
- `countTrueSynergies` - Returns count of true synergy matches
- `checkHasTwoOrMoreSynergies` - Returns true if count ≥2
- `identifyConditionalStats` - Returns list of conditional stats present
- `apply2PlusRule` - Marks conditional stats as synergistic when 2+ rule met
- `identifySynergisticStats` - Returns all stats that count as synergistic (true + conditional if 2+ met)

### Efficiency Calculations  
- `calculateEfficiency` - Returns (synergistic stats / total visible stats) as percentage
- `checkEfficiencyThreshold` - Checks if efficiency meets threshold (params: min %)

### Roll Quality Analysis
- `identifyRollsPerStat` - Determines how many times each stat was rolled
- `evaluateIndividualStatRoll` - Checks if specific stat roll meets quality standards
- `checkHasTerribleRolls` - Returns true if synergistic stats have multiple poor rolls
- `checkHasDecentRolls` - Returns true if mix of good/poor rolls
- `checkHasGreatRolls` - Returns true if mostly excellent rolls
- `calculateRollQualityScore` - Weighted score of roll quality (synergistic stats only)
- `ignoreNonSynergisticRolls` - Ensures non-synergistic stats are excluded

### Cohesion Checks
- `checkPerfectCohesion` - Returns true if all 4 secondaries in same group
- `identifyDominantGroup` - Returns 'offensive', 'defensive', or 'mixed'
- `calculateCoherenceScore` - For speed sets, returns coherence percentage
- `checkShouldApplyCohesion` - Returns true if cohesion check should run (certain sets only)

### Utility Functions
- `checkModLevel` - Returns true if mod level meets threshold
- `checkModColor` - Returns mod rarity (grey/green/blue/purple/gold)
- `getVisibleSecondaryCount` - Returns count based on color and level
- `checkAllSecondariesVisible` - Returns true when all 4 secondaries visible
- `checkIsSpecificSlot` - Returns true if mod is specific slot (arrow/triangle/cross)

### Control Flow
- `default` - Always returns true, provides final result

## Configuration Structure

### Per-Set Configuration Files

Each set type has its own JSON configuration file that defines the complete evaluation flow from level 1 to level 12. This approach provides clarity and allows each set to follow its unique evaluation path.

### JSON Structure

```javascript
{
  "setName": "SetType",
  "hardRequirement": {
    "check": "checkFunctionName",
    "failResult": "S"  // What happens if hard requirement not met
  },
  "evaluation": {
    "dot_5": {  // Mod tier
      "grey": {  // Mod color/rarity
        "level_1": [  // Evaluation at level 1
          { check: "checkFunction", result: "S" },  // If check fails, result is applied
          { check: "checkFunction2", next: "branch_name" },  // If check passes, go to branch
          { check: "default", result: "LV", target: 3 }  // Default action
        ],
        "level_3": [
          // Checks for level 3
        ],
        "branch_name": [  // Named branch for conditional logic
          { check: "specialCheck", params: { min: 4 }, result: "S" },
          { check: "default", result: "RETURN" }  // Return to main flow
        ]
      },
      "green": {
        // Green mod evaluation
      }
      // ... other colors
    },
    "dot_6": {
      // 6-dot mod evaluation
    }
  }
}
```

### Configuration Elements

#### Check Structure
```javascript
{
  check: "functionName",           // Required: Function to execute
  params: { key: value },         // Optional: Parameters for the function
  store: "variableName",          // Optional: Store result for later use
  use: "variableName",            // Optional: Use previously stored value
  result: "X",                    // Optional: Result if check fails
  next: "branchName",             // Optional: Branch to follow if check passes
  target: 9                       // Optional: For LV result, which level to go to
}
```

#### Result Codes
- `S` = SELL - Remove mod from inventory
- `K` = KEEP - Keep but don't invest further
- `SL` = SLICE - Upgrade/slice the mod
- `CO` = CHECK OPTIMIZER - Check if assigned by optimizer
- `LV` = LEVEL UP - Continue to target level
- `RETURN` = Return to previous flow

#### Execution Logic
1. Checks execute in order within each level
2. If a check **fails** → Apply its `result` and stop
3. If a check **passes** → Continue to next check
4. `default` check always passes and provides fallback
5. `next` creates a branch to a named section
6. `store` saves values for use by later checks

### Example: Speed Set Configuration

```javascript
{
  "setName": "Speed",
  "hardRequirement": {
    "check": "checkHasSpeed",
    "failResult": "S"
  },
  "evaluation": {
    "dot_5": {
      "grey": {
        "level_1": [
          { check: "checkHasSpeed", result: "S" },
          { check: "default", result: "LV", target: 9 }
        ],
        "level_9": [
          { check: "checkHasSpeed", result: "S" },
          { check: "checkIsSpeedArrow", next: "speed_arrow_check" },
          { check: "identifyDominantGroup", store: "dominantGroup" },
          { check: "calculateCoherence", params: { use: "dominantGroup" }, store: "coherence" },
          { check: "checkCoherenceThreshold", params: { min: 50 }, result: "S" },
          { check: "default", result: "LV", target: 12 }
        ],
        "speed_arrow_check": [
          { check: "checkHasSecondarySpeed", next: "check_speed_rolls" },
          { check: "default", result: "RETURN" }
        ],
        "check_speed_rolls": [
          { check: "checkSpeedRollsHigh", params: { min: 4 }, result: "S" },
          { check: "default", result: "RETURN" }
        ],
        "level_12": [
          { check: "checkAllSecondariesVisible", next: "final_evaluation" },
          { check: "default", result: "K" }
        ],
        "final_evaluation": [
          { check: "calculateCoherence", store: "finalCoherence" },
          { check: "checkCoherenceThreshold", params: { min: 75, use: "finalCoherence" }, next: "roll_quality" },
          { check: "checkCoherenceThreshold", params: { min: 50, use: "finalCoherence" }, result: "K" },
          { check: "default", result: "S" }
        ],
        "roll_quality": [
          { check: "identifySynergisticStats", store: "synergisticStats" },
          { check: "checkHasTerribleRolls", params: { use: "synergisticStats" }, result: "S" },
          { check: "checkHasGreatRolls", params: { use: "synergisticStats" }, result: "SL" },
          { check: "default", result: "K" }
        ]
      }
      // ... other colors follow similar pattern
    }
  }
}
```

### Validation Requirements

Each set configuration should include:

1. **All mod colors**: grey, green, blue, purple, gold
2. **All evaluation levels** based on color:
   - Grey: 1, 3, 6, 9, 12
   - Green: 1, 3, 6, 9, 12  
   - Blue: 1, 3, 6, 9, 12
   - Purple: 1, 3, 6, 9, 12
   - Gold: 1, 3, 6, 9, 12
3. **Required check types**:
   - Hard requirement check (for Speed/Tenacity sets)
   - Primary alignment check (for Arrow/Triangle/Cross)
   - Synergy counting
   - 2+ rule application (for regular sets)
   - Efficiency calculation
   - Roll quality evaluation
   - Perfect cohesion check (at level 12 for applicable sets)

### Set-Specific Configuration Notes

#### Speed Sets
- Must check for speed at every level
- Use coherence scoring instead of synergy counting
- Special handling for speed arrows with secondary speed

#### Offensive Sets (Offense, Critical Chance, Critical Damage)
- Share similar configuration with offensive stat focus
- Apply 2+ rule for Health/Protection conditionals
- Check perfect cohesion at full reveal

#### Defensive Sets (Health, Defense)  
- Share similar configuration with defensive stat focus
- Apply 2+ rule for Speed conditional
- Check perfect cohesion at full reveal

#### Tenacity Sets
- Hard requirement check for Tenacity%
- Strong preference for Tenacity% on Cross
- Otherwise follows defensive set pattern

#### Potency Sets
- Preference for Potency% on Cross (not required)
- More flexible evaluation
- Follows offensive pattern with modifications

---

## Overview

This system evaluates mods based on synergy between set type, primary stats, and secondary stats. The goal is to identify mods worth upgrading by calculating the probability that future rolls will enhance useful stats.

### Key Principle
**Every mod upgrade can roll into any visible secondary stat. Non-synergistic stats represent wasted upgrade potential.**

---

## Core Definitions

### Stat Categories

#### True Synergy
Stats that directly support the set's primary purpose. These are ALWAYS valuable for the set type.

#### Conditional Stats
Stats that become acceptable ONLY when the 2+ Rule is satisfied. Otherwise, they count as non-synergistic.

#### Non-Synergistic
Stats that don't match the set's purpose and will waste rolls if upgraded.

### The 2+ Rule
⚠️ **Critical Rule**: When a mod has 2 or more TRUE SYNERGY stats in its secondaries, ALL conditional stats automatically become acceptable.

### Cohesion Groups
- **Offensive**: Speed, Offense, Offense%, Critical Chance%, Critical Damage%, Potency%
- **Defensive**: Health, Health%, Defense, Defense%, Protection, Protection%, Tenacity%

### Perfect Cohesion
When ALL 4 secondary stats belong to the same cohesion group (either all offensive or all defensive).

### Roll Quality Standards
⚠️ **CRITICAL**: Only evaluate rolls on synergistic stats (true synergies + conditionals if 2+ rule met). COMPLETELY IGNORE rolls on non-synergistic stats.

#### Individual Roll Standards
- **Speed**: Poor=3, Good=4, Excellent=5-6
- **Offense%**: Poor<0.4%, Good=0.4-0.49%, Excellent≥0.5%
- **Health**: Poor<300, Good=400-499, Excellent≥500
- *(See complete table in appendix)*

#### Roll Quality Decisions
- **Multiple poor rolls on synergistic stats** → SELL
- **Mixed good/poor rolls** → KEEP (don't invest more)
- **Mostly excellent rolls** → SLICE (worth upgrading)

---

## Evaluation Order

### Phase 1: Set Type Routing
```
START → Identify Set Type → Route to Set-Specific Evaluation
         ├── Speed Set → Speed Evaluation Path
         ├── Tenacity Set → Tenacity Evaluation Path  
         ├── Potency Set → Potency Evaluation Path
         └── Regular Sets → Standard Evaluation Path
             (Offense, Critical Chance, Critical Damage, Health, Defense)
```

### Phase 2: Set-Specific Evaluation
Each set follows its own rules (detailed in next section)

### Phase 3: Convergence
All paths converge at:
1. Roll Quality Check (only on synergistic stats)
2. Final Decision
3. Perfect Cohesion Check (if SELL decision)

---

## Set-Specific Rules

### 🔵 Speed Sets

#### ⛔ HARD REQUIREMENT
Must have Speed stat (primary OR secondary). No speed = immediate SELL.

#### Special Rules
1. **Speed Arrow with Speed Secondary**: Must have HIGH speed rolls (4-6). Low rolls (3) = major red flag
2. **Flexible Synergy**: Accepts ANY coherent stat group as long as speed exists
3. **No Primary Requirements**: Any primary works IF speed exists in secondaries

#### Evaluation Flow
1. Check for speed → ⛔ No speed = SELL
2. If Arrow with speed secondary → Check roll quality
3. Identify dominant cohesion group (offensive/defensive/mixed)
4. Calculate coherence score
5. Decision based on coherence

---

### 🔴 Offensive Sets (Offense, Critical Chance, Critical Damage)

#### Primary Preferences (not requirements)
- **Arrow**: Speed, Offense%, Critical Chance%, Accuracy%
- **Triangle**: Critical Damage%, Offense%, Critical Chance%
- **Cross**: Offense%, Potency%

#### True Synergy Stats
- Speed (always - damage dealers need turn order)
- Offense (flat)
- Offense%
- Critical Chance%

#### Conditional Stats (require 2+ rule)
- Health (flat)
- Protection (flat)

#### Evaluation Flow
1. Check primary alignment → Note if misaligned but continue
2. Count true synergy secondaries
3. If ≥2 true synergies → Apply 2+ rule (conditionals become OK)
4. Calculate efficiency: (true + conditional) / total stats
5. Check roll quality on synergistic stats only

---

### 🟢 Defensive Sets (Health, Defense)

#### Primary Preferences (not requirements)
- **Arrow**: Speed, Health%, Protection%, Defense%, Critical Avoidance%
- **Triangle**: Health%, Protection%, Defense%, Critical Avoidance%
- **Cross**: Health%, Protection%, Defense%

#### True Synergy Stats
- Health (flat)
- Health%
- Defense (flat)
- Defense%
- Protection (flat)
- Protection%

#### Conditional Stats (require 2+ rule)
- Speed

#### Evaluation Flow
Same as Offensive sets but with defensive stat focus

---

### 🟣 Tenacity Sets

#### ⛔ HARD REQUIREMENT
Must have Tenacity% (primary OR secondary). No Tenacity% = immediate SELL.

#### Primary Preferences
- **Cross**: STRONGLY prefer Tenacity% (only slot where possible)
- Others: Same as Defensive sets

#### True Synergy Stats
- Tenacity%
- All defensive stats (Health/Defense/Protection in all forms)

#### Conditional Stats (require 2+ rule)
- Speed

---

### 🟡 Potency Sets

#### Primary Preferences (strong preference, not requirement)
- **Cross**: Potency% (strongly preferred - only slot where possible)
- **All slots**: Also like Offense%, Protection%

#### True Synergy Stats
- Potency%
- Offense%
- Protection%

#### Conditional Stats (require 2+ rule)
- Speed
- Offense (flat)
- Protection (flat)

#### Special Note
More flexible than other sets - can work without Potency% if has good offensive stats

---

## Decision Categories

### SLICE (Green - Upgrade)
- Passed all elimination checks
- Good efficiency + good roll quality
- Worth investing resources to upgrade

### KEEP (Yellow - Hold)
- Efficiency ≥50% (2+ synergistic stats)
- Decent roll quality on synergistic stats
- Not worth more investment but don't sell

### CHECK OPTIMIZER (Blue)
- Perfect Cohesion despite set mismatch
- Check if mod optimizer assigns to any character
- If not assigned after reasonable time → SELL

### SELL (Red)
- Failed hard requirements (Speed/Tenacity)
- Efficiency ≤25% (0-1 synergistic stats)
- Poor roll quality on synergistic stats
- Did not pass elimination checks

---

## Complete Examples

### Example 1: Speed Set Success Path

**Level 1 (Blue Mod)**
```
Set: Speed
Primary: Defense% (normally bad, but speed set doesn't care)
Secondaries: Speed (4), Offense% (0.45%)
Hidden: [Unknown], [Unknown]
```

✅ **Evaluation**: Has speed → Continue
- Current efficiency: 2/2 offensive = 100%

**Level 3 Reveals**: Critical Chance% (1.8%)
```
Visible: Speed (4), Offense% (0.45%), CC% (1.8%)
Hidden: [Unknown]
```
- Current efficiency: 3/3 offensive = 100%

**Level 6 Reveals**: Health (267)
```
All Visible: Speed (4), Offense% (0.45%), CC% (1.8%), Health (267)
```
- Efficiency: 3/4 offensive, 1/4 out of group = 75% coherence
- **Decision**: KEEP (good coherence + has speed)

---

### Example 2: Tenacity Set Fail Path

**Level 1 (Purple Mod)**
```
Set: Tenacity
Primary: Offense% (cross)
Secondaries: Speed (5), Offense (42), CC% (2.1%)
Hidden: [Unknown]
```

⛔ **Evaluation**: NO TENACITY% visible yet → Continue but red flag

**Level 3 Reveals**: Defense (8)
```
All Visible: Speed (5), Offense (42), CC% (2.1%), Defense (8)
```

⛔ **Final Evaluation**: NO TENACITY% anywhere = **IMMEDIATE SELL**
- Doesn't matter that it has good stats
- Hard requirement not met

---

### Example 3: Perfect Cohesion Save

**Level 12 (Gold Mod - Fully Upgraded)**
```
Set: Defense
Primary: Offense% (triangle) - Wrong for set
Secondaries: 
- Speed (15) - 3 rolls
- Offense (42) - 1 roll  
- CC% (5.8%) - 3 rolls
- Offense% (1.9%) - 4 rolls
```

**Standard Evaluation**:
- Primary misaligned ⚠️
- True synergies: 0 (no defensive stats)
- Efficiency: 0%
- Initial decision: SELL

**Perfect Cohesion Check**:
- All 4 secondaries are offensive (Speed, Offense, CC%, Offense%)
- Perfect offensive cohesion despite defensive set
- **Final Decision**: CHECK OPTIMIZER

---

## Edge Cases

### 🤔 Speed Set with Speed Primary (Arrow)
- ✅ Requirement met (has speed)
- Still evaluate secondaries for coherent group
- Can be KEEP even with no speed in secondaries

### 🤔 High Rolls on Non-Synergistic Stats
- Ignore completely in evaluation
- Only roll quality on synergistic stats matters
- Example: +25 speed on Defense set without 2+ rule = still counts as non-synergistic

### 🤔 Conditional Stats Before 2+ Rule
- Count as non-synergistic until 2+ rule met
- Can change evaluation as mod reveals more secondaries
- Example: Speed on Defense set is bad UNTIL 2 defensive secondaries exist

### 🤔 Mixed Cohesion Groups
- Lower value than pure offensive or defensive
- Example: 2 offensive + 2 defensive stats = poor cohesion
- Exception: If meets set requirements well (like Potency set with Potency% + mixed stats)

---

## Progressive Evaluation

### Evaluation Triggers
- **L1**: Initial evaluation (varies by color)
- **L3**: First new secondary revealed
- **L6**: Second new secondary revealed  
- **L9**: Existing stats get rolls
- **L12**: Existing stats get rolls

### Re-evaluation Process
1. Return to set-specific evaluation
2. Re-count synergies with new information
3. Re-apply 2+ rule if applicable
4. Update efficiency calculation
5. Make new decision

### Important Notes
- A mod can improve from SELL to KEEP as secondaries reveal
- A mod cannot get worse (revealed stats don't disappear)
- Perfect Cohesion only checked when all 4 visible

---

## Appendix: Configuration Structure

```javascript
{
  "Speed": {
    "hardRequirement": "speed",
    "requirementType": "must_exist",
    "specialRules": ["high_speed_on_arrow_secondary"],
    "synergy": "flexible_coherent_group"
  },
  
  "Offense": {
    "primaryPreferences": {
      "arrow": ["Speed", "Offense%", "Critical Chance%", "Accuracy%"],
      "triangle": ["Critical Damage%", "Offense%", "Critical Chance%"],
      "cross": ["Offense%", "Potency%"]
    },
    "trueSynergy": ["Speed", "Offense", "Offense%", "Critical Chance%"],
    "conditional": ["Health", "Protection"],
    "cohesionGroup": "offensive"
  },
  
  "Tenacity": {
    "hardRequirement": "tenacity%",
    "requirementType": "must_exist",
    "primaryPreferences": {
      "cross": ["Tenacity%"] // Strongly preferred
    },
    "trueSynergy": ["Tenacity%", "Health", "Health%", "Defense", "Defense%", "Protection", "Protection%"],
    "conditional": ["Speed"],
    "cohesionGroup": "defensive"
  }
  // ... etc
}
```

---

## Critical Reminders

1. **Hard Requirements** (Speed/Tenacity) = immediate SELL if not met
2. **2+ Rule** transforms conditional stats - always check this
3. **Roll Quality** only on synergistic stats (including conditionals)
4. **Perfect Cohesion** is last-chance save for failed mods
5. **Progressive Nature** means decisions can improve but not worsen