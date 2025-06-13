from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, ttl_hours: int = 1):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = timedelta(hours=ttl_hours)
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get cached data if still valid"""
        if key not in self.cache:
            logger.info(f"Cache miss for key: {key}")
            return None
        
        cached_item = self.cache[key]
        cached_time = cached_item.get('timestamp')
        
        if not cached_time or datetime.now() - cached_time > self.ttl:
            logger.info(f"Cache expired for key: {key}")
            del self.cache[key]
            return None
        
        logger.info(f"Cache hit for key: {key}")
        return cached_item.get('data')
    
    def set(self, key: str, data: Dict[str, Any]) -> None:
        """Cache data with timestamp"""
        self.cache[key] = {
            'data': data,
            'timestamp': datetime.now()
        }
        logger.info(f"Cached data for key: {key}")
    
    def clear(self, key: str = None) -> None:
        """Clear specific key or entire cache"""
        if key:
            if key in self.cache:
                del self.cache[key]
                logger.info(f"Cleared cache for key: {key}")
        else:
            self.cache.clear()
            logger.info("Cleared entire cache")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_items = len(self.cache)
        valid_items = 0
        expired_items = 0
        
        now = datetime.now()
        for item in self.cache.values():
            cached_time = item.get('timestamp')
            if cached_time and now - cached_time <= self.ttl:
                valid_items += 1
            else:
                expired_items += 1
        
        return {
            'total_items': total_items,
            'valid_items': valid_items,
            'expired_items': expired_items,
            'ttl_hours': self.ttl.total_seconds() / 3600
        }