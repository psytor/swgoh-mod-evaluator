import requests
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SWGOHAPIClient:
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.timeout = 30  # 30 second timeout
        
    async def fetch_player_data(self, ally_code: str) -> Optional[Dict[str, Any]]:
        """
        Fetch raw player data from SWGOH API
        
        Args:
            ally_code: 9-digit ally code string
            
        Returns:
            Raw API response as dictionary, or None if failed
        """
        payload = {
            "payload": {
                "allyCode": ally_code
            },
            "enums": False
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            logger.info(f"Fetching player data for ally code: {ally_code}")
            
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )
            
            # Check if request was successful
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Successfully fetched data for ally code: {ally_code}")
            
            return data
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout while fetching data for ally code: {ally_code}")
            return None
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error while fetching data for ally code: {ally_code}")
            return None
            
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error {e.response.status_code} for ally code: {ally_code}")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error for ally code {ally_code}: {str(e)}")
            return None
            
        except ValueError as e:
            logger.error(f"JSON decode error for ally code {ally_code}: {str(e)}")
            return None