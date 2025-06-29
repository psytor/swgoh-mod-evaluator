# SWGOH Mod Evaluation System - Complete Guide

## Executive Summary

This document outlines a comprehensive mod evaluation system that combines mathematical efficiency scoring with contextual awareness. The system evaluates mods based on how well they achieved their statistical potential while considering the relationships between mod sets, primary stats, and secondary stats.

## System Overview

### Core Principles
1. **Efficiency-Based**: Evaluate mods on how well they used their available rolls
2. **Context-Aware**: Consider relationships between set/primary/secondaries
3. **Flexible Thresholds**: Different requirements by mod color/quality
4. **Transparent Scoring**: Clear explanation of why mods are kept/sold

### Key Innovation
Moving beyond simple "Speed ≥ X" rules to a nuanced system that can identify hidden gems while maintaining speed as the highest priority.

---

## Part 1: Understanding Mod Mechanics

### 1.1 Mod Basics

Mods are equipment items enhancing character stats. Each character can equip six mods.

Key attributes of a mod include:
- Primary Stat
- Secondary Stats (up to 4)
- Level (1-15)
- Quality/Color (Grey, Green, Blue, Purple, Gold)

### 1.2 Mod Sets

The Mod Set determines the stat bonus characters get when they meet the required number of equipped pieces. The minimum increase is for sets where some/all pieces are not max level. The maximum increase is when all required mods are Level 15.

| Name and Stat | Required | Minimum | Maximum |
|---------------|----------|---------|---------|
| Critical Chance | 2 | 4% | 8% |
| Critical Damage | 4 | 15% | 30% |
| Defense | 2 | 12.5% | 25% |
| Health | 2 | 5% | 10% |
| Offense | 4 | 7.5% | 15% |
| Potency | 2 | 7.5% | 15% |
| Speed | 4 | 5% | 10% |
| Tenacity | 2 | 10% | 20% |

### 1.3 Mod Slots & Primary Stats

Six distinct mod slots exist, each with specific primary stat possibilities:

- **Square (Transmitter)**: Offense % (always)
- **Diamond (Processor)**: Defense % (always)
- **Circle (Data-Bus)**: Health % or Protection %
- **Arrow (Receiver)**: Speed, Accuracy %, Critical Avoidance %, Health %, Protection %, Offense %, or Defense %
- **Triangle (Holo-Array)**: Critical Chance %, Critical Damage %, Health %, Protection %, Offense %, or Defense %
- **Cross (Multiplexer)**: Tenacity %, Potency %, Health %, Protection %, Offense %, or Defense %

### 1.4 Primary/Secondary Exclusivity

**Critical Rule**: A stat type present as a mod's primary stat cannot also appear as a secondary stat on the same mod.
- Example: Speed Arrow cannot have Speed secondary
- Example: Offense % Square cannot have Offense % secondary

### 1.5 Mod Levels & Primary Stat Maxing

- Mods level from 1 to 15
- Leveling increases the primary stat's value, reaching its maximum at Level 15

### 1.6 Mod Quality (Color) & Initial Secondaries

The mod's color upon acquisition determines the number of visible secondary stats at Level 1:
- **Grey**: 0 secondaries
- **Green**: 1 secondary
- **Blue**: 2 secondaries
- **Purple**: 3 secondaries
- **Gold**: 4 secondaries

### 1.7 Leveling: Revealing Stats & Applying Buffs

Leveling a mod to 12 reveals all four secondary stats and applies stat increases (buffs) at levels 3, 6, 9, and 12. The action at each milestone depends on the starting color:

- **Grey (0 Start)**: Reveals at L3, L6, L9, L12. (0 buffs total)
- **Green (1 Start)**: Reveals at L3, L6, L9. Buffs at L12. (1 buff total)
- **Blue (2 Start)**: Reveals at L3, L6. Buffs at L9, L12. (2 buffs total)
- **Purple (3 Start)**: Reveals at L3. Buffs at L6, L9, L12. (3 buffs total)
- **Gold (4 Start)**: Buffs at L3, L6, L9, L12. (4 buffs total)

Buffs increase a randomly selected existing secondary stat.

### 1.8 Secondary Stat Roll Ranges & Potential

Each secondary stat, when revealed or buffed, receives a value rolled within a specific range.

| Secondary Stat | Min Initial Roll | Max Initial Roll | Theoretical Max (Initial + 4 Buffs) |
|----------------|------------------|------------------|-------------------------------------|
| Critical Chance % | 1.125% | 2.25% | 11.25% |
| Defense | 4.9 | 9.8 | 49 |
| Defense % | 0.85% | 1.70% | 8.50% |
| Health | 214.3 | 428.6 | 2143 |
| Health % | 0.563% | 1.125% | 5.625% |
| Offense | 22.8 | 45.6 | 228 |
| Offense % | 0.281% | 0.563% | 2.815% |
| Potency % | 1.125% | 2.25% | 11.25% |
| Protection | 415.3 | 830.6 | 4153 |
| Protection % | 1.125% | 2.25% | 11.25% |
| Speed | 3 | 6 | 30 |
| Tenacity % | 1.125% | 2.25% | 11.25% |

### 1.9 Mod Slicing

Slicing upgrades a mod's color/quality:
- Grey → Green
- Green → Blue
- Blue → Purple
- Purple → Gold

When sliced, a mod simply becomes the new color and is evaluated using that color's rules. There are no special considerations for previously sliced mods.

---

## Part 2: The Efficiency Scoring System

### Base Efficiency Formula
```
Efficiency Score = Σ (Stat Value / Max Possible Value) × Stat Weight
```

### Stat Weights and Maximum Values

| Stat | Weight | Max Possible | Justification |
|------|--------|--------------|---------------|
| Speed | 100 | 30 | Universal value, affects turn order |
| Offense (flat) | 40 | 228 | Direct damage increase |
| Offense % | 30 | 2.815% | Multiplicative damage |
| Critical Chance % | 25 | 11.25% | Enables critical hits |
| Critical Damage % | 25 | 11.25% | Multiplies crit damage |
| Potency % | 20 | 11.25% | Lands debuffs |
| Tenacity % | 20 | 11.25% | Resists debuffs |
| Health % | 15 | 5.625% | Survivability (% scaling) |
| Protection % | 15 | 11.25% | Survivability (% scaling) |
| Defense % | 10 | 8.50% | Damage mitigation |
| Health (flat) | 5 | 2143 | Minimal late-game impact |
| Protection (flat) | 5 | 4153 | Minimal late-game impact |
| Defense (flat) | 3 | 49 | Least valuable stat |

---

## Part 3: Context Multipliers

### 3.1 Synergy System (×1.0 to ×1.5)

Synergy evaluates how well the mod's components work together.

**Synergy Calculation considers:**
1. Set-Secondary alignment
2. Primary-Secondary alignment  
3. Set-Primary alignment (penalty if mismatched)

#### Set-Based Synergy Groups

| Mod Set | Highly Synergistic Secondaries | Moderately Synergistic | Anti-Synergistic |
|---------|--------------------------------|------------------------|------------------|
| Speed | Speed, Offense, CC% | Potency%, Tenacity% | None |
| Offense | Offense, CC%, CD%, Speed | Potency% | Defense, Health |
| Critical Damage | CC%, Offense, Speed | CD%, Offense % | Defense, Health |
| Critical Chance | CD%, Offense, Speed | CC%, Offense % | Defense, Health |
| Potency | Potency%, Speed, Offense | Health, Protection | Defense |
| Tenacity | Tenacity%, Speed, Defense | Health, Protection | Offense, Crit |
| Health | Health, Protection, Defense | Tenacity%, Speed | Offense, Crit |
| Defense | Defense, Health, Protection | Tenacity%, Speed | Offense, Crit |

#### Primary Stat Synergy (when available choices exist)

| Primary Stat | Synergistic Secondaries | Anti-Synergistic |
|--------------|------------------------|------------------|
| Offense % | Offense, CC%, CD%, Speed | Defense, Health |
| Defense % | Defense, Health, Protection, Speed | Offense, Crit |
| Health/Protection % | Health, Protection, Defense, Speed | Offense, Crit |
| Critical Damage % | CC%, Offense, Speed | Defense, Health |
| Potency % | Potency%, Speed, Offense | Defense |
| Tenacity % | Tenacity%, Speed, Defense | Offense, Crit |

#### Synergy Multiplier Calculation

**Step 1: Count Synergistic Relationships**
- Each secondary can be synergistic with set AND primary
- Double synergy (matches both) counts as 1.5
- Anti-synergy subtracts 0.5

**Step 2: Apply Multiplier**
- 4+ synergy points: ×1.5
- 3 synergy points: ×1.4
- 2 synergy points: ×1.3
- 1 synergy point: ×1.2
- 0 synergy points: ×1.0
- Negative synergy: ×0.9

### 3.2 Roll Concentration (×1.0 to ×1.3)

Rewards mods that focused rolls into valuable stats.

```
Concentration = (Top 2 Stat Scores) / (Total Score)
```

- 80%+ concentration: ×1.3
- 70%+ concentration: ×1.2
- 60%+ concentration: ×1.1
- <60% concentration: ×1.0

### 3.3 Set-Primary Alignment (×0.9 to ×1.1)

Evaluates if the primary stat makes sense for the mod set.

| Alignment | Multiplier | Example |
|-----------|------------|---------|
| Perfect | ×1.1 | Offense set + Offense % primary |
| Good | ×1.0 | Speed set + any primary |
| Mismatched | ×0.9 | Offense set + Defense % primary |

---

## Part 4: Evaluation Rules by Mod Quality

### Leveling Checkpoints
- **Grey/Green**: Level to 9 (see 3+ secondaries)
- **Blue**: Level to 12 (see all 4 + buffs)
- **Purple/Gold**: Level to 12 (see all 4 + buffs)

### Quality-Specific Thresholds

| Mod Quality | Base Efficiency Required | Speed Override | Offense Override |
|-------------|-------------------------|----------------|------------------|
| Grey | 25% | Any speed | Offense ≥ 30 |
| Green | 30% | Any speed | Offense ≥ 40 |
| Blue | 35% | Speed ≥ 6 | Offense ≥ 70 |
| Purple | 45% | Speed ≥ 8 | Offense ≥ 90 |
| Gold | 55% | Speed ≥ 10 | Offense ≥ 100 |

### Universal Rules
- **Automatic Keep**: Total efficiency ≥ 70% (any color)
- **Automatic Favorite**: Speed ≥ 15 OR Efficiency ≥ 80%
- **Automatic Sell**: No speed AND no offense (except Gold with perfect synergy)

---

## Part 5: Implementation Examples

### Example 1: Offense Set Blue Mod

**Mod Details:**
- Set: Offense
- Primary: Offense % (on Triangle)
- Level: 12
- Secondaries:
  - Speed: +6 (1 roll)
  - Offense: +68 (1 roll)
  - Defense %: +1.7%
  - Health: +428

**Evaluation:**
1. **Base Efficiency:**
   - Speed: (6/30) × 100 = 20.0
   - Offense: (68/228) × 40 = 11.9
   - Defense %: (1.7/8.5) × 10 = 1.7
   - Health: (428/2143) × 5 = 1.0
   - **Total: 34.6%**

2. **Synergy Analysis:**
   - Offense set + Speed secondary: +1
   - Offense set + Offense secondary: +1
   - Offense % primary + Speed: +1
   - Offense % primary + Offense: +1
   - Defense % is anti-synergistic: -0.5
   - **Total: 3.5 points → ×1.4**

3. **Set-Primary Alignment:**
   - Offense set + Offense % primary: Perfect → ×1.1

4. **Final Score:** 34.6% × 1.4 × 1.1 = **53.3%**

**Result: KEEP** (exceeds 35% Blue threshold)

### Example 2: Speed Set Gold Mod

**Mod Details:**
- Set: Speed
- Primary: Protection % (on Circle)
- Level: 12
- Secondaries:
  - Speed: +12 (2 rolls)
  - Offense: +91 (2 rolls)
  - Potency %: +2.25%
  - Defense: +9.8

**Evaluation:**
1. **Base Efficiency:**
   - Speed: (12/30) × 100 = 40.0
   - Offense: (91/228) × 40 = 16.0
   - Potency %: (2.25/11.25) × 20 = 4.0
   - Defense: (9.8/49) × 3 = 0.6
   - **Total: 60.6%**

2. **Synergy Analysis:**
   - Speed set + Speed secondary: +1
   - Speed set + Offense secondary: +1
   - Protection % primary + Speed: +1
   - **Total: 3 points → ×1.4**

3. **Roll Concentration:**
   - Top 2 stats = 56/60.6 = 92% → ×1.3

4. **Final Score:** 60.6% × 1.4 × 1.3 = **110.3%**

**Result: EXCEPTIONAL - FAVORITE**

---

## Conclusion

This system provides a comprehensive, mathematically-sound approach to mod evaluation that:
- Respects the "speed is king" philosophy while recognizing other valuable stats
- Considers the full context of set/primary/secondary relationships
- Remains transparent and adjustable
- Scales from beginner to endgame players

The efficiency-based scoring with context multipliers captures the nuance of mod quality while providing clear, actionable recommendations for every mod in a player's inventory. By combining the best aspects of both speed-focused and synergy-aware approaches, this system identifies both obvious keepers and hidden gems.