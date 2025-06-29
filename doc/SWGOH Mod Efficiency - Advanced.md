# Advanced Mod Evaluation System - Complete Documentation

## Overview

This system identifies valuable mods by evaluating synergy between set type, primary stats, and secondary stats. The core purpose is to **minimize wasted rolls on non-synergistic stats**.

## Core Principle: Roll Efficiency

**Every non-synergistic secondary stat represents a 25% chance that future rolls will be wasted.**

Examples:
- 4 synergistic secondaries = 100% chance rolls go to useful stats
- 3 synergistic secondaries = 75% chance rolls go to useful stats  
- 2 synergistic secondaries = 50% chance rolls go to useful stats
- 1 synergistic secondary = 25% chance rolls go to useful stats

This is why identifying synergy early saves credits - you avoid investing in mods likely to waste rolls.

## Core Concepts

### 1. Synergy Classification

Every stat is either:
- **True Synergy**: Stats that directly support the set's primary purpose
- **Conditional**: Stats that become valuable when the 2+ Rule is met (Health on offensive sets, Speed on defensive sets)

If a stat is neither true synergy nor conditional (or conditional without 2+ rule met), it's automatically non-synergistic.

### 2. The 2+ Rule

**When a mod has 2 or more true synergy matches among its SECONDARY stats, conditional stats automatically become acceptable.**

This rule recognizes that once a mod has strong core synergy, support stats like Health (on offensive sets) or Speed (on defensive sets) add value rather than dilute the mod.

### 3. Progressive Evaluation

Mods reveal secondary stats at specific levels based on their starting color:
- **Gray**: 0 visible secondaries at L1
- **Green**: 1 visible secondary at L1
- **Blue**: 2 visible secondaries at L1, 3rd at L3, 4th at L6
- **Purple**: 3 visible secondaries at L1, 4th at L3
- **Gold**: All 4 visible secondaries at L1

## Evaluation Logic Flow

### Step-by-Step Process

1. **Check Set Type** - Identify which set the mod belongs to
2. **Evaluate Primary Stat** (for slots with variable primaries)
   - Must align with set type (see Primary Stat Rules below)
   - Wrong primary = immediate red flag (except Speed sets)
3. **Count True Synergy Secondaries** - How many secondaries directly support the set
4. **Apply 2+ Rule** - If 2+ true synergies exist, conditional stats become acceptable
5. **Calculate Total Score** - Primary fit + true synergies + acceptable conditionals

## Set-Specific Synergy Rules

### Speed Sets

**Core Requirement**: MUST have Speed stat (primary or secondary)

**Synergy Flexibility**: Speed sets accept ANY coherent stat group as long as speed is present
- Speed + Offensive stats (Offense, CC%, CD%) = Offensive speed set
- Speed + Defensive stats (Defense%, Health%, Protection%) = Defensive speed set
- Speed + Utility stats (Potency%, Tenacity%) = Utility speed set

**Key Point**: The most flexible set type - focuses on speed first, then any coherent synergy

### Offensive Sets (Offense, Critical Damage, Critical Chance)

**True Synergy Stats**:
- Speed (always - damage dealers need to go first)
- Offense (flat)
- Offense%
- Critical Chance%
- Critical Damage%

**Conditional Stats**:
- Health (becomes acceptable when 2+ true synergy stats present)
- Protection (becomes acceptable when 2+ true synergy stats present)

**Preferred Primaries**: Offense%, Critical Damage% (triangles), Critical Chance% (less important now but viable)

### Defensive Sets (Health, Defense)

**True Synergy Stats**:
- Health (flat)
- Health%
- Defense (flat)
- Defense%
- Protection (flat)
- Protection%

**Conditional Stats**:
- Speed (becomes acceptable when 2+ true synergy stats present)

**Preferred Primaries**: Health%, Protection%, Defense%, Crit Avoidance (arrows)

### Potency Sets

**True Synergy Stats**:
- Potency%
- Speed (critical - debuffs need to land first)
- Offense (flat)
- Offense%

**Conditional Stats**:
- Health (becomes acceptable when 2+ true synergy stats present)
- Protection (becomes acceptable when 2+ true synergy stats present)

**Preferred Primaries**: Potency%, Offense%, Health%, Protection%

### Tenacity Sets

**True Synergy Stats**:
- Tenacity%
- Health (flat)
- Health%
- Defense (flat)
- Defense%
- Protection (flat)
- Protection%

**Conditional Stats**:
- Speed (becomes acceptable when 2+ true synergy stats present)

**Preferred Primaries**: Tenacity%, Health%, Protection%, Defense%

## Primary Stat Rules

### Slots with Fixed Primaries
- **Square**: Always Offense (flat) - no evaluation needed
- **Diamond**: Always Defense (flat) - no evaluation needed

### Slots with Variable Primaries

#### Arrow
- **Speed Sets**: Any primary acceptable IF speed in secondaries
- **Offensive Sets**: Speed, Offense%, Critical Chance%, Accuracy%
- **Defensive Sets**: Speed, Health%, Protection%, Defense%, Critical Avoidance%
- **Potency Sets**: Speed, Offense%, Accuracy%, Health%, Protection%
- **Tenacity Sets**: Speed, Health%, Protection%, Defense%, Critical Avoidance%

#### Triangle  
- **Speed Sets**: Any primary acceptable IF speed in secondaries
- **Offensive Sets**: Critical Damage%, Offense%, Critical Chance%
- **Defensive Sets**: Health%, Protection%, Defense%, Critical Avoidance%
- **Potency Sets**: Critical Damage%, Offense%, Health%, Protection%
- **Tenacity Sets**: Health%, Protection%, Defense%, Critical Avoidance%

#### Cross
- **Speed Sets**: Any primary acceptable IF speed in secondaries
- **Offensive Sets**: Offense%, Potency%
- **Defensive Sets**: Health%, Protection%, Defense%, Tenacity%
- **Potency Sets**: Potency%, Offense%, Health%, Protection%
- **Tenacity Sets**: Tenacity%, Health%, Protection%, Defense%

#### Circle
- **Speed Sets**: Any primary acceptable IF speed in secondaries
- **Offensive Sets**: Health%, Protection%
- **Defensive Sets**: Health%, Protection%
- **Potency Sets**: Health%, Protection%
- **Tenacity Sets**: Health%, Protection%

**Key Rule**: If primary doesn't match set type (e.g., Defense% arrow on Offense set), the mod is severely compromised UNLESS it's a Speed set with speed secondary.

## Roll Quality Requirements

After passing synergy evaluation, assess the quality of individual stat rolls:

### Speed
- **Excellent**: 5
- **Good**: 4
- **Poor**: 3 (too many 3s indicate a wasted mod)
- **Target**: 4-5 per roll

### Offensive Stats
- **Offense (flat)**: 35+ per roll (excellent: 40+)
- **Offense%**: 0.4%+ per roll (excellent: 0.5%+)
- **Critical Chance%**: 1.75-2% per roll
- **Critical Damage%**: Not typically a secondary stat

### Defensive Stats
- **Defense (flat)**: 7+ per roll (excellent: 8+)
- **Defense%**: 1.2-1.5% per roll
- **Health (flat)**: 400+ per roll (excellent: 500+)
- **Health%**: 0.9-1% per roll
- **Protection (flat)**: 800+ per roll (excellent: 1000+)
- **Protection%**: 2% per roll

### Utility Stats
- **Potency%**: 1.75-2% per roll
- **Tenacity%**: 1.75-2% per roll

## Evaluation Examples

### Example 1: Offensive Set Success

**Critical Damage Set Mod (Blue, Level 1)**
- Primary: Critical Damage%
- Visible Secondaries: Speed (5), Offense (42)
- **Analysis**: 2 true synergy matches already → Health will be acceptable if it appears

**Level 3** - Reveals: Health (450)
- **Analysis**: Health is acceptable (2+ rule already met) → Continue

**Level 6** - Reveals: Offense% (0.45%)
- **Final Evaluation**:
  - True Synergy: Speed, Offense, Offense% (3 matches)
  - Acceptable: Health (due to 2+ rule)
  - Mismatches: 0
- **Verdict**: EXCELLENT - Keep and upgrade

### Example 2: Understanding Roll Waste

**Offense Set Mod (Purple, Level 1)**
- Primary: Offense%
- Visible Secondaries: Speed (4), Defense (8), Tenacity% (1.9%)
- **Analysis**: 
  - Only 1 true synergy (Speed)
  - 2 non-synergistic stats (Defense, Tenacity%)
  - Current roll efficiency: 33% chance rolls go to Speed
  - 67% chance future rolls are wasted

**Level 3** - Reveals: Critical Chance% (1.9%)
- **Final Evaluation**:
  - True Synergy: Speed, CC% (2 stats)
  - Non-synergistic: Defense, Tenacity% (2 stats)
  - Roll efficiency: 50% chance rolls go to useful stats
- **Verdict**: BORDERLINE - 50% waste potential is high risk

### Example 3: Clear Failure

**Speed Set Mod (Blue, Level 1)**
- Primary: Defense%
- Visible Secondaries: Tenacity% (2.1%), Potency% (1.8%)
- **Analysis**: NO SPEED - Fatal flaw for speed set
- **Verdict**: SELL immediately - Speed sets MUST have speed

## Decision Framework

### Roll Efficiency Thresholds:
- **75-100% efficiency** (3-4 synergistic stats): Excellent - high priority to upgrade
- **50-67% efficiency** (2 synergistic stats): Acceptable - consider roll quality
- **25-33% efficiency** (1 synergistic stat): Poor - usually sell
- **0% efficiency** (0 synergistic stats): Immediate sell

### Speed Set Exception:
- Must have Speed stat regardless of efficiency calculation
- No speed = immediate sell

### Primary Stat Misalignment:
- Wrong primary for set type severely reduces mod value
- Exception: Speed sets can work with any primary if speed is secondary

## Important Notes

1. **Roll Efficiency is Key**: Every non-synergistic stat = 25% chance to waste future rolls
2. **No Character-Specific Evaluation**: This system evaluates mods generically
3. **Context Matters**: Conditional stats become valuable with the 2+ rule
4. **Progressive Nature**: A mod's efficiency can improve as secondaries are revealed
5. **Primary First**: Always check primary stat alignment before evaluating secondaries
6. **Synergy Before Quality**: Check stat relationships before roll values

## Implementation Checklist

When implementing this system:

1. **Map all stat synergies** per set type (including conditional stats)
2. **Implement the 2+ rule** checker that upgrades conditional stats
3. **Create progressive evaluation** that re-assesses at each level milestone
4. **Add roll quality scoring** for mods that pass synergy checks
5. **Define clear thresholds** for keep/sell decisions
6. **Track evaluation history** to see how assessments change with new reveals

## Summary Table

| Set Type | True Synergy Stats | Conditional Stats | Key Requirements |
|----------|-------------------|-------------------|------------------|
| Speed | Any + Speed | Varies by synergy type | MUST have Speed |
| Offense/CC/CD | Speed, Off, Off%, CC%, CD% | Health, Protection | Speed is synergy |
| Health/Defense | Health, Health%, Def, Def%, Prot, Prot% | Speed | Health is synergy |
| Potency | Pot%, Speed, Off, Off% | Health, Protection | Speed critical |
| Tenacity | Ten%, Health, Health%, Def, Def%, Prot, Prot% | Speed | Defensive focus |

This system provides a methodical approach to mod evaluation that maximizes resource efficiency while identifying truly valuable mods for your roster.