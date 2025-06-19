from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SecondaryStat(BaseModel):
    unitStatId: int
    value: float
    rolls: int
    unscaledRollValue: Optional[List[str]] = []
    statRollerBoundsMin: Optional[str] = ""
    statRollerBoundsMax: Optional[str] = ""

class PrimaryStat(BaseModel):
    unitStatId: int
    value: float

class ProcessedMod(BaseModel):
    id: str
    definitionId: str
    level: int
    tier: int
    locked: bool
    characterId: str
    characterDisplayName: str
    primaryStat: PrimaryStat
    secondaryStats: List[SecondaryStat]
    
    # Additional metadata for processing
    dots: int
    set_type: str
    slot_type: str
    tier_name: str

class PlayerData(BaseModel):
    playerName: str
    allyCode: str
    lastUpdated: str
    mods: List[ProcessedMod]
    totalMods: int
    processedMods: int