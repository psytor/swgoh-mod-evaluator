from typing import Dict, Any, List
from models.mod import ProcessedMod
import logging

logger = logging.getLogger(__name__)

class EvaluationEngine:
    
    def __init__(self):
        pass
    
    def evaluate_mod(self, mod: ProcessedMod, evaluation_mode: str = "basic") -> Dict[str, Any]:
        """
        Evaluate a single mod using current speed-based logic
        
        Args:
            mod: ProcessedMod object to evaluate
            evaluation_mode: "basic" or "strict"
            
        Returns:
            Dictionary with evaluation results
        """
        try:
            # Auto-sell 1-4 dot mods
            if mod.dots <= 4:
                return {
                    "verdict": "sell",
                    "text": "Sell",
                    "reason": "Low quality (1-4 dots)",
                    "className": "sell"
                }
            
            # Handle locked mods
            if mod.locked:
                return {
                    "verdict": "keep",
                    "text": "Locked", 
                    "reason": "Mod is locked in game",
                    "className": "keep"
                }
            
            # Check if this is a Speed Arrow (special case)
            if mod.slot_type == "Arrow" and mod.primaryStat.unitStatId == 5:
                return self._evaluate_speed_arrow(mod)
            
            # Find speed in secondary stats
            speed_value, has_speed = self._get_speed_from_secondaries(mod)
            
            # Check if we can fully evaluate the mod
            if not self._can_fully_evaluate(mod):
                next_level = self._get_next_level_target(mod)
                return {
                    "verdict": "level",
                    "text": f"Level to {next_level}",
                    "reason": f"Need to reach level {next_level} to see all stats",
                    "className": "level"
                }
            
            # If no speed at all, it's a sell
            if not has_speed:
                return {
                    "verdict": "sell",
                    "text": "Sell",
                    "reason": "No speed secondary stat",
                    "className": "sell"
                }
            
            # Check thresholds based on tier and mode
            keep_threshold = self._get_keep_threshold(mod.tier, evaluation_mode)
            slice_threshold = self._get_slice_threshold(mod.tier, evaluation_mode)
            
            # If the mod doesn't meet keep threshold, sell it
            if speed_value < keep_threshold:
                return {
                    "verdict": "sell",
                    "text": "Sell",
                    "reason": f"Speed {speed_value} below threshold {keep_threshold}",
                    "className": "sell"
                }
            
            # If mod is level 15 and meets slice threshold, recommend slicing
            # UNLESS it's a 6-dot Gold mod (already maxed)
            if (mod.level == 15 and speed_value >= slice_threshold and 
                not (mod.dots == 6 and mod.tier == 5)):
                return {
                    "verdict": "slice",
                    "text": "Slice",
                    "reason": f"High speed {speed_value}, worth upgrading",
                    "className": "slice"
                }
            
            # Otherwise, it's a keeper
            return {
                "verdict": "keep",
                "text": "Keep",
                "reason": f"Good speed {speed_value}",
                "className": "keep"
            }
            
        except Exception as e:
            logger.error(f"Error evaluating mod {mod.id}: {str(e)}")
            return {
                "verdict": "sell",
                "text": "Error",
                "reason": "Evaluation error",
                "className": "sell"
            }
    
    def _evaluate_speed_arrow(self, mod: ProcessedMod) -> Dict[str, Any]:
        """Evaluate speed arrows (always keep)"""
        if mod.dots == 6 and mod.tier == 5:
            return {
                "verdict": "keep",
                "text": "Keep",
                "reason": "Speed arrow (maxed)",
                "className": "keep"
            }
        elif mod.level == 15:
            return {
                "verdict": "slice", 
                "text": "Slice",
                "reason": "Speed arrow (can be upgraded)",
                "className": "slice"
            }
        else:
            return {
                "verdict": "keep",
                "text": "Keep",
                "reason": "Speed arrow (level up first)",
                "className": "keep"
            }
    
    def _get_speed_from_secondaries(self, mod: ProcessedMod) -> tuple[int, bool]:
        """Extract speed value from secondary stats"""
        for stat in mod.secondaryStats:
            if stat.unitStatId == 5:  # Speed stat ID
                # Convert to integer (frontend shows as whole numbers)
                speed_value = int(stat.value)
                return speed_value, True
        return 0, False
    
    def _can_fully_evaluate(self, mod: ProcessedMod) -> bool:
        """Check if mod can be fully evaluated (level 12+ to see all rolls)"""
        return mod.level >= 12
    
    def _get_next_level_target(self, mod: ProcessedMod) -> int:
        """Get the next level target for incomplete mods"""
        tier = mod.tier
        level = mod.level
        
        # Grey: straight to 12
        if tier == 1:
            return 12
        
        # For others, need to see all secondaries first
        needed_reveals = 4 - (tier - 1)
        
        if needed_reveals > 0:
            if level < 3 and needed_reveals >= 4:
                return 3
            if level < 6 and needed_reveals >= 3:
                return 6
            if level < 9 and needed_reveals >= 2:
                return 9
            if level < 12 and needed_reveals >= 1:
                return 12
        
        return 12
    
    def _get_keep_threshold(self, tier: int, mode: str) -> int:
        """Get the keep threshold for a tier and mode"""
        if mode == "basic":
            # Basic mode thresholds
            thresholds = {
                1: 0,  # Grey - any speed
                2: 0,  # Green - any speed  
                3: 6,  # Blue
                4: 6,  # Purple
                5: 8   # Gold
            }
        else:  # strict mode
            thresholds = {
                1: 0,   # Grey - any speed
                2: 5,   # Green
                3: 8,   # Blue
                4: 10,  # Purple
                5: 10   # Gold
            }
        
        return thresholds.get(tier, 0)
    
    def _get_slice_threshold(self, tier: int, mode: str) -> int:
        """Get the slice threshold for a tier and mode"""
        if mode == "basic":
            thresholds = {
                1: 0,   # Grey - any speed
                2: 5,   # Green
                3: 8,   # Blue
                4: 10,  # Purple
                5: 12   # Gold (higher bar for slicing)
            }
        else:  # strict mode
            thresholds = {
                1: 0,   # Grey - any speed
                2: 8,   # Green
                3: 12,  # Blue
                4: 15,  # Purple
                5: 15   # Gold
            }
        
        return thresholds.get(tier, 0)
    
    def calculate_roll_efficiency(self, mod: ProcessedMod) -> dict:
        """Calculate roll quality efficiency - matches frontend exactly"""
        if not mod.secondaryStats:
            return {"overall": 0.0, "individual": {}}
        
        total_efficiency = 0.0
        stat_count = 0
        individual_stats = {}
        
        for i, stat in enumerate(mod.secondaryStats):
            # Calculate overall efficiency for this stat
            stat_efficiency = self._calculate_stat_efficiency(stat, mod.dots == 6)
            
            # Calculate individual roll efficiencies
            individual_rolls = self.calculate_individual_roll_efficiencies(stat)
            
            if stat_efficiency >= 0:
                total_efficiency += stat_efficiency
                stat_count += 1
            
            # Store individual stat data
            individual_stats[f"stat_{i}"] = {
                "efficiency": stat_efficiency,
                "rollEfficiencies": individual_rolls,
                "unitStatId": stat.unitStatId
            }
        
        overall_efficiency = total_efficiency / stat_count if stat_count > 0 else 0.0
        
        return {
            "overall": overall_efficiency,
            "individual": individual_stats
        }
    
    def _calculate_stat_efficiency(self, stat, is_6_dot: bool = False) -> float:
        """Calculate efficiency for a single stat - matches frontend logic exactly"""
        if not stat.statRollerBoundsMin or not stat.statRollerBoundsMax:
            return 0.0
        
        try:
            min_bound = int(stat.statRollerBoundsMin)
            max_bound = int(stat.statRollerBoundsMax)
            
            # Use unscaledRollValue for accurate per-roll analysis (matches frontend)
            if stat.unscaledRollValue and len(stat.unscaledRollValue) > 0:
                total_efficiency = 0.0
                
                for roll_value in stat.unscaledRollValue:
                    value = int(roll_value)
                    range_size = max_bound - min_bound
                    steps_from_min = value - min_bound
                    efficiency = ((steps_from_min + 1) / (range_size + 1)) * 100
                    total_efficiency += efficiency
                
                return total_efficiency / len(stat.unscaledRollValue)
            
            return 0.0
            
        except (ValueError, TypeError):
            return 0.0

    def calculate_individual_roll_efficiencies(self, stat) -> list:
        """Calculate individual roll efficiencies - matches frontend logic"""
        if not stat.statRollerBoundsMin or not stat.statRollerBoundsMax:
            return []
        
        try:
            min_bound = int(stat.statRollerBoundsMin)
            max_bound = int(stat.statRollerBoundsMax)
            
            if stat.unscaledRollValue and len(stat.unscaledRollValue) > 0:
                efficiencies = []
                for roll_value in stat.unscaledRollValue:
                    value = int(roll_value)
                    range_size = max_bound - min_bound
                    steps_from_min = value - min_bound
                    efficiency = ((steps_from_min + 1) / (range_size + 1)) * 100
                    efficiencies.append(efficiency)
                return efficiencies
            
            return []
            
        except (ValueError, TypeError):
            return []