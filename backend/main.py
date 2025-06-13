from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from config import settings

# Pydantic models for response validation
class PlayerResponse(BaseModel):
    message: str
    allyCode: str
    timestamp: str

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

@app.get("/api/player/{ally_code}", response_model=PlayerResponse)
async def get_player(ally_code: str):
    # Validate ally code format (9 digits)
    if not ally_code.isdigit() or len(ally_code) != 9:
        raise HTTPException(
            status_code=400, 
            detail="Ally code must be exactly 9 digits"
        )
    
    # Return hello world response
    return PlayerResponse(
        message="Hello World",
        allyCode=ally_code,
        timestamp=datetime.now().isoformat()
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