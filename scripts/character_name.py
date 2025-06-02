from dotenv import load_dotenv
import os
import sys
import psycopg2
import json

project_root = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))
sys.path.insert(0, project_root)

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")

def db_connect():
    """
    Create a connection to the PostgreSQL database.
    Uses environment variables for connection detailsAdd commentMore actions

    Returns:
    A PostgreSQL database connection object
    """

    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        return connection
    except Exception as e:
        print(f"Connection failed: {e}")

def execute_query(query):
    """
    Execute a single SQL query and return the results.
    
    Args:Add commentMore actions
        query (str): SQL query to execute
        
    Returns:
        list: Query results if applicable
    """
    conn=None
    cursor=None

    try:
        conn=db_connect()
        cursor=conn.cursor()

        safe_query=query

        cursor.execute(query)
        conn.commit()

        try:
            results=cursor.fetchall()
            rows_count=len(results)
            return results
        except psycopg2.ProgrammingError:
            print("Query executed successfully without result")
            return None
    
    except Exception as e:
        if conn:
            conn.rollback()
        
        print(f"Query Failed: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_charname_json():
    """
    Script to fetch character names from DB and clean it for Mod Evaluator

    End Result save a json file for the Mod Evaluator
    """

    json_list = []

    try:

        fetch_query = "SELECT localization_key,language_code,value FROM localization WHERE localization_key LIKE 'UNIT%NAME'"
        charname_list = execute_query(fetch_query)

        for unit in charname_list:
            local_name = unit[0]
            charname = local_name.removeprefix('UNIT_').removesuffix('_NAME')

            new_unit = (charname, unit[1], unit[2])
            json_list.append(new_unit)

        with open("../src/assets/charname.json", "w") as f:
            json.dump(json_list, f)

    except Exception as e:
        print(f"Could not complete the JSON creation: {e}")

if __name__ == "__main__":
    get_charname_json()