import psycopg2
from psycopg2.extras import RealDictCursor
import os
import logging

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
            
    def get_character_name(self, base_id: str, language: str = 'Loc_ENG_US') -> str:
        """Get character display name from database"""
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # First get the name_key from character_catalog
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