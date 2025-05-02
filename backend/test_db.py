from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Use the same database URL as in our app
DATABASE_URL = "sqlite:///./ridepals.db"

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Query backend tables
    print("\n=== Database Tables ===")
    tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()
    
    if not tables:
        print("No tables found in the database.")
    else:
        for table in tables:
            print(f"Table: {table.name}")
            # Try to get column info
            try:
                cols = db.execute(text(f"PRAGMA table_info({table.name})")).fetchall()
                print(f"  Columns: {', '.join([col.name for col in cols])}")
                
                # Show sample data (first 3 rows)
                rows = db.execute(text(f"SELECT * FROM {table.name} LIMIT 3")).fetchall()
                if rows:
                    print(f"  Sample data ({len(rows)} rows):")
                    for row in rows:
                        print(f"    {row}")
                else:
                    print("  No data in table")
            except Exception as e:
                print(f"  Error getting info: {e}")
            
            print("-" * 40)

finally:
    db.close() 