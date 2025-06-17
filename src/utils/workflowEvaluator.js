// workflowEvaluator.js - Workflow evaluation engine
// Place this in src/utils/workflowEvaluator.js

import { EVALUATION_WORKFLOWS, RESULT_CODES, TIER_KEYS } from '../config/evaluationWorkflows';

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
  'Tenacity %': 59.259,
  'Critical Damage %': 59.259
};

// Stat ID to name mapping
const STAT_NAMES = {
  1: "Health", 5: "Speed", 16: "Critical Damage %", 17: "Potency %",
  18: "Tenacity %", 28: "Protection", 41: "Offense", 42: "Defense",
  48: "Offense %", 49: "Defense %", 53: "Critical Chance %",
  55: "Health %", 56: "Protection %"
};

// Set categorization for synergy
const OFFENSIVE_SETS = ['Speed', 'Offense', 'Critical Damage', 'Critical Chance', 'Potency'];
const DEFENSIVE_SETS = ['Health', 'Defense', 'Tenacity'];

/**
 * Main evaluation function using workflows
 */
export function evaluateModWithWorkflow(mod, workflowName = 'basic') {
  // Special cases first
  if (mod.locked) {
    return {
      verdict: "keep",
      text: "Locked",
      className: "keep",
      reason: "Mod is locked in game"
    };
  }

  // Get the workflow
  const workflow = EVALUATION_WORKFLOWS[workflowName];
  if (!workflow) {
    console.error(`Workflow ${workflowName} not found`);
    return {
      verdict: "sell",
      text: "Sell",
      className: "sell",
      reason: "Invalid workflow"
    };
  }

  // Get mod properties
  const dots = parseInt(mod.definitionId[1]);
  const dotKey = dots <= 4 ? 'dot_1-4' : dots === 6 ? 'dot_6' : 'dot_5';
  const tierKey = TIER_KEYS[mod.tier];
  const level = mod.level;

  // Find the appropriate level configuration
  const tierConfig = workflow[dotKey]?.[tierKey];
  if (!tierConfig) {
    console.warn(`No configuration for ${dotKey} ${tierKey} in workflow ${workflowName}`);
    return {
      verdict: "sell",
      text: "Sell",
      className: "sell",
      reason: "No evaluation rules configured"
    };
  }

  // Find the closest level configuration
  const levelKey = findClosestLevelKey(tierConfig, level);
  const checks = tierConfig[levelKey];

  if (!checks) {
    console.warn(`No checks found for level ${levelKey}`);
    return {
      verdict: "sell",
      text: "Sell",
      className: "sell",
      reason: "No evaluation rules for this level"
    };
  }

  // Execute checks in order
  for (const check of checks) {
    const result = executeCheck(mod, check);
    if (result) {
      return formatResult(result, check);
    }
  }

  // Should never reach here if default check is configured
  return {
    verdict: "sell",
    text: "Sell",
    className: "sell",
    reason: "No checks passed"
  };
}

/**
 * Find the closest level key that applies
 */
function findClosestLevelKey(tierConfig, currentLevel) {
  const levelKeys = Object.keys(tierConfig)
    .map(key => parseInt(key.replace('level_', '')))
    .sort((a, b) => b - a); // Sort descending

  // Find the highest level key that's <= current level
  for (const levelNum of levelKeys) {
    if (currentLevel >= levelNum) {
      return `level_${levelNum}`;
    }
  }

  // Default to level_1 if nothing matches
  return 'level_1';
}

/**
 * Execute a single check
 */
function executeCheck(mod, check) {
  switch (check.check) {
    case "needs_leveling":
      return checkNeedsLeveling(mod, check);
    
    case "speed_threshold":
      return checkSpeedThreshold(mod, check);
    
    case "offense_threshold":
      return checkOffenseThreshold(mod, check);

    case "combined_speed_offense":
      return checkCombinedSpeedOffense(mod, check);

    case "point_threshold":
      return checkPointThreshold(mod, check);

    case "speed_arrow":
      return checkSpeedArrow(mod, check);
    
    case "default":
      return check.result;
    
    default:
      console.warn(`Unknown check type: ${check.check}`);
      return null;
  }
}

/**
 * Check if mod needs leveling
 */
function checkNeedsLeveling(mod, check) {
  if (mod.level < check.target) {
    return check.result;
  }
  return null;
}

/**
 * Check speed threshold
 */
function checkSpeedThreshold(mod, check) {
  const speedStat = mod.secondaryStat?.find(stat => stat.stat.unitStatId === 5);
  if (!speedStat) {
    return null; // No speed, check fails
  }

  const speedValue = Math.floor(parseInt(speedStat.stat.statValueDecimal) / 10000);
  
  if (check.params?.any && speedValue > 0) {
    return check.result;
  }
  
  if (check.params?.min && speedValue >= check.params.min) {
    return check.result;
  }
  
  return null;
}

/**
 * Check offense threshold
 */
function checkOffenseThreshold(mod, check) {
  const offenseStat = mod.secondaryStat?.find(stat => stat.stat.unitStatId === 41);
  if (!offenseStat) {
    return null; // No offense, check fails
  }

  const offenseValue = Math.floor(parseInt(offenseStat.stat.statValueDecimal) / 10000);
  
  if (check.params?.any && offenseValue > 0) {
    return check.result;
  }
  
  if (check.params?.min && offenseValue >= check.params.min) {
    return check.result;
  }
  
  return null;
}

/**
 * Check combined speed + offense score
 */
function checkCombinedSpeedOffense(mod, check) {
  const speedStat = mod.secondaryStat?.find(stat => stat.stat.unitStatId === 5);
  const offenseStat = mod.secondaryStat?.find(stat => stat.stat.unitStatId === 41);
  
  if (!speedStat || !offenseStat) return null;
  
  const speedValue = Math.floor(parseInt(speedStat.stat.statValueDecimal) / 10000);
  const offenseValue = Math.floor(parseInt(offenseStat.stat.statValueDecimal) / 10000);
  
  // Use the multiplier from check params
  const combinedScore = speedValue + (offenseValue * check.params.offenseMultiplier);
  
  if (combinedScore >= check.params.threshold) {
    return check.result;
  }
  
  return null;
}

/**
 * Check total point score with synergies
 */
function checkPointThreshold(mod, check) {
  const basePoints = calculateBasePoints(mod);
  const synergies = calculateSynergies(mod);
  const totalScore = basePoints + synergies;
  
  if (totalScore >= check.params.threshold) {
    return check.result;
  }
  
  return null;
}

/**
 * Calculate base points for all secondary stats
 */
function calculateBasePoints(mod) {
  let totalPoints = 0;
  
  if (!mod.secondaryStat) return 0;
  
  mod.secondaryStat.forEach(stat => {
    const statId = stat.stat.unitStatId;
    const statName = STAT_NAMES[statId];
    const multiplier = POINT_MULTIPLIERS[statName];
    
    if (multiplier) {
      const value = parseInt(stat.stat.statValueDecimal) / 10000;
      totalPoints += value * multiplier;
    }
  });
  
  return totalPoints;
}

/**
 * Calculate synergy bonuses
 */
function calculateSynergies(mod) {
  let synergies = 0;
  
  // Get mod properties
  const setType = getModSet(mod);
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const slotType = getModSlot(mod);
  
  // 1. Set + Secondary synergies (+15 each match)
  if (mod.secondaryStat) {
    mod.secondaryStat.forEach(stat => {
      if (isStatSynergisticWithSet(stat.stat.unitStatId, setType)) {
        synergies += 15;
      }
    });
  }
  
  // 2. Secondary combinations
  synergies += getSecondaryCombinationBonuses(mod);
  
  // 3. Set + Primary synergies (choice slots only)
  if (isChoiceSlot(slotType)) {
    synergies += getSetPrimarySynergy(setType, primaryStatId, slotType);
  }
  
  return synergies;
}

// Helper functions for synergy calculation

function getModSet(mod) {
  const setKey = mod.definitionId[0];
  const sets = {
    "1": "Health", "2": "Offense", "3": "Defense", "4": "Speed",
    "5": "Critical Chance", "6": "Critical Damage", "7": "Potency", "8": "Tenacity"
  };
  return sets[setKey];
}

function getModSlot(mod) {
  const slotKey = mod.definitionId[2];
  const slots = {
    "1": "Square", "2": "Arrow", "3": "Diamond",
    "4": "Triangle", "5": "Circle", "6": "Cross"
  };
  return slots[slotKey];
}

function isChoiceSlot(slotType) {
  // Square and Diamond have fixed primaries
  return !['Square', 'Diamond'].includes(slotType);
}

function isStatSynergisticWithSet(statId, setType) {
  const statName = STAT_NAMES[statId];
  
  // Define synergistic stats for each set
  const setSynergies = {
    'Speed': ['Speed', 'Offense', 'Offense %', 'Critical Chance %', 'Potency %'],
    'Offense': ['Offense', 'Offense %', 'Critical Chance %', 'Critical Damage %', 'Speed'],
    'Critical Damage': ['Critical Chance %', 'Offense', 'Offense %', 'Speed'],
    'Critical Chance': ['Critical Damage %', 'Offense', 'Offense %', 'Speed'],
    'Potency': ['Potency %', 'Speed', 'Offense', 'Offense %'],
    'Health': ['Health', 'Health %', 'Protection', 'Protection %', 'Defense %'],
    'Defense': ['Defense', 'Defense %', 'Health %', 'Protection %', 'Tenacity %'],
    'Tenacity': ['Tenacity %', 'Speed', 'Defense', 'Defense %', 'Health %']
  };
  
  return setSynergies[setType]?.includes(statName) || false;
}

function getSecondaryCombinationBonuses(mod) {
  let bonus = 0;
  const stats = {};
  
  // Map stat IDs to names
  mod.secondaryStat?.forEach(stat => {
    stats[STAT_NAMES[stat.stat.unitStatId]] = true;
  });
  
  // Check combinations
  if (stats['Offense'] && stats['Offense %']) bonus += 20;
  if (stats['Defense'] && stats['Defense %']) bonus += 20;
  if (stats['Health'] && stats['Health %']) bonus += 15;
  if (stats['Protection'] && stats['Protection %']) bonus += 15;
  if (stats['Speed'] && stats['Offense']) bonus += 15;
  if (stats['Speed'] && stats['Critical Chance %']) bonus += 15;
  if (stats['Speed'] && stats['Potency %']) bonus += 10;
  
  return bonus;
}

function getSetPrimarySynergy(setType, primaryStatId, slotType) {
  const primaryStatName = STAT_NAMES[primaryStatId];
  
  // Special bonuses for perfect matches
  if (slotType === 'Arrow' && primaryStatId === 5 && setType === 'Speed') return 25;
  if (slotType === 'Cross' && primaryStatName === 'Potency %' && setType === 'Potency') return 20;
  if (slotType === 'Cross' && primaryStatName === 'Tenacity %' && setType === 'Tenacity') return 20;
  if (slotType === 'Triangle' && primaryStatName === 'Critical Damage %' && setType === 'Critical Damage') return 15;
  if (slotType === 'Triangle' && primaryStatName === 'Critical Chance %' && setType === 'Critical Chance') return 15;
  
  // General good match
  const isOffensiveSet = OFFENSIVE_SETS.includes(setType);
  const isDefensiveSet = DEFENSIVE_SETS.includes(setType);
  
  const offensiveStats = ['Offense %', 'Critical Chance %', 'Critical Damage %', 'Speed', 'Potency %'];
  const defensiveStats = ['Defense %', 'Health %', 'Protection %', 'Tenacity %'];
  
  if ((isOffensiveSet && offensiveStats.includes(primaryStatName)) ||
      (isDefensiveSet && defensiveStats.includes(primaryStatName))) {
    return 10;
  }
  
  return 0;
}

function checkSpeedArrow(mod, check) {
  const isSpeedArrow = mod.definitionId[2] === '2' && mod.primaryStat?.stat?.unitStatId === 5;
  if (isSpeedArrow) {
    return check.result;
  }
  return null;
}

/**
 * Format the result
 */
function formatResult(resultCode, check) {
  const resultConfig = RESULT_CODES[resultCode];
  if (!resultConfig) {
    console.warn(`Unknown result code: ${resultCode}`);
    return {
      verdict: "sell",
      text: "Sell",
      className: "sell",
      reason: "Unknown result"
    };
  }

  // Build reason string
  let reason = "";
  if (resultCode === "LV" && check.target) {
    reason = `Need to reach level ${check.target} to see all stats`;
  } else if (check.check === "speed_threshold") {
    if (check.params?.any) {
      reason = "Has speed secondary";
    } else if (check.params?.min) {
      reason = `Speed meets threshold (${check.params.min}+)`;
    }
  } else if (check.check === "offense_threshold") {
    if (check.params?.any) {
      reason = "Has offense secondary";
    } else if (check.params?.min) {
      reason = `Offense meets threshold (${check.params.min}+)`;
    }
  } else if (check.check === "default") {
    reason = resultCode === "S" ? "Doesn't meet any criteria" : "Default action";
  }

  return {
    ...resultConfig,
    reason: reason || resultConfig.text
  };
}

/**
 * Get available workflow names and descriptions
 */
export function getAvailableWorkflows() {
  return Object.entries(EVALUATION_WORKFLOWS).map(([key, workflow]) => ({
    key,
    name: workflow.name,
    description: workflow.description
  }));
}