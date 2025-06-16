// evaluationWorkflows.js - Complete workflow configuration
// Place this in src/config/evaluationWorkflows.js

export const EVALUATION_WORKFLOWS = {
  // YOUR EXISTING BASIC MODE - CONVERTED TO WORKFLOW FORMAT
  basic: {
    name: "Basic Mode (Keep Any Speed)",
    description: "Lenient thresholds for players with limited resources",
    dot_5: {
      grey: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      green: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      blue: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_6: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 6 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      purple: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_3: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 6 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      gold: {
        level_1: [
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_15: [
          { check: "speed_threshold", params: { min: 12 }, result: "SL" },
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ]
      }
    },
    dot_6: {
      // 6-dot mods use same thresholds but cannot be sliced further
      grey: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      green: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      blue: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_6: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 6 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      purple: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_3: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 6 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      gold: {
        level_1: [
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_15: [
          // 6-dot gold cannot be sliced, just keep/sell
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ]
      }
    }
  },
  
  // YOUR EXISTING STRICT MODE - CONVERTED TO WORKFLOW FORMAT
  strict: {
    name: "Strict Mode (Limited Inventory)",
    description: "Higher thresholds for players with limited mod space",
    dot_5: {
      grey: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      green: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { min: 5 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 5 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      blue: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_6: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      purple: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_3: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_15: [
          { check: "speed_threshold", params: { min: 15 }, result: "SL" },
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      gold: {
        level_1: [
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_15: [
          { check: "speed_threshold", params: { min: 15 }, result: "SL" },
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ]
      }
    },
    dot_6: {
      // 6-dot mods use same thresholds but cannot be sliced further
      grey: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      green: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_threshold", params: { min: 5 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 5 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      blue: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_6: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      purple: {
        level_1: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_3: [
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_15: [
          // 6-dot purple cannot be sliced, just keep/sell
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      gold: {
        level_1: [
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "needs_leveling", result: "LV", target: 12 }
        ],
        level_12: [
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ],
        level_15: [
          // 6-dot gold cannot be sliced, just keep/sell
          { check: "speed_threshold", params: { min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ]
      }
    }
  }
};

// Result code mappings
export const RESULT_CODES = {
  "K": { verdict: "keep", text: "Keep", className: "keep" },
  "S": { verdict: "sell", text: "Sell", className: "sell" },
  "SL": { verdict: "slice", text: "Slice", className: "slice" },
  "LV": { verdict: "level", text: "Level", className: "level" }
};

// Tier name to key mapping
export const TIER_KEYS = {
  1: "grey",
  2: "green", 
  3: "blue",
  4: "purple",
  5: "gold"
};