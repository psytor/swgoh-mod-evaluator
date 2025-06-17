from typing import Dict, Any, List
from models.mod import ProcessedMod
import logging

logger = logging.getLogger(__name__)

class EvaluationEngine:
    
    def __init__(self):

        pass

    
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