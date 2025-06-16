// workflowEvaluator.js - Workflow evaluation engine
// Place this in src/utils/workflowEvaluator.js

import { EVALUATION_WORKFLOWS, RESULT_CODES, TIER_KEYS } from '../config/evaluationWorkflows';

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

  // Speed arrow special case
  const isSpeedArrow = mod.definitionId[2] === '2' && mod.primaryStat?.stat?.unitStatId === 5;
  if (isSpeedArrow) {
    return evaluateSpeedArrow(mod);
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
  const dotKey = dots >= 6 ? 'dot_6' : 'dot_5';
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
 * Special evaluation for speed arrows
 */
function evaluateSpeedArrow(mod) {
  const dots = parseInt(mod.definitionId[1]);
  
  // 6-dot Gold speed arrows are maxed
  if (dots === 6 && mod.tier === 5) {
    return {
      verdict: "keep",
      text: "Keep",
      className: "keep",
      reason: "Speed arrow (maxed)"
    };
  }
  
  // Level 15 speed arrows can be sliced
  if (mod.level === 15) {
    return {
      verdict: "slice",
      text: "Slice",
      className: "slice",
      reason: "Speed arrow (can be upgraded)"
    };
  }
  
  // Otherwise keep and level up
  return {
    verdict: "keep",
    text: "Keep",
    className: "keep",
    reason: "Speed arrow (level up first)"
  };
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