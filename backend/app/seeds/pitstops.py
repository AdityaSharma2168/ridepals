"""
Seed data for pit stops.
"""
import uuid

# Sample pit stops for each college
pit_stops = [
    # Stanford
    {
        "id": str(uuid.uuid4()),
        "name": "Stanford Boba",
        "category": "Bubble Tea",
        "description": "Refreshing bubble tea spot near Stanford campus",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 Palm Drive, Stanford, CA",
        "latitude": 37.428,
        "longitude": -122.167,
        "college_id": "stanford",
        "discount_description": "10% off all drinks",
        "discount_code": "RIDEPAL10",
        "rating": 4.8,
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Coupa Café",
        "category": "Coffee",
        "description": "Premium coffee shop with a Latin American twist",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "456 Serra Mall, Stanford, CA",
        "latitude": 37.429,
        "longitude": -122.169,
        "college_id": "stanford",
        "discount_description": "Free cookie with any drink purchase",
        "discount_code": "FREECOOKIE",
        "rating": 4.6,
        "is_active": True,
    },
    
    # UC Berkeley
    {
        "id": str(uuid.uuid4()),
        "name": "Berkeley Boba",
        "category": "Bubble Tea",
        "description": "Popular bubble tea spot near UC Berkeley",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 Telegraph Ave, Berkeley, CA",
        "latitude": 37.870,
        "longitude": -122.257,
        "college_id": "berkeley",
        "discount_description": "Buy one get one 50% off",
        "discount_code": "BOGO50",
        "rating": 4.7,
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Strada Café",
        "category": "Coffee",
        "description": "Cozy coffee shop with a great study atmosphere",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "456 Bancroft Way, Berkeley, CA",
        "latitude": 37.868,
        "longitude": -122.255,
        "college_id": "berkeley",
        "discount_description": "20% off pastries",
        "discount_code": "PASTRY20",
        "rating": 4.5,
        "is_active": True,
    },
    
    # SFSU
    {
        "id": str(uuid.uuid4()),
        "name": "SFSU Bubble Tea",
        "category": "Bubble Tea",
        "description": "Trendy bubble tea shop on campus",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 Holloway Ave, San Francisco, CA",
        "latitude": 37.723,
        "longitude": -122.480,
        "college_id": "sfsu",
        "discount_description": "Free tapioca pearls upgrade",
        "discount_code": "FREETAPIOCA",
        "rating": 4.4,
        "is_active": True,
    },
    
    # SJSU
    {
        "id": str(uuid.uuid4()),
        "name": "Philz Coffee",
        "category": "Coffee",
        "description": "Customized coffee blends in downtown San Jose",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 Paseo de San Antonio, San Jose, CA",
        "latitude": 37.334,
        "longitude": -121.883,
        "college_id": "sjsu",
        "discount_description": "15% off any coffee",
        "discount_code": "PHILZ15",
        "rating": 4.9,
        "is_active": True,
    },
    
    # USF
    {
        "id": str(uuid.uuid4()),
        "name": "USF Café",
        "category": "Coffee",
        "description": "University café with great pastries",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 Golden Gate Ave, San Francisco, CA",
        "latitude": 37.775,
        "longitude": -122.451,
        "college_id": "usfca",
        "discount_description": "Free upsize on any drink",
        "discount_code": "UPSIZE",
        "rating": 4.3,
        "is_active": True,
    },
    
    # SCU
    {
        "id": str(uuid.uuid4()),
        "name": "Mission Café",
        "category": "Coffee",
        "description": "Coffee shop with a mission theme",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 El Camino Real, Santa Clara, CA",
        "latitude": 37.350,
        "longitude": -121.938,
        "college_id": "scu",
        "discount_description": "10% off all items",
        "discount_code": "SCU10",
        "rating": 4.7,
        "is_active": True,
    },
    
    # Food options
    {
        "id": str(uuid.uuid4()),
        "name": "Ike's Sandwiches",
        "category": "Food",
        "description": "Creative sandwiches with unique flavors",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 University Ave, Palo Alto, CA",
        "latitude": 37.445,
        "longitude": -122.161,
        "college_id": "stanford",
        "discount_description": "$2 off any sandwich",
        "discount_code": "IKES2",
        "rating": 4.7,
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Sliver Pizzeria",
        "category": "Food",
        "description": "Gourmet pizza with daily changing toppings",
        "image_url": "/placeholder.svg?height=80&width=80",
        "address": "123 Center St, Berkeley, CA",
        "latitude": 37.871,
        "longitude": -122.268,
        "college_id": "berkeley",
        "discount_description": "Free slice with purchase of a slice",
        "discount_code": "SLICE",
        "rating": 4.6,
        "is_active": True,
    }
]

def seed_pit_stops(db):
    """
    Seeds pit stop data to the database.
    """
    from app.models import PitStop
    
    for pit_stop_data in pit_stops:
        # Check if pit stop already exists
        existing = db.query(PitStop).filter(PitStop.name == pit_stop_data["name"], 
                                           PitStop.college_id == pit_stop_data["college_id"]).first()
        if not existing:
            pit_stop = PitStop(**pit_stop_data)
            db.add(pit_stop)
    
    db.commit() 