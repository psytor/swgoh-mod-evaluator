# SWGOH Mod Efficiency Calculation System Documentation

## Overview

This document describes the efficiency calculation system for Star Wars Galaxy of Heroes (SWGOH) mods. The system evaluates secondary stats using a position-based approach that avoids zero values while providing meaningful differentiation between mod quality.

## Core Philosophy

- **No zero values**: Even minimum rolls have value (especially for new players)
- **Clear differentiation**: Good mods should clearly stand out from bad ones
- **Dynamic calculation**: All values come from the API, no hardcoding
- **Future-ready**: System supports stat weighting for future enhancements

## Efficiency Formula

### Basic Formula
```
Efficiency = (current_position / total_positions) × 100%
```

### For Decimal Stats (e.g., Defense, Health%)
Use continuous positioning:
```
Efficiency = ((value - min) / (max - min)) × 100%
```

Then adjust to avoid 0% at minimum:
```
Adjusted Efficiency = (1 + (value - min) / (max - min) × (positions - 1)) / positions × 100%
```

Where positions = reasonable number of discrete values in the range

## API Data Extraction

### Decoding Values

All stat values in the API require decoding:

| Value Type | Division Factor | Example |
|------------|----------------|---------|
| Display values | ÷ 10,000 | "170000" → 17 |
| Flat stat bounds | ÷ 100,000 | "800000" → 8 |
| Percentage stat bounds | ÷ 1,000 | "1500" → 1.5% |

### Stat ID Mappings

| Stat ID | Stat Name | Type | Bound Divisor |
|---------|-----------|------|---------------|
| 1 | Health | Flat | 100,000 |
| 5 | Speed | Flat | 100,000 |
| 16 | Critical Damage % | Percentage | 1,000 |
| 17 | Potency % | Percentage | 1,000 |
| 18 | Tenacity % | Percentage | 1,000 |
| 28 | Protection | Flat | 100,000 |
| 41 | Offense | Flat | 100,000 |
| 42 | Defense | Flat | 100,000 |
| 48 | Offense % | Percentage | 1,000 |
| 49 | Defense % | Percentage | 1,000 |
| 53 | Critical Chance % | Percentage | 1,000 |
| 55 | Health % | Percentage | 1,000 |
| 56 | Protection % | Percentage | 1,000 |

### Display Formatting

- **Percentage stats**: Round to 2 decimal places, add % symbol
- **Flat stats**: Display as integers (round if needed)

## Implementation Examples

### Example 1: Speed (Integer Stat)

```json
{
  "stat": {
    "unitStatId": 5,
    "statValueDecimal": "90000"
  },
  "statRolls": 2,
  "statRollerBoundsMin": "300000",
  "statRollerBoundsMax": "600000"
}
```

**Calculation**:
1. Decode bounds: 300000 ÷ 100000 = 3, 600000 ÷ 100000 = 6
2. Decode value: 90000 ÷ 10000 = 9
3. Individual rolls from total: Could be 3+6, 4+5, etc.
4. Average roll: 9 ÷ 2 = 4.5
5. Efficiency: ~62.5% (between positions 2 and 3)

### Example 2: Defense (Decimal Stat)

```json
{
  "stat": {
    "unitStatId": 42,
    "statValueDecimal": "170000"
  },
  "statRolls": 2,
  "statRollerBoundsMin": "800000",
  "statRollerBoundsMax": "1600000",
  "roll": ["0.10597", "0.10735"],
  "unscaledRollValue": ["847760", "858800"]
}
```

**Calculation**:
1. Decode bounds: 800000 ÷ 100000 = 8, 1600000 ÷ 100000 = 16
2. Individual rolls: 847760 ÷ 100000 = 8.48, 858800 ÷ 100000 = 8.59
3. Roll 1 efficiency: (8.48 - 8) / (16 - 8) = 6%
4. Roll 2 efficiency: (8.59 - 8) / (16 - 8) = 7.375%
5. Average efficiency: ~6.7%

### Example 3: Critical Chance % (Percentage Stat)

```json
{
  "stat": {
    "unitStatId": 53,
    "statValueDecimal": "433"
  },
  "statRolls": 3,
  "statRollerBoundsMin": "1175",
  "statRollerBoundsMax": "2350"
}
```

**Calculation**:
1. Decode bounds: 1175 ÷ 1000 = 1.175%, 2350 ÷ 1000 = 2.35%
2. Decode value: 433 ÷ 10000 = 4.33%
3. Display: "4.34%" (rounded to 2 decimals)

## Efficiency Calculation Methods

### Method 1: Individual Roll Average
1. Calculate efficiency for each roll
2. Average all roll efficiencies
3. **Advantage**: Shows consistency of rolls

### Method 2: Total Value Efficiency
1. Calculate total min/max for all rolls
2. Compare total value against range
3. **Advantage**: Simpler calculation

**Note**: Both methods yield similar results. Choose based on implementation preference.

## Special Considerations

### 5-Dot vs 6-Dot Mods
- API automatically provides correct bounds
- No need to hardcode different values
- Example: Speed remains 3-6 for both rarities

### Multiple Rolls on Same Stat
- Maximum 5 rolls per stat (1 initial + 4 additional)
- Use `statRolls` field to determine number of rolls
- Calculate efficiency based on total rolls

### Future Enhancement: Stat Weighting
The system is designed to support stat importance weighting:
```
Weighted Efficiency = Base Efficiency × Stat Weight
```

Example weights (to be configured):
- Speed: 1.5× (most important)
- Offense %: 1.2×
- Defense: 0.8× (less important)

## Example Implementation Flow

```javascript
function calculateStatEfficiency(stat, bounds) {
  // 1. Decode values
  const min = bounds.min / getBoundDivisor(stat.unitStatId);
  const max = bounds.max / getBoundDivisor(stat.unitStatId);
  const value = stat.statValueDecimal / 10000;
  
  // 2. Calculate efficiency
  const efficiency = ((value - (min * stat.statRolls)) / 
                     ((max * stat.statRolls) - (min * stat.statRolls))) * 100;
  
  // 3. Apply positioning adjustment if needed
  // For integer stats, use discrete positioning
  // For decimal stats, use continuous positioning
  
  return efficiency;
}
```

## Advantages of This System

1. **Psychological Impact**: No mod gets 0%, maintaining player motivation
2. **Clear Differentiation**: Bad rolls (6-11%) vs good rolls (80-100%)
3. **Dynamic**: Adapts to game changes via API
4. **Scalable**: Works for any stat type or rarity
5. **Future-Proof**: Ready for stat weighting implementation

## Summary

This efficiency system provides meaningful mod evaluation that:
- Respects the value of all mods (no zeros)
- Clearly identifies quality differences
- Uses game data dynamically
- Remains simple to understand
- Scales for future enhancements

The position-based approach ensures that even minimum-rolled mods show some value while maintaining clear quality differentiation for optimal modding decisions.