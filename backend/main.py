from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from config import settings
import json
import os
from services.api_client import SWGOHAPIClient
from services.mod_processor import ModProcessor
from services.evaluation_engine import EvaluationEngine
from services.cache_manager import CacheManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize API client
api_client = SWGOHAPIClient(settings.SWGOH_API_URL)
mod_processor = ModProcessor()
evaluation_engine = EvaluationEngine()
cache_manager = CacheManager(ttl_hours=1)

# Initialize FastAPI app
app = FastAPI(
    title="SWGOH Mod Evaluator API",
    description="Backend API for SWGOH Mod Evaluation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    return cache_manager.get_cache_stats()

@app.delete("/api/cache/{ally_code}")
async def clear_player_cache(ally_code: str):
    """Clear cache for specific player"""
    cache_key = f"player_{ally_code}"
    cache_manager.clear(cache_key)
    return {"message": f"Cache cleared for ally code {ally_code}"}

@app.delete("/api/cache")
async def clear_all_cache():
    """Clear entire cache"""
    cache_manager.clear()
    return {"message": "All cache cleared"}

@app.get("/")
async def root():
    return {"message": "SWGOH Mod Evaluator API is running"}

@app.get("/api/character-names")
async def get_character_names():
    """Serve character names from shared data"""
    try:
        char_file = Path("/app/shared-data/charname.json")
        if char_file.exists():
            with open(char_file, 'r') as f:
                character_data = json.load(f)
            
            # Return the raw array format to preserve all data including language code
            return character_data
        else:
            logger.warning("Character names file not found")
            return {}
    except Exception as e:
        logger.error(f"Error loading character names: {e}")
        return {}

@app.get("/api/player/{ally_code}")
async def get_player(ally_code: str):
    # Validate ally code format (9 digits)
    if not ally_code.isdigit() or len(ally_code) != 9:
        raise HTTPException(
            status_code=400, 
            detail="Ally code must be exactly 9 digits"
        )
    
    try:
        # Check cache first
        cache_key = f"player_{ally_code}"
        cached_response = cache_manager.get(cache_key)
        
        if cached_response:
            logger.info(f"Returning cached data for ally code: {ally_code}")
            # Mark as cached before returning
            cached_response["cached"] = True
            cached_response["dataSource"] = "cache"
            return cached_response
        
        # Fetch raw player data from SWGOH API
        raw_player_data = await api_client.fetch_player_data(ally_code)
        
        if raw_player_data is None:
            raise HTTPException(
                status_code=503,
                detail="Failed to fetch player data from SWGOH API"
            )
        
        # Process the raw data to extract mods
        processed_data = mod_processor.process_player_data(raw_player_data, ally_code)
        
        # Evaluate all mods with both Basic and Strict modes
        evaluated_mods = []
        collection_stats = {
            "totalMods": len(processed_data.mods),
            "byDots": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0},
            "byTier": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
            "byRecommendation": {
                "basic": {"K": 0, "S": 0, "SL": 0, "LV": 0},
                "strict": {"K": 0, "S": 0, "SL": 0, "LV": 0}
            }
        }

        # Convert character names list to dictionary for efficient lookup
        character_names_list = await get_character_names()
        character_names = {}
        for char in character_names_list:
            if len(char) >= 3:
                character_names[char[0]] = char[2]
        
        for mod in processed_data.mods:
            # Calculate efficiency data (still needed for display)
            efficiency_data = evaluation_engine.calculate_roll_efficiency(mod)
            
            # Build compact mod structure WITHOUT evaluations
            minimal_mod = {
                "id": mod.id,
                "d": mod.definitionId,          # definitionId
                "l": mod.level,                 # level
                "t": mod.tier,                  # tier
                "k": mod.locked,                # locked
                "c": mod.characterId.split(':')[0],  # character
                "p": {                          # primary stat
                    "i": mod.primaryStat.unitStatId,
                    "v": round(mod.primaryStat.value, 4)
                },
                "s": [],                        # secondary stats
                # REMOVED: "ev" evaluation results
                "e": round(efficiency_data["overall"], 1)  # overall efficiency
            }
            
            # Build secondary stats with individual efficiencies
            for i, stat in enumerate(mod.secondaryStats):
                stat_key = f"stat_{i}"
                stat_efficiency_data = efficiency_data["individual"].get(stat_key, {})
                
                minimal_mod["s"].append({
                    "i": stat.unitStatId,
                    "v": round(stat.value, 4),
                    "r": stat.rolls,
                    "e": round(stat_efficiency_data.get("efficiency", 0), 1),
                    "re": [round(e, 1) for e in stat_efficiency_data.get("rollEfficiencies", [])]
                })
            
            evaluated_mods.append(minimal_mod)

        # Build complete response
        response_data = {
            "success": True,
            "playerName": processed_data.playerName,
            "allyCode": processed_data.allyCode,
            "lastUpdated": processed_data.lastUpdated,
            "dataSource": "api",
            "cached": False,
            "mods": evaluated_mods,  # No evaluation data included
            "collectionStats": collection_stats
        }
        
        # Cache the response
        cache_manager.set(cache_key, response_data)
        
        return response_data
        
    except Exception as e:
        logger.error(f"Unexpected error for ally code {ally_code}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG
    )