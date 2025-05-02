"""
Ride API endpoints for creating, searching, and booking rides.
"""
import uuid
import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from typing import List, Optional
from math import radians, cos, sin, asin, sqrt

from app.database import get_db
from app.models import Ride, RideBooking, User, College, PitStop, RidePitStop
from app.utils.firebase import get_current_user
from app.utils.errors import BadRequestError, NotFoundError, ForbiddenError, ConflictError
from pydantic import BaseModel, validator

router = APIRouter()

# Haversine formula to calculate distance between two lat/long points
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in miles
    """
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 3956  # Radius of earth in miles
    return c * r

# Pydantic models for request/response validation
class RideCreateRequest(BaseModel):
    from_location: str
    to_location: str
    from_latitude: float
    from_longitude: float
    to_latitude: float
    to_longitude: float
    from_college_id: Optional[str] = None
    to_college_id: Optional[str] = None
    departure_time: datetime.datetime
    seats_available: int
    price_per_seat: float
    description: Optional[str] = None
    women_only: bool = False
    is_recurring: bool = False
    recurring_pattern: Optional[str] = None
    pit_stop_ids: Optional[List[str]] = None
    
    @validator('seats_available')
    def validate_seats(cls, v):
        if v < 1 or v > 8:
            raise ValueError('Seats available must be between 1 and 8')
        return v
    
    @validator('price_per_seat')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price per seat must be non-negative')
        return v

class PitStopResponse(BaseModel):
    id: str
    name: str
    category: str
    discount_description: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class DriverResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None
    average_rating: float
    college_id: str

    class Config:
        from_attributes = True

class RideResponse(BaseModel):
    id: str
    from_location: str
    to_location: str
    from_latitude: float
    from_longitude: float
    to_latitude: float
    to_longitude: float
    from_college_id: Optional[str] = None
    to_college_id: Optional[str] = None
    is_intercampus: bool
    departure_time: datetime.datetime
    seats_available: int
    price_per_seat: float
    description: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    estimated_distance_miles: Optional[float] = None
    women_only: bool
    is_recurring: bool
    recurring_pattern: Optional[str] = None
    status: str
    driver: DriverResponse
    pit_stops: Optional[List[PitStopResponse]] = None

    class Config:
        from_attributes = True

class BookingRequest(BaseModel):
    ride_id: str
    seats_booked: int = 1

class BookingResponse(BaseModel):
    id: str
    ride_id: str
    passenger_id: str
    seats_booked: int
    status: str
    payment_status: str
    payment_intent_id: Optional[str] = None
    ride: RideResponse
    
    class Config:
        from_attributes = True

@router.post("/", response_model=RideResponse)
async def create_ride(
    ride_data: RideCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new ride.
    """
    user_id = current_user["uid"]
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User not found")
    
    # Check if colleges exist if specified
    if ride_data.from_college_id:
        from_college = db.query(College).filter(College.id == ride_data.from_college_id).first()
        if not from_college:
            raise NotFoundError(f"College with ID {ride_data.from_college_id} not found")
    
    if ride_data.to_college_id:
        to_college = db.query(College).filter(College.id == ride_data.to_college_id).first()
        if not to_college:
            raise NotFoundError(f"College with ID {ride_data.to_college_id} not found")
    
    # Check if it's an intercampus ride
    is_intercampus = ride_data.from_college_id and ride_data.to_college_id and ride_data.from_college_id != ride_data.to_college_id
    
    # Create the ride
    ride = Ride(
        id=str(uuid.uuid4()),
        driver_id=user_id,
        from_location=ride_data.from_location,
        to_location=ride_data.to_location,
        from_latitude=ride_data.from_latitude,
        from_longitude=ride_data.from_longitude,
        to_latitude=ride_data.to_latitude,
        to_longitude=ride_data.to_longitude,
        from_college_id=ride_data.from_college_id,
        to_college_id=ride_data.to_college_id,
        is_intercampus=is_intercampus,
        departure_time=ride_data.departure_time,
        seats_available=ride_data.seats_available,
        price_per_seat=ride_data.price_per_seat,
        description=ride_data.description,
        women_only=ride_data.women_only,
        is_recurring=ride_data.is_recurring,
        recurring_pattern=ride_data.recurring_pattern if ride_data.is_recurring else None,
    )
    
    db.add(ride)
    
    # Add pit stops if specified
    if ride_data.pit_stop_ids:
        for pit_stop_id in ride_data.pit_stop_ids:
            pit_stop = db.query(PitStop).filter(PitStop.id == pit_stop_id).first()
            if not pit_stop:
                db.rollback()
                raise NotFoundError(f"Pit stop with ID {pit_stop_id} not found")
            
            ride_pit_stop = RidePitStop(
                id=str(uuid.uuid4()),
                ride_id=ride.id,
                pit_stop_id=pit_stop_id,
                is_primary=False  # Set primary pit stop if needed
            )
            db.add(ride_pit_stop)
    
    # For recurring rides, we would generate individual ride instances here
    # This would be handled by a background task in a production environment
    
    db.commit()
    db.refresh(ride)
    
    # Load pit stops for response
    ride_with_pit_stops = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    ).filter(Ride.id == ride.id).first()
    
    # Format response
    response = ride_with_pit_stops
    
    return response

@router.get("/", response_model=List[RideResponse])
async def search_rides(
    from_college_id: Optional[str] = None,
    to_college_id: Optional[str] = None,
    departure_date: Optional[datetime.date] = None,
    is_intercampus: Optional[bool] = None,
    include_women_only: bool = True,
    max_price: Optional[float] = None,
    min_seats: int = 1,
    start_latitude: Optional[float] = None,
    start_longitude: Optional[float] = None,
    max_distance: Optional[float] = 10.0,  # Default to 10 miles
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Search for rides with various filters.
    
    If start_latitude and start_longitude are provided, only rides within
    max_distance miles from that location will be returned.
    """
    user_id = current_user["uid"]
    
    # Base query
    query = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    )
    
    # Basic filters
    query = query.filter(Ride.status == "active")
    query = query.filter(Ride.seats_available >= min_seats)
    
    if from_college_id:
        query = query.filter(Ride.from_college_id == from_college_id)
    
    if to_college_id:
        query = query.filter(Ride.to_college_id == to_college_id)
    
    if is_intercampus is not None:
        query = query.filter(Ride.is_intercampus == is_intercampus)
    
    if departure_date:
        start_date = datetime.datetime.combine(departure_date, datetime.time.min)
        end_date = datetime.datetime.combine(departure_date, datetime.time.max)
        query = query.filter(Ride.departure_time.between(start_date, end_date))
    
    if max_price:
        query = query.filter(Ride.price_per_seat <= max_price)
    
    if not include_women_only:
        query = query.filter(Ride.women_only == False)
    else:
        # Include women-only rides if the user is a woman or all rides if include_women_only is True
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.gender != "female":
            query = query.filter(Ride.women_only == False)
    
    # Apply time filter - only get future rides
    now = datetime.datetime.now()
    query = query.filter(Ride.departure_time > now)
    
    # Get all rides that match the filters
    rides = query.all()
    
    # If start coordinates provided, filter by proximity
    if start_latitude is not None and start_longitude is not None:
        # Calculate distances
        rides_with_distance = []
        for ride in rides:
            distance = haversine_distance(
                start_latitude, 
                start_longitude, 
                ride.from_latitude, 
                ride.from_longitude
            )
            # Only include rides within the max distance
            if distance <= max_distance:
                # Add distance to the ride object for sorting and display
                setattr(ride, 'distance_from_start', distance)
                rides_with_distance.append(ride)
        
        # Sort by distance
        rides_with_distance.sort(key=lambda r: getattr(r, 'distance_from_start', float('inf')))
        return rides_with_distance
    
    # If no proximity filter, sort by departure time
    rides.sort(key=lambda r: r.departure_time)
    return rides

@router.get("/nearby", response_model=List[RideResponse])
async def find_nearby_rides(
    latitude: float = Query(..., description="Latitude of the starting point"),
    longitude: float = Query(..., description="Longitude of the starting point"),
    max_distance: float = Query(10.0, description="Maximum distance in miles"),
    departure_date: Optional[datetime.date] = None,
    min_seats: int = Query(1, description="Minimum number of seats required"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Find rides near a specific location.
    Uses haversine formula to calculate distance between coordinates.
    """
    user_id = current_user["uid"]
    
    # Base query
    query = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    )
    
    # Basic filters
    query = query.filter(Ride.status == "active")
    query = query.filter(Ride.seats_available >= min_seats)
    
    # Apply time filter - only get future rides
    now = datetime.datetime.now()
    query = query.filter(Ride.departure_time > now)
    
    if departure_date:
        start_date = datetime.datetime.combine(departure_date, datetime.time.min)
        end_date = datetime.datetime.combine(departure_date, datetime.time.max)
        query = query.filter(Ride.departure_time.between(start_date, end_date))
    
    # Get all rides that match the filters
    rides = query.all()
    
    # Calculate distances
    rides_with_distance = []
    for ride in rides:
        distance = haversine_distance(
            latitude, 
            longitude, 
            ride.from_latitude, 
            ride.from_longitude
        )
        # Only include rides within the max distance
        if distance <= max_distance:
            # Add distance to the ride object for sorting and display
            setattr(ride, 'distance_from_start', distance)
            rides_with_distance.append(ride)
    
    # Sort by distance
    rides_with_distance.sort(key=lambda r: getattr(r, 'distance_from_start', float('inf')))
    return rides_with_distance

@router.get("/{ride_id}", response_model=RideResponse)
async def get_ride(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific ride by ID.
    """
    ride = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    ).filter(Ride.id == ride_id).first()
    
    if not ride:
        raise NotFoundError(f"Ride with ID {ride_id} not found")
    
    return ride

@router.post("/book", response_model=BookingResponse)
async def book_ride(
    booking_data: BookingRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Book a ride.
    """
    user_id = current_user["uid"]
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User not found")
    
    # Get the ride
    ride = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    ).filter(Ride.id == booking_data.ride_id).first()
    
    if not ride:
        raise NotFoundError(f"Ride with ID {booking_data.ride_id} not found")
    
    # Check if the ride is active
    if ride.status != "active":
        raise BadRequestError("This ride is no longer available")
    
    # Check if the departure time is in the future
    if ride.departure_time <= datetime.datetime.now():
        raise BadRequestError("This ride has already departed")
    
    # Check if there are enough seats available
    if ride.seats_available < booking_data.seats_booked:
        raise BadRequestError(f"Only {ride.seats_available} seats available")
    
    # Check if the user is trying to book their own ride
    if ride.driver_id == user_id:
        raise BadRequestError("You cannot book your own ride")
    
    # Check if the user already has a booking for this ride
    existing_booking = db.query(RideBooking).filter(
        RideBooking.ride_id == booking_data.ride_id,
        RideBooking.passenger_id == user_id,
        RideBooking.status.in_(["pending", "confirmed"])
    ).first()
    
    if existing_booking:
        raise ConflictError("You already have a booking for this ride")
    
    # Create the booking
    booking = RideBooking(
        id=str(uuid.uuid4()),
        ride_id=booking_data.ride_id,
        passenger_id=user_id,
        seats_booked=booking_data.seats_booked,
        status="pending",  # Will be confirmed after payment
        payment_status="unpaid"
    )
    
    # Update available seats
    ride.seats_available -= booking_data.seats_booked
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Load ride for response
    booking_with_ride = db.query(RideBooking).options(
        joinedload(RideBooking.ride).joinedload(Ride.driver),
        joinedload(RideBooking.ride).joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    ).filter(RideBooking.id == booking.id).first()
    
    return booking_with_ride

@router.get("/my/driver", response_model=List[RideResponse])
async def get_my_rides_as_driver(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all rides where the current user is the driver.
    """
    user_id = current_user["uid"]
    
    rides = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    ).filter(
        Ride.driver_id == user_id
    ).order_by(Ride.departure_time).all()
    
    return rides

@router.get("/my/passenger", response_model=List[BookingResponse])
async def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all rides booked by the current user.
    """
    user_id = current_user["uid"]
    
    bookings = db.query(RideBooking).options(
        joinedload(RideBooking.ride).joinedload(Ride.driver),
        joinedload(RideBooking.ride).joinedload(Ride.pit_stops).joinedload(RidePitStop.pit_stop)
    ).filter(
        RideBooking.passenger_id == user_id
    ).order_by(RideBooking.created_at.desc()).all()
    
    return bookings 