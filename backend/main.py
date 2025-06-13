from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from config import settings
from services.api_client import SWGOHAPIClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize API client
api_client = SWGOHAPIClient(settings.SWGOH_API_URL)

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

@app.get("/")
async def root():
    return {"message": "SWGOH Mod Evaluator API is running"}

@app.get("/api/player/{ally_code}")
async def get_player(ally_code: str):
    # Validate ally code format (9 digits)
    if not ally_code.isdigit() or len(ally_code) != 9:
        raise HTTPException(
            status_code=400, 
            detail="Ally code must be exactly 9 digits"
        )
    
    try:
        # Fetch raw player data from SWGOH API
        player_data = await api_client.fetch_player_data(ally_code)
        
        if player_data is None:
            raise HTTPException(
                status_code=503,
                detail="Failed to fetch player data from SWGOH API"
            )
        
        # Return the raw API response for now
        return {
            "success": True,
            "allyCode": ally_code,
            "timestamp": datetime.now().isoformat(),
            "data": player_data
        }
        
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