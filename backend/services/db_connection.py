import psycopg2
from psycopg2.extras import RealDictCursor
import os
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('POSTGRES_HOST', 'localhost')
        self.database = os.getenv('POSTGRES_DB', 'swgoh')
        self.user = os.getenv('POSTGRES_USER', 'postgres')
        self.password = os.getenv('POSTGRES_PASSWORD', 'frmdev1234')
        self.port = os.getenv('POSTGRES_PORT', '5432')
        
    def get_connection(self):
        """Create and return a database connection"""
        try:
            conn = psycopg2.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password,
                port=self.port
            )
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def get_character_names_batch(self, character_ids: List[str], language: str = 'Loc_ENG_US') -> Dict[str, str]:
        """
        Get character display names for multiple IDs in a single query
        
        Args:
            character_ids: List of character base IDs
            language: Language code for localization
            
        Returns:
            Dictionary mapping character_id -> display_name
        """
        if not character_ids:
            return {}
            
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Use parameterized query with ANY() for safe batch lookup
            cursor.execute("""
                SELECT cc.game_id, COALESCE(l.value, cc.game_id) as display_name
                FROM character_catalog cc
                LEFT JOIN localization l ON cc.name_key = l.localization_key 
                    AND l.language_code = %s
                WHERE cc.game_id = ANY(%s)
            """, (language, character_ids))
            
            results = cursor.fetchall()
            
            # Build the mapping dictionary
            character_names = {}
            for row in results:
                character_names[row[0]] = row[1]
            
            # For any characters not found, use the ID as fallback
            for char_id in character_ids:
                if char_id not in character_names:
                    character_names[char_id] = char_id
                    logger.warning(f"No character name found for {char_id}, using ID as fallback")
            
            logger.info(f"Successfully fetched {len(results)} character names out of {len(character_ids)} requested")
            return character_names
                
        except Exception as e:
            logger.error(f"Error fetching character names batch: {e}")
            # Return fallback mapping: ID -> ID
            return {char_id: char_id for char_id in character_ids}
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
            
    def get_character_name(self, base_id: str, language: str = 'Loc_ENG_US') -> str:
        """
        Get character display name from database (single query - DEPRECATED)
        
        Note: This method is kept for backward compatibility but should be avoided.
        Use get_character_names_batch() instead for better performance.
        """
        logger.warning("get_character_name() is deprecated. Use get_character_names_batch() instead.")
        
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT cc.name_key, l.value 
                FROM character_catalog cc
                LEFT JOIN localization l ON cc.name_key = l.localization_key 
                WHERE cc.game_id = %s AND l.language_code = %s
            """, (base_id, language))
            
            result = cursor.fetchone()
            if result and result[1]:
                return result[1]
            else:
                logger.warning(f"No character name found for {base_id}")
                return base_id
                
        except Exception as e:
            logger.error(f"Error fetching character name for {base_id}: {e}")
            return base_id
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()