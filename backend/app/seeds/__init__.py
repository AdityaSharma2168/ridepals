"""
Database seeding utilities.
"""
from app.seeds.colleges import seed_colleges
from app.seeds.pitstops import seed_pit_stops

def seed_all(db):
    """
    Run all seed functions to populate the database with initial data.
    """
    # Seed in order of dependencies
    seed_colleges(db)
    seed_pit_stops(db)
    # Additional seed functions will be added here as they are created 