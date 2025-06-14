// Evaluation reason text templates
const REASON_TEMPLATES = {
  // SELL reasons
  "LD": "Low quality (1-4 dots)",
  "NS": "No speed secondary stat", 
  "BT": "Speed {0} below threshold {1}",
  
  // KEEP reasons  
  "LK": "Mod is locked in game",
  "SA_M": "Speed arrow (maxed)",
  "SA_L": "Speed arrow (level up first)",
  "GS": "Good speed {0}",
  
  // SLICE reasons
  "SL_SA": "Speed arrow (can be upgraded)",
  "SL_HS": "High speed {0}, worth upgrading",
  
  // LEVEL reasons
  "NL": "Need to reach level {0} to see all stats"
};

// Decode compact evaluation to full format
function decodeEvaluation(compactEval) {
  const verdictMap = {
    'K': 'keep',
    'S': 'sell',
    'SL': 'slice',
    'LV': 'level'
  };
  
  const classMap = {
    'K': 'keep',
    'S': 'sell',
    'SL': 'slice',
    'LV': 'level'
  };
  
  // Get the template and fill in parameters
  let reasonText = REASON_TEMPLATES[compactEval.r] || "Unknown reason";
  if (compactEval.p && compactEval.p.length > 0) {
    compactEval.p.forEach((param, index) => {
      reasonText = reasonText.replace(`{${index}}`, param);
    });
  }
  
  // Generate display text
  let displayText = verdictMap[compactEval.v];
  if (compactEval.v === 'LV' && compactEval.p.length > 0) {
    displayText = `Level to ${compactEval.p[0]}`;
  } else {
    displayText = displayText.charAt(0).toUpperCase() + displayText.slice(1);
  }
  
  return {
    verdict: verdictMap[compactEval.v],
    text: displayText,
    reason: reasonText,
    className: classMap[compactEval.v]
  };
}

// Decode compact mod to full format expected by components
export function decodeModData(compactMod) {
  return {
    id: compactMod.id,
    definitionId: compactMod.d,
    level: compactMod.l,
    tier: compactMod.t,
    locked: compactMod.k,
    characterName: compactMod.c,
    primaryStat: {
      stat: {
        unitStatId: compactMod.p.i,
        statValueDecimal: (compactMod.p.v * 10000).toString()
      }
    },
    secondaryStat: compactMod.s.map(stat => ({
      stat: {
        unitStatId: stat.i,
        statValueDecimal: (stat.v * 10000).toString()
      },
      statRolls: stat.r
    })),
    efficiency: compactMod.e,
    // Decode evaluations
    basicEvaluation: decodeEvaluation(compactMod.ev.b),
    strictEvaluation: decodeEvaluation(compactMod.ev.s)
  };
}