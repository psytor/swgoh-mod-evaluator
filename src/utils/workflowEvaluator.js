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

// Reverse mapping: name to ID
const STAT_IDS = Object.fromEntries(
  Object.entries(STAT_NAMES).map(([id, name]) => [name, parseInt(id)])
);

// Set categorization for synergy
const OFFENSIVE_SETS = ['Speed', 'Offense', 'Critical Damage', 'Critical Chance', 'Potency'];
const DEFENSIVE_SETS = ['Health', 'Defense', 'Tenacity'];

/**
 * Main evaluation function using workflows
 */
export function evaluateModWithWorkflow(mod, workflowName = 'beginner') {
  // Special cases first
  if (mod.locked) {
    const score = calculateModScore(mod);
    return {
      verdict: "keep",
      text: "Locked",
      className: "keep",
      reason: "Mod is locked in game",
      score: score
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
    const checkResult = executeCheck(mod, check);
    if (checkResult) {
      let resultCode, target, details;
      
      if (typeof checkResult === 'string') {
        // Simple string result
        resultCode = checkResult;
        target = check.target;
      } else if (typeof checkResult === 'object') {
        // Object result with possible target and/or details
        resultCode = checkResult.result;
        target = checkResult.target || check.target;
        details = checkResult.details;
      }
      
      const formattedResult = formatResult(resultCode, { ...check, target }, details);
      const score = calculateModScore(mod);
      return {
        ...formattedResult,
        score: score
      };
    }
  }

  const score = calculateModScore(mod);

  // Should never reach here if default check is configured
  return {
    verdict: "sell",
    text: "Sell",
    className: "sell",
    reason: "No checks passed",
    score: score
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
    
    case "stat_threshold":
      return checkStatThreshold(mod, check);

    case "combined_speed_offense":
      return checkCombinedSpeedOffense(mod, check);
      
    case "combined_stats":
      return checkCombinedStats(mod, check);

    case "point_threshold":
      return checkPointThreshold(mod, check);

    case "speed_arrow":
      return checkSpeedArrow(mod, check);
    
    case "default":
      return check.target ? { result: check.result, target: check.target } : check.result;
    
    // Keep old checks for backward compatibility
    case "speed_threshold":
      return checkStatThreshold(mod, { ...check, params: { ...check.params, stat: "Speed" } });
    
    case "offense_threshold":
      return checkStatThreshold(mod, { ...check, params: { ...check.params, stat: "Offense" } });
    
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
    return { result: check.result, target: check.target };
  }
  return null;
}

/**
 * Generic stat threshold check - REPLACES speed_threshold and offense_threshold
 */
function checkStatThreshold(mod, check) {
  const statName = check.params?.stat;
  if (!statName) {
    console.warn("stat_threshold check requires params.stat");
    return null;
  }
  
  const statId = STAT_IDS[statName];
  if (!statId) {
    console.warn(`Unknown stat name: ${statName}`);
    return null;
  }
  
  const statData = mod.secondaryStat?.find(stat => stat.stat.unitStatId === statId);
  if (!statData) {
    return null; // Stat not present on mod
  }

  const statValue = Math.floor(parseInt(statData.stat.statValueDecimal) / 10000);
  
  // Check for "any" - any value > 0
  if (check.params?.any && statValue > 0) {
    return check.target ? { result: check.result, target: check.target } : check.result;
  }
  
  // Check for minimum threshold
  if (check.params?.min && statValue >= check.params.min) {
    return check.target ? { result: check.result, target: check.target } : check.result;
  }
  
  return null;
}

/**
 * Combined stats check - generalized version of combined_speed_offense
 */
function checkCombinedStats(mod, check) {
  const stats = check.params?.stats || [];
  if (stats.length < 2) {
    console.warn("combined_stats check requires at least 2 stats in params.stats");
    return null;
  }
  
  const statValues = {};
  const statPresent = {};
  
  // Get values for all required stats
  for (const statConfig of stats) {
    const statName = statConfig.stat;
    const statId = STAT_IDS[statName];
    
    if (!statId) {
      console.warn(`Unknown stat name in combined check: ${statName}`);
      return null;
    }
    
    const statData = mod.secondaryStat?.find(stat => stat.stat.unitStatId === statId);
    if (statData) {
      statValues[statName] = Math.floor(parseInt(statData.stat.statValueDecimal) / 10000);
      statPresent[statName] = true;
    } else {
      statValues[statName] = 0;
      statPresent[statName] = false;
    }
  }
  
  // Check if all required stats are present
  const allPresent = stats.every(statConfig => statPresent[statConfig.stat]);
  if (!allPresent) {
    return null;
  }
  
  // Check individual minimums
  const allMeetMinimums = stats.every(statConfig => {
    const statValue = statValues[statConfig.stat];
    return statValue >= (statConfig.min || 0);
  });
  
  if (allMeetMinimums) {
    const result = {
      result: check.result,
      details: {
        type: 'combined',
        stats: stats.map(statConfig => ({
          name: statConfig.stat,
          value: statValues[statConfig.stat],
          min: statConfig.min || 0,
          meets: statValues[statConfig.stat] >= (statConfig.min || 0)
        })),
        allPresent: true
      }
    };
    
    if (check.target) {
      result.target = check.target;
    }
    
    return result;
  }
  
  return null;
}

/**
 * Legacy combined speed + offense check - kept for compatibility
 */
function checkCombinedSpeedOffense(mod, check) {
  // Convert to new format and use checkCombinedStats
  const newCheck = {
    ...check,
    check: "combined_stats",
    params: {
      stats: [
        { stat: "Speed", min: check.params?.minSpeed || 0 },
        { stat: "Offense", min: check.params?.minOffense || 0 }
      ]
    }
  };
  
  return checkCombinedStats(mod, newCheck);
}

/**
 * Check total point score with synergies
 */
function checkPointThreshold(mod, check) {
  const basePoints = calculateBasePoints(mod);
  const synergies = calculateSynergies(mod);
  const totalScore = basePoints + synergies;
  
  if (totalScore >= check.params.threshold) {
    const statBreakdown = getStatBreakdown(mod);
    const synergyBreakdown = getSynergyBreakdown(mod);
    
    const result = {
      result: check.result,
      details: {
        type: 'points',
        basePoints: Math.round(basePoints),
        synergyBonus: Math.round(synergies),
        totalScore: Math.round(totalScore),
        threshold: check.params.threshold,
        statBreakdown: statBreakdown,
        synergyBreakdown: synergyBreakdown
      }
    };
    
    if (check.target) {
      result.target = check.target;
    }
    
    return result;
  }
  
  return null;
}

function checkSpeedArrow(mod, check) {
  const isSpeedArrow = mod.definitionId[2] === '2' && mod.primaryStat?.stat?.unitStatId === 5;
  if (isSpeedArrow) {
    return check.target ? { result: check.result, target: check.target } : check.result;
  }
  return null;
}

/**
 * Format the result
 */
function formatResult(resultCode, check, evaluationDetails = null) {
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
  let text = resultConfig.text;
  let details = evaluationDetails;
  
  // Handle LV with target - update the display text too
  if (resultCode === "LV" && check.target) {
    text = `Level to ${check.target}`;
    reason = `Need to reach level ${check.target} to evaluate`;
  }
  else if (check.check === "stat_threshold") {
    const statName = check.params?.stat || "Unknown Stat";
    if (check.params?.any) {
      reason = `Has ${statName} secondary`;
    } else if (check.params?.min) {
      reason = `${statName} meets threshold (${check.params.min}+)`;
    }
  }
  else if (check.check === "combined_stats" || check.check === "combined_speed_offense") {
    reason = `Combined stats meet thresholds`;
  }
  else if (check.check === "point_threshold") {
    reason = `Total score meets threshold (${check.params.threshold}+ points)`;
  }
  else if (check.check === "speed_arrow") {
    reason = "Speed Arrow - always valuable";
  }
  else if (check.check === "default") {
    reason = resultCode === "S" ? "Doesn't meet any criteria" : "Default action";
  }
  // Legacy compatibility
  else if (check.check === "speed_threshold") {
    if (check.params?.any) {
      reason = "Has speed secondary";
    } else if (check.params?.min) {
      reason = `Speed meets threshold (${check.params.min}+)`;
    }
  }
  else if (check.check === "offense_threshold") {
    if (check.params?.any) {
      reason = "Has offense secondary";
    } else if (check.params?.min) {
      reason = `Offense meets threshold (${check.params.min}+)`;
    }
  }

  return {
    ...resultConfig,
    text: text,
    reason: reason || resultConfig.text,
    details: details
  };
}

// All the calculation functions remain the same...
// [Including calculateBasePoints, calculateSynergies, etc.]

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

function calculateSynergies(mod) {
  let synergies = 0;
  
  const setType = getModSet(mod);
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const slotType = getModSlot(mod);
  
  if (mod.secondaryStat) {
    mod.secondaryStat.forEach(stat => {
      if (isStatSynergisticWithSet(stat.stat.unitStatId, setType)) {
        synergies += 15;
      }
    });
  }
  
  synergies += getSecondaryCombinationBonuses(mod);
  
  if (isChoiceSlot(slotType)) {
    synergies += getSetPrimarySynergy(setType, primaryStatId, slotType);
  }
  
  return synergies;
}

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
  return !['Square', 'Diamond'].includes(slotType);
}

function isStatSynergisticWithSet(statId, setType) {
  const statName = STAT_NAMES[statId];
  
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
  
  mod.secondaryStat?.forEach(stat => {
    stats[STAT_NAMES[stat.stat.unitStatId]] = true;
  });
  
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
  
  if (slotType === 'Arrow' && primaryStatId === 5 && setType === 'Speed') return 25;
  if (slotType === 'Cross' && primaryStatName === 'Potency %' && setType === 'Potency') return 20;
  if (slotType === 'Cross' && primaryStatName === 'Tenacity %' && setType === 'Tenacity') return 20;
  if (slotType === 'Triangle' && primaryStatName === 'Critical Damage %' && setType === 'Critical Damage') return 15;
  if (slotType === 'Triangle' && primaryStatName === 'Critical Chance %' && setType === 'Critical Chance') return 15;
  
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

function getStatBreakdown(mod) {
  const breakdown = [];
  
  if (!mod.secondaryStat) return breakdown;
  
  mod.secondaryStat.forEach(stat => {
    const statId = stat.stat.unitStatId;
    const statName = STAT_NAMES[statId];
    const multiplier = POINT_MULTIPLIERS[statName];
    
    if (multiplier) {
      const value = parseInt(stat.stat.statValueDecimal) / 10000;
      const points = value * multiplier;
      
      breakdown.push({
        name: statName,
        value: value,
        points: Math.round(points),
        formula: `${value} × ${multiplier} = ${Math.round(points)}`
      });
    }
  });
  
  return breakdown.sort((a, b) => b.points - a.points);
}

function getSynergyBreakdown(mod) {
  const breakdown = [];
  const setType = getModSet(mod);
  const primaryStatId = mod.primaryStat?.stat?.unitStatId;
  const slotType = getModSlot(mod);
  
  if (mod.secondaryStat) {
    mod.secondaryStat.forEach(stat => {
      const statName = STAT_NAMES[stat.stat.unitStatId];
      if (isStatSynergisticWithSet(stat.stat.unitStatId, setType)) {
        breakdown.push({
          type: 'Set + Secondary',
          description: `${setType} set + ${statName}`,
          bonus: 15
        });
      }
    });
  }
  
  const comboBonuses = getSecondaryCombinationDetails(mod);
  breakdown.push(...comboBonuses);
  
  if (isChoiceSlot(slotType)) {
    const primaryBonus = getSetPrimarySynergyDetails(setType, primaryStatId, slotType);
    if (primaryBonus) {
      breakdown.push(primaryBonus);
    }
  }
  
  return breakdown;
}

function getSecondaryCombinationDetails(mod) {
  const bonuses = [];
  const stats = {};
  
  mod.secondaryStat?.forEach(stat => {
    stats[STAT_NAMES[stat.stat.unitStatId]] = true;
  });
  
  if (stats['Offense'] && stats['Offense %']) {
    bonuses.push({
      type: 'Stat Combo',
      description: 'Offense + Offense %',
      bonus: 20
    });
  }
  
  if (stats['Defense'] && stats['Defense %']) {
    bonuses.push({
      type: 'Stat Combo',
      description: 'Defense + Defense %',
      bonus: 20
    });
  }
  
  if (stats['Speed'] && stats['Offense']) {
    bonuses.push({
      type: 'Stat Combo',
      description: 'Speed + Offense',
      bonus: 15
    });
  }
  
  return bonuses;
}

function getSetPrimarySynergyDetails(setType, primaryStatId, slotType) {
  const primaryStatName = STAT_NAMES[primaryStatId];
  
  if (slotType === 'Arrow' && primaryStatId === 5 && setType === 'Speed') {
    return {
      type: 'Perfect Match',
      description: 'Speed Arrow on Speed Set',
      bonus: 25
    };
  }
  
  return null;
}

export function getAvailableWorkflows() {
  return Object.entries(EVALUATION_WORKFLOWS).map(([key, workflow]) => ({
    key,
    name: workflow.name,
    description: workflow.description
  }));
}

export function calculateModScore(mod) {
  const basePoints = calculateBasePoints(mod);
  const synergies = calculateSynergies(mod);
  const totalScore = basePoints + synergies;
  
  const statBreakdown = getStatBreakdown(mod);
  const synergyBreakdown = getSynergyBreakdown(mod);
  
  return {
    basePoints: Math.round(basePoints),
    synergyBonus: Math.round(synergies),
    totalScore: Math.round(totalScore),
    statBreakdown: statBreakdown,
    synergyBreakdown: synergyBreakdown,
    hasSpeed: statBreakdown.some(s => s.name === 'Speed'),
    hasOffense: statBreakdown.some(s => s.name === 'Offense'),
    speedValue: statBreakdown.find(s => s.name === 'Speed')?.value || 0,
    offenseValue: statBreakdown.find(s => s.name === 'Offense')?.value || 0
  };
}