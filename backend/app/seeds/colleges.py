"""
Seed data for colleges.
This matches the colleges array in the frontend's college-context.tsx file.
"""

colleges = [
    {
        "id": "stanford",
        "name": "Stanford University",
        "location": "Stanford",
        "abbreviation": "Stanford",
        "latitude": 37.4275,
        "longitude": -122.1697,
        "zoom": 14,
    },
    {
        "id": "berkeley",
        "name": "University of California, Berkeley",
        "location": "Berkeley",
        "abbreviation": "UC Berkeley",
        "latitude": 37.8719,
        "longitude": -122.2585,
        "zoom": 14,
    },
    {
        "id": "sfsu",
        "name": "San Francisco State University",
        "location": "San Francisco",
        "abbreviation": "SFSU",
        "latitude": 37.7241,
        "longitude": -122.4799,
        "zoom": 14,
    },
    {
        "id": "sjsu",
        "name": "San Jose State University",
        "location": "San Jose",
        "abbreviation": "SJSU",
        "latitude": 37.3352,
        "longitude": -121.8811,
        "zoom": 14,
    },
    {
        "id": "usfca",
        "name": "University of San Francisco",
        "location": "San Francisco",
        "abbreviation": "USF",
        "latitude": 37.7767,
        "longitude": -122.4506,
        "zoom": 14,
    },
    {
        "id": "scu",
        "name": "Santa Clara University",
        "location": "Santa Clara",
        "abbreviation": "SCU",
        "latitude": 37.3496,
        "longitude": -121.939,
        "zoom": 14,
    },
    {
        "id": "csueb",
        "name": "California State University, East Bay",
        "location": "Hayward",
        "abbreviation": "CSUEB",
        "latitude": 37.6575,
        "longitude": -122.0567,
        "zoom": 14,
    },
    {
        "id": "mills",
        "name": "Mills College",
        "location": "Oakland",
        "abbreviation": "Mills",
        "latitude": 37.7802,
        "longitude": -122.1831,
        "zoom": 14,
    },
]

def seed_colleges(db):
    """
    Seeds college data to the database.
    """
    from app.models import College
    
    for college_data in colleges:
        # Check if college already exists
        existing = db.query(College).filter(College.id == college_data["id"]).first()
        if not existing:
            college = College(**college_data)
            db.add(college)
    
    db.commit() 