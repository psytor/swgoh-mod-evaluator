# SWGOH Mod Evaluation System - API Integration Documentation

## Overview

This document provides the technical specifications for integrating with the SWGOH API to extract and process mod data for the evaluation system. It covers data structure mappings, decoding rules, and integration considerations.

## API Configuration

### Endpoint
```
URL: http://farmroadmap.dynv6.net/comlink/player
Method: POST
Content-Type: application/json
```

### Request Payload
```json
{
  "payload": {
    "allyCode": "string"
  },
  "enums": false
}
```

## Data Structure

### Player Response Schema
```json
{
  "name": "string",
  "level": "number",
  "allyCode": "number",
  "rosterUnit": [
    {
      "definitionId": "string",
      "equippedStatMod": [
        {
          "id": "string",
          "definitionId": "string",
          "level": "number",
          "tier": "number",
          "primaryStat": {
            "stat": {
              "unitStatId": "number",
              "statValueDecimal": "string"
            }
          },
          "secondaryStat": [
            {
              "stat": {
                "unitStatId": "number",
                "statValueDecimal": "string"
              },
              "statRolls": "number"
            }
          ]
        }
      ]
    }
  ]
}
```

## Data Mappings

### Mod Set Types
```javascript
{
  1: "Health",
  2: "Offense", 
  3: "Defense",
  4: "Speed",
  5: "Critical Chance",
  6: "Critical Damage",
  7: "Potency",
  8: "Tenacity"
}
```

### Mod Slot Types
```javascript
{
  1: "Square",
  2: "Arrow",
  3: "Diamond",
  4: "Triangle",
  5: "Circle",
  6: "Cross"
}
```

### Mod Tier to Color Mapping
```javascript
{
  1: "Grey",
  2: "Green",
  3: "Blue",
  4: "Purple",
  5: "Gold"
}
```

### Mod Rarity (Dots) System
Mod rarity determines the maximum potential of primary stats and is indicated by dots (1-6):
- **1-4 dots**: Low quality, auto-sell
- **5 dots**: Standard max quality (can be sliced to 6-dot)
- **6 dots**: Premium quality achieved by slicing a Gold 5-dot mod

**Important**: 6-dot mods maintain their color tier (Grey through Gold) and can be further sliced within the 6-dot rarity. A 6-dot Gold mod represents the highest possible stat potential in the game.

### Mod Tier System and Additional Rolls
The tier system determines how many additional stat increases (rolls) a mod can have:

| Rarity | Tier | Letter | Additional Rolls | Total Possible Rolls |
|--------|------|--------|------------------|---------------------|
| 1-5 | Grey | E | 0 | 4 |
| 1-5 | Green | D | 1 | 5 |
| 1-5 | Blue | C | 2 | 6 |
| 1-5 | Purple | B | 3 | 7 |
| 1-5 | Gold | A | 4 | 8 |
| 6 | Grey | E | 0 | 8 |
| 6 | Green | D | 5 | 9 |
| 6 | Blue | C | 6 | 10 |
| 6 | Purple | B | 7 | 11 |
| 6 | Gold | A | 8 | 12 |

**Note**: Individual secondary stats can have a maximum of 4 additional rolls (5 total with initial roll).

### Stat ID Mappings
```javascript
{
  1: "Health",              // Flat
  5: "Speed",               // Flat
  16: "Critical Damage %",  // Percentage
  17: "Potency %",          // Percentage
  18: "Tenacity %",         // Percentage
  28: "Protection",         // Flat
  41: "Offense",            // Flat
  42: "Defense",            // Flat
  48: "Offense %",          // Percentage
  49: "Defense %",          // Percentage
  53: "Critical Chance %",  // Percentage
  55: "Health %",           // Percentage
  56: "Protection %"        // Percentage
}
```

### Primary Stat Values by Rarity (Dots)

| Primary Stat | 1 Dot | 2 Dot | 3 Dot | 4 Dot | 5 Dot | 6 Dot |
|--------------|-------|-------|-------|-------|-------|-------|
| Accuracy % | 7.5% | 8% | 8.75% | 10.5% | 12% | 30% |
| Critical Avoidance % | 15% | 16% | 18% | 21% | 24% | 35% |
| Critical Chance % | 7.5% | 8% | 8.75% | 10.5% | 12% | 20% |
| Critical Damage % | 22.5% | 24% | 27% | 31.5% | 36% | 42% |
| Defense % | 3.75% | 4% | 7.75% | 8% | 11.75% | 20% |
| Health % | 1.88% | 2% | 3.88% | 4% | 5.88% | 16% |
| Offense % | 1.88% | 2% | 3.88% | 4% | 5.88% | 8.5% |
| Potency % | 15% | 16% | 18% | 21% | 24% | 30% |
| Protection % | 7.5% | 8% | 15.5% | 16% | 23.5% | 24% |
| Speed | 17 | 19 | 21 | 26 | 30 | 32 |
| Tenacity % | 15% | 16% | 18% | 21% | 24% | 35% |

### Secondary Stat Roll Ranges

#### 5-Dot Mods
| Stat | Min Roll | Max Roll | Max Possible (4 rolls) |
|------|----------|----------|------------------------|
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

#### 6-Dot Mods
| Stat | Min Roll | Max Roll | Max Possible (4 rolls) |
|------|----------|----------|------------------------|
| Critical Chance % | 1.175% | 2.35% | 11.75% |
| Defense | 8 | 16 | 80 |
| Defense % | 2% | 4% | 20.00% |
| Health | 270 | 540 | 2700 |
| Health % | 1% | 2% | 10.00% |
| Offense | 25 | 50 | 251 |
| Offense % | 0.85% | 1.7% | 8.50% |
| Potency % | 1.5% | 3% | 15.00% |
| Protection | 460 | 920 | 4600 |
| Protection % | 1.5% | 3% | 15.00% |
| Speed | 3 | 6 | 31 |
| Tenacity % | 1.5% | 3% | 15.00% |

## Primary Stat Availability by Slot

Each mod slot has specific primary stats available:

| Slot | Available Primary Stats |
|------|------------------------|
| Square (Transmitter) | Offense % (always) |
| Arrow (Receiver) | Speed, Accuracy %, Critical Avoidance %, Health %, Protection %, Offense %, Defense % |
| Diamond (Processor) | Defense % (always) |
| Triangle (Holo-Array) | Critical Chance %, Critical Damage %, Health %, Protection %, Offense %, Defense % |
| Circle (Data-Bus) | Health %, Protection % |
| Cross (Multiplexer) | Tenacity %, Potency %, Health %, Protection %, Offense %, Defense % |

## Decoding Rules

### Definition ID Format
The `definitionId` field uses a three-digit format: **XYZ**
- **X** (1st digit): Mod set type (1-8)
- **Y** (2nd digit): Mod dots/quality tier (1-6)
  - 1-4 dots: Low quality, automatically sell
  - 5 dots: Standard max quality
  - 6 dots: Premium max quality
- **Z** (3rd digit): Mod slot type (1-6)

Example: `451` = Speed set (4), 5-dot mod (5), Square slot (1)

### Mod Quality Filtering
**Critical Rule**: Mods with 1-4 dots (definitionId middle digit 1-4) should be automatically sold regardless of stats. Only 5-dot and 6-dot mods are worth evaluating.

### Stat Value Encoding
All stat values in the API are encoded as strings multiplied by 10,000:
- Raw value: `"90000"` → Decoded value: `9`
- Raw value: `"588"` → Decoded value: `0.0588`

**Decoding Formula**: `decodedValue = parseInt(rawValue) / 10000`

### Display Formatting
- **Percentage stats** (IDs: 16, 17, 18, 48, 49, 53, 55, 56): Multiply by 100 and add %
  - Example: `0.0588` → `5.88%`
- **Flat stats** (IDs: 1, 5, 28, 41, 42): Display as integers
  - Example: `9.0` → `9`

**Note**: Display values may differ by ±0.01% from in-game due to rounding differences.

## Processing Workflow

### 1. Pre-filter by Dots
Check the middle digit of `definitionId`:
- If 1-4: Skip mod entirely (auto-sell)
- If 5-6: Continue processing

### 2. Extract Mod Data
For each unit in `rosterUnit`:
- Check if `equippedStatMod` array exists and has items
- Extract each mod's data for processing

### 3. Decode Mod Properties
For each mod:
- Decode `definitionId` to get set, dots, and slot
- Map `tier` to color
- Decode primary stat value
- Process each secondary stat

### 4. Calculate Roll Information
- Initial rolls are included in `statRolls` field
- Total rolls = displayed rolls (buffs applied during leveling)
- Initial secondary stats revealed based on starting color

## Integration Considerations

### Required Fields for Evaluation
Each mod must have:
- `definitionId` - To determine set, dots, and slot
- `tier` - To determine color/quality
- `level` - To verify mod is maxed (15)
- `primaryStat.stat.unitStatId` - Primary stat type
- `primaryStat.stat.statValueDecimal` - Primary stat value
- `secondaryStat[]` - Array of secondary stats with:
  - `stat.unitStatId` - Secondary stat type
  - `stat.statValueDecimal` - Secondary stat value
  - `statRolls` - Number of rolls/buffs

### Data Validation
- Verify `definitionId` follows XYZ format
- Check middle digit for dot count (only process 5-6)
- Ensure `tier` is between 1-5
- Confirm `level` is between 1-15
- Validate stat IDs match known mappings

### Performance Optimization
- Pre-filter mods by dot count before detailed processing
- Cache decoded mappings to avoid repeated lookups
- Process mods in batches for large rosters
- Store raw values for calculations, format only for display

## Example Mod Object (Decoded)
```json
{
  "id": "RAiboKFaQNCrB-VxwbYPTA",
  "definitionId": "451",
  "dots": 5,
  "set": "Speed",
  "slot": "Square",
  "color": "Blue",
  "level": 15,
  "primaryStat": {
    "type": "Offense %",
    "value": 5.88,
    "displayValue": "5.88%"
  },
  "secondaryStats": [
    {
      "type": "Speed",
      "value": 9,
      "displayValue": "9",
      "rolls": 2
    },
    {
      "type": "Protection %",
      "value": 4.27,
      "displayValue": "4.27%",
      "rolls": 2
    }
  ]
}
```

## Notes

1. **Dot Quality**: Only 5-dot and 6-dot mods should be processed. All others (1-4 dots) are automatically sold regardless of stats.

2. **Rounding Differences**: The game may display percentage values with ±0.01% variance due to different rounding methods. Use raw values for calculations.

3. **Stat Exclusivity**: Primary stat types cannot appear as secondary stats on the same mod (enforced by the game).

4. **Roll Counting**: The `statRolls` field represents the number of times a secondary stat was increased during leveling (not including the initial reveal).

5. **Character Identification**: The `definitionId` in `rosterUnit` identifies the character (e.g., "HERMITYODA:SEVEN_STAR").

6. **6-Dot Mod Progression**: 
   - 5-dot Gold mods at level 15 can be sliced to become 6-dot mods
   - 6-dot mods retain their color tier system (Grey → Green → Blue → Purple → Gold)
   - 6-dot mods have significantly higher primary stat values than 5-dot mods
   - Characters must be Gear Level 12 and 7 stars to equip 6-dot mods

7. **Rarity Naming Convention**: Mods can be referred to by their dots and tier letter (e.g., "5A" for a 5-dot Gold mod, "6E" for a 6-dot Grey mod).

8. **Stat Exclusivity**: A stat that appears as a primary stat on a mod cannot also appear as a secondary stat on the same mod.

9. **Leveling Milestones**: Secondary stats are revealed or increased at levels 3, 6, 9, and 12 based on the mod's starting color tier.