// evaluationWorkflows.js - Complete workflow configuration
// Place this in src/config/evaluationWorkflows.js

export const EVALUATION_WORKFLOWS = {
  // YOUR EXISTING BASIC MODE - CONVERTED TO WORKFLOW FORMAT
  beginner: {
    name: "Beginner Mode",
    description: "Limited in resources, this helps you keep good speed mods that will help you go through the beginning stages of the game.",
    "dot_1-4": {
      grey: { level_1: [{ check: "default", result: "S" }] },
      green: { level_1: [{ check: "default", result: "S" }] },
      blue: { level_1: [{ check: "default", result: "S" }] },
      purple: { level_1: [{ check: "default", result: "S" }] },
      gold: { level_1: [{ check: "default", result: "S" }] }
    },
    dot_5: {
      grey: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 15 },
          { check: "default", result: "S" }
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "SL" },
          { check: "default", result: "S" }
        ]
      },
      green: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 5 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      blue: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 6 }
        ],
        level_6: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 6 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 8 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 6 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      purple: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 3 }
        ],
        level_3: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 6 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 10 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 6 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      gold: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 8 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 12 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ]
      }
    },
    dot_6: {
      grey: { 
        level_1: [
          { check: "default", result: "K" }
        ] 
      },
      green: { 
        level_1: [
          { check: "default", result: "K" }
        ] 
      },
      blue: { 
        level_1: [
          { check: "default", result: "K" }
        ] 
      },
      purple: { 
        level_1: [
          { check: "default", result: "K" }
        ] 
      },
      gold: { 
        level_1: [
          { check: "default", result: "K" }
        ] 
      }
    }
  },
  
  begin_poor: {
    name: "Beginner (Poor)",
    description: "You are Broke and limited in resources, this helps you keep good speed mods that will help you go through the beginning stages of the game.",
    "dot_1-4": {
      grey: { level_1: [{ check: "default", result: "S" }] },
      green: { level_1: [{ check: "default", result: "S" }] },
      blue: { level_1: [{ check: "default", result: "S" }] },
      purple: { level_1: [{ check: "default", result: "S" }] },
      gold: { level_1: [{ check: "default", result: "S" }] }
    },
    dot_5: {
      grey: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 15 },
          { check: "default", result: "S" }
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "SL" },
          { check: "default", result: "S" }
        ]
      },
      green: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 9 }
        ],
        level_9: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 5 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 6 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 5 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      blue: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 6 }
        ],
        level_6: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 8 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 10 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 8 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      purple: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "needs_leveling", result: "LV", target: 3 }
        ],
        level_3: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 10 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 12 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 10 }, result: "K" },
          { check: "default", result: "S" }
        ]
      },
      gold: {
        level_1: [
          { check: "speed_arrow", result: "LV", target: 15 },
          { check: "stat_threshold", params: { stat: "Speed", any: true }, result: "LV", target: 12 },
          { check: "default", result: "S"}
        ],
        level_12: [
          { check: "speed_arrow", result: "LV", target: 15},
          { check: "stat_threshold", params: { stat: "Speed", min: 12 }, result: "LV", target: 15 },
          { check: "default", result: "S"}
        ],
        level_15: [
          { check: "speed_arrow", result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 14 }, result: "SL" },
          { check: "stat_threshold", params: { stat: "Speed", min: 12 }, result: "K" },
          { check: "default", result: "S" }
        ]
      }
    },
    dot_6: {
      grey: { 
        level_1: [
          { check: "default", result: "K" }  // Keep all 6-dot grey
        ] 
      },
      green: { 
        level_1: [
          { check: "default", result: "K" }  // Keep all 6-dot green
        ] 
      },
      blue: { 
        level_1: [
          { check: "default", result: "K" }  // Keep all 6-dot blue
        ] 
      },
      purple: { 
        level_1: [
          { check: "default", result: "K" }  // Keep all 6-dot purple
        ] 
      },
      gold: { 
        level_1: [
          { check: "default", result: "K" }  // Keep all 6-dot gold
        ] 
      }
    }
  },
  compreshensive:{
    name: "Minimal Template",              // Required - shown in dropdown
    description: "What it does",        // Optional but recommended
    "dot_1-4": {
      grey: { level_1: [{ check: "default", result: "S" }] },
      green: { level_1: [{ check: "default", result: "S" }] },
      blue: { level_1: [{ check: "default", result: "S" }] },
      purple: { level_1: [{ check: "default", result: "S" }] },
      gold: { level_1: [{ check: "default", result: "S" }] }
    },
    dot_5: {                           // Required - 5-dot configuration
      grey: {                          // Required - all 5 tiers needed
        level_1: [                     // Required - at least one level
          { check: "default", result: "K" }  // Required - must have default
        ]
      },
      green: {                         // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      blue: {                          // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      purple: {                        // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      gold: {                          // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      }
    },
    dot_6: {                           // Required - 6-dot configuration
      grey: {                          // Required - all 5 tiers needed
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      green: {                         // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      blue: {                          // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      purple: {                        // Required
        level_1: [
          { check: "default", result: "K" }
        ]
      },
      gold: {                          // Required
        level_1: [
          { check: "default", result: "K" }
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