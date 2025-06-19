from typing import List, Dict, Any, Optional
from models.mod import ProcessedMod, SecondaryStat, PrimaryStat, PlayerData
from datetime import datetime
import logging
from services.db_connection import DatabaseConnection  # ADD THIS

logger = logging.getLogger(__name__)

class ModProcessor:
    
    # Constants from your frontend
    MOD_SETS = {
        "1": "Health", "2": "Offense", "3": "Defense", "4": "Speed",
        "5": "Critical Chance", "6": "Critical Damage", "7": "Potency", "8": "Tenacity"
    }
    
    MOD_SLOTS = {
        "1": "Square", "2": "Arrow", "3": "Diamond",
        "4": "Triangle", "5": "Circle", "6": "Cross"
    }
    
    MOD_TIERS = {
        1: "Grey", 2: "Green", 3: "Blue", 4: "Purple", 5: "Gold"
    }

    def __init__(self):
        self.db = DatabaseConnection()  # ADD THIS
    
    def process_player_data(self, raw_data: Dict[str, Any], ally_code: str) -> PlayerData:
        """
        Process raw SWGOH API data and extract mod information
        
        Args:
            raw_data: Raw API response from SWGOH
            ally_code: Player's ally code
            
        Returns:
            Processed player data with mods
        """
        try:
            player_name = raw_data.get('name', 'Unknown Player')
            
            # Extract mods from roster
            all_mods = self.extract_mods_from_roster(raw_data)
            
            logger.info(f"Processed {len(all_mods)} total mods for player {player_name}")
            
            return PlayerData(
                playerName=player_name,
                allyCode=ally_code,
                lastUpdated=datetime.now().isoformat(),
                mods=all_mods,  # Use all_mods directly
                totalMods=len(all_mods),
                processedMods=len(all_mods)  # Same count since we're not filtering
            )
            
        except Exception as e:
            logger.error(f"Error processing player data for {ally_code}: {str(e)}")
            raise
    
    def extract_mods_from_roster(self, raw_data: Dict[str, Any]) -> List[ProcessedMod]:
        """Extract all mods from roster units"""
        mods = []
        
        roster_units = raw_data.get('rosterUnit', [])
        if not roster_units:
            logger.warning("No roster units found in player data")
            return mods
        
        for unit in roster_units:
            character_id = unit.get('definitionId', 'UNKNOWN')
            equipped_mods = unit.get('equippedStatMod', [])
            
            for mod_data in equipped_mods:
                try:
                    processed_mod = self.process_single_mod(mod_data, character_id)
                    if processed_mod:
                        mods.append(processed_mod)
                except Exception as e:
                    logger.warning(f"Failed to process mod {mod_data.get('id', 'unknown')}: {str(e)}")
                    continue

        logger.info(f"Extracted {len(mods)} total mods before filtering")
        
        return mods
    
    def process_single_mod(self, mod_data: Dict[str, Any], character_id: str) -> Optional[ProcessedMod]:
        """Process a single mod from raw API data"""
        try:
            # Extract basic mod info
            mod_id = mod_data.get('id', '')
            definition_id = mod_data.get('definitionId', '')
            level = mod_data.get('level', 1)
            tier = mod_data.get('tier', 1)
            locked = mod_data.get('locked', False)
            
            # Get the base character ID (remove star level)
            base_character_id = character_id.split(':')[0]
            # Look up the display name
            character_display_name = self.db.get_character_name(base_character_id)
            
            if not definition_id or len(definition_id) != 3:
                logger.warning(f"Invalid definition ID for mod {mod_id}: {definition_id}")
                return None
            
            # Parse definition ID
            set_key = definition_id[0]
            dots = int(definition_id[1])
            slot_key = definition_id[2]
            
            set_type = self.MOD_SETS.get(set_key, "Unknown")
            slot_type = self.MOD_SLOTS.get(slot_key, "Unknown")
            tier_name = self.MOD_TIERS.get(tier, "Unknown")
            
            # Process primary stat
            primary_stat_data = mod_data.get('primaryStat', {}).get('stat', {})
            primary_stat = PrimaryStat(
                unitStatId=primary_stat_data.get('unitStatId', 0),
                value=int(primary_stat_data.get('statValueDecimal', '0')) / 10000
            )
            
            # Process secondary stats
            secondary_stats = []
            secondary_stats_data = mod_data.get('secondaryStat', [])
            
            for stat_data in secondary_stats_data:
                stat_info = stat_data.get('stat', {})
                secondary_stat = SecondaryStat(
                    unitStatId=stat_info.get('unitStatId', 0),
                    value=int(stat_info.get('statValueDecimal', '0')) / 10000,
                    rolls=stat_data.get('statRolls', 1),
                    unscaledRollValue=stat_data.get('unscaledRollValue', []),
                    statRollerBoundsMin=stat_data.get('statRollerBoundsMin', ''),
                    statRollerBoundsMax=stat_data.get('statRollerBoundsMax', '')
                )
                secondary_stats.append(secondary_stat)
            
            return ProcessedMod(
                id=mod_id,
                definitionId=definition_id,
                level=level,
                tier=tier,
                locked=locked,
                characterId=character_id,
                characterDisplayName=character_display_name,  # ADD THIS
                primaryStat=primary_stat,
                secondaryStats=secondary_stats,
                dots=dots,
                set_type=set_type,
                slot_type=slot_type,
                tier_name=tier_name
            )
            
        except Exception as e:
            logger.error(f"Error processing single mod: {str(e)}")
            return None