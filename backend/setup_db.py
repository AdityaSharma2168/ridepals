"""
Database setup and seeding script.

This script:
1. Connects to the database
2. Creates all tables (if they don't exist)
3. Seeds the database with initial data

Usage:
    python setup_db.py
"""
import os
import sys
from loguru import logger

# Add the current directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models import *  # Import all models to ensure they're registered with Base
from app.seeds import seed_all

def setup_database():
    """
    Sets up the database by creating tables and seeding with initial data.
    """
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")
    
    # Create a session and seed the database
    db = SessionLocal()
    try:
        logger.info("Seeding database with initial data...")
        seed_all(db)
        logger.info("Database seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting database setup...")
    setup_database()
    logger.info("Database setup complete!") 