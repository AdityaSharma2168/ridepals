"""
Pit Stop API endpoints for managing pit stops.
"""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import PitStop, College
from app.utils.firebase import get_current_user
from app.utils.errors import NotFoundError
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response validation
class PitStopResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    college_id: Optional[str] = None
    discount_description: str
    discount_code: Optional[str] = None
    rating: float
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PitStopResponse])
async def get_pit_stops(
    college_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all pit stops, optionally filtered by college or category.
    """
    query = db.query(PitStop).filter(PitStop.is_active == True)
    
    # Apply college filter
    if college_id:
        # Verify college exists
        college = db.query(College).filter(College.id == college_id).first()
        if not college:
            raise NotFoundError(f"College with ID {college_id} not found")
        
        query = query.filter(PitStop.college_id == college_id)
    
    # Apply category filter
    if category:
        query = query.filter(PitStop.category == category)
    
    # Order by rating (highest first)
    pit_stops = query.order_by(PitStop.rating.desc()).all()
    
    return pit_stops

@router.get("/{pit_stop_id}", response_model=PitStopResponse)
async def get_pit_stop(
    pit_stop_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific pit stop by ID.
    """
    pit_stop = db.query(PitStop).filter(
        PitStop.id == pit_stop_id,
        PitStop.is_active == True
    ).first()
    
    if not pit_stop:
        raise NotFoundError(f"Pit stop with ID {pit_stop_id} not found")
    
    return pit_stop

@router.get("/college/{college_id}", response_model=List[PitStopResponse])
async def get_pit_stops_by_college(
    college_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all pit stops for a specific college.
    """
    # Verify college exists
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise NotFoundError(f"College with ID {college_id} not found")
    
    pit_stops = db.query(PitStop).filter(
        PitStop.college_id == college_id,
        PitStop.is_active == True
    ).order_by(PitStop.rating.desc()).all()
    
    return pit_stops

@router.get("/nearby/{latitude}/{longitude}", response_model=List[PitStopResponse])
async def get_nearby_pit_stops(
    latitude: float,
    longitude: float,
    max_distance_miles: float = 5.0,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get pit stops near a specific location.
    
    This is a simplified implementation that calculates distance using the Haversine formula.
    In a production environment, you might want to use PostGIS for more efficient geospatial queries.
    """
    # In a real application, you would use a database with geospatial support like PostGIS
    # For now, we'll fetch all pit stops and filter them in Python
    pit_stops = db.query(PitStop).filter(PitStop.is_active == True).all()
    
    # Calculate distance and filter
    nearby_pit_stops = []
    for pit_stop in pit_stops:
        # Calculate distance using Haversine formula
        # This would be replaced with a database query in a production environment
        distance = calculate_distance(latitude, longitude, pit_stop.latitude, pit_stop.longitude)
        
        if distance <= max_distance_miles:
            # Add distance to pit stop for sorting
            pit_stop.distance = distance
            nearby_pit_stops.append(pit_stop)
    
    # Sort by distance
    nearby_pit_stops.sort(key=lambda x: x.distance)
    
    return nearby_pit_stops

# Helper function to calculate distance between two points
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points using the Haversine formula.
    Returns distance in miles.
    """
    import math
    
    # Convert latitude and longitude from degrees to radians
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of Earth in miles
    r = 3956
    
    # Calculate distance
    return c * r 