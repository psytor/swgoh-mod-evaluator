import os
from typing import Optional

class Settings:
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS settings
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",  # Vite dev server
        "http://localhost:5173",  # Alternative Vite port
        "https://farmroadmap.dynv6.net",  # Production frontend
        "https://farmroadmap.dynv6.net"  # HTTPS production
    ]
    
    # External API
    SWGOH_API_URL: str = os.getenv("SWGOH_API_URL", "http://swgoh_comlink:2500/player")
    
    # Cache settings
    CACHE_TTL_SECONDS: int = 3600  # 1 hour

settings = Settings()