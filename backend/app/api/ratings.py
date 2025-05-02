"""
Ratings API endpoints for submitting and retrieving user ratings.
"""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models import Rating, User, Ride, RideBooking
from app.utils.firebase import get_current_user
from app.utils.errors import BadRequestError, NotFoundError, ForbiddenError, ConflictError
from pydantic import BaseModel, validator

router = APIRouter()

# Pydantic models for request/response validation
class RatingCreateRequest(BaseModel):
    ride_id: str
    ratee_id: str  # The ID of the user being rated
    rating: int  # 1-5 stars
    review: Optional[str] = None
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class RatingResponse(BaseModel):
    id: str
    rater_id: str
    ratee_id: str
    ride_id: str
    rating: int
    review: Optional[str] = None
    rater_first_name: Optional[str] = None
    rater_last_name: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("/", response_model=RatingResponse)
async def create_rating(
    rating_data: RatingCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new rating for a user after a ride.
    """
    user_id = current_user["uid"]
    
    # Check if the ride exists
    ride = db.query(Ride).filter(Ride.id == rating_data.ride_id).first()
    if not ride:
        raise NotFoundError(f"Ride with ID {rating_data.ride_id} not found")
    
    # Check if the ratee exists
    ratee = db.query(User).filter(User.id == rating_data.ratee_id).first()
    if not ratee:
        raise NotFoundError(f"User with ID {rating_data.ratee_id} not found")
    
    # Check if the user participated in the ride (as driver or passenger)
    is_driver = ride.driver_id == user_id
    booking = db.query(RideBooking).filter(
        RideBooking.ride_id == rating_data.ride_id,
        RideBooking.passenger_id == user_id
    ).first()
    
    if not is_driver and not booking:
        raise ForbiddenError("You can only rate users from rides you participated in")
    
    # If the current user is the driver, make sure they're rating a passenger
    if is_driver:
        passenger_booking = db.query(RideBooking).filter(
            RideBooking.ride_id == rating_data.ride_id,
            RideBooking.passenger_id == rating_data.ratee_id,
            RideBooking.status == "completed"
        ).first()
        
        if not passenger_booking:
            raise BadRequestError("You can only rate passengers who completed this ride")
    
    # If the current user is a passenger, make sure they're rating the driver
    if booking and rating_data.ratee_id != ride.driver_id:
        raise BadRequestError("As a passenger, you can only rate the driver of the ride")
    
    # Check if the user already rated this person for this ride
    existing_rating = db.query(Rating).filter(
        Rating.ride_id == rating_data.ride_id,
        Rating.rater_id == user_id,
        Rating.ratee_id == rating_data.ratee_id
    ).first()
    
    if existing_rating:
        raise ConflictError("You have already rated this user for this ride")
    
    # Create the rating
    rating = Rating(
        id=str(uuid.uuid4()),
        rater_id=user_id,
        ratee_id=rating_data.ratee_id,
        ride_id=rating_data.ride_id,
        rating=rating_data.rating,
        review=rating_data.review
    )
    
    db.add(rating)
    
    # Update user's average rating
    # This would ideally be a trigger in the database or a background job in a production environment
    user_ratings = db.query(Rating).filter(Rating.ratee_id == rating_data.ratee_id).all()
    if user_ratings:
        avg_rating = sum(r.rating for r in user_ratings) / len(user_ratings)
        ratee.average_rating = avg_rating
    
    db.commit()
    db.refresh(rating)
    
    # Add rater's name to the response
    rater = db.query(User).filter(User.id == user_id).first()
    rating_response = RatingResponse(
        id=rating.id,
        rater_id=rating.rater_id,
        ratee_id=rating.ratee_id,
        ride_id=rating.ride_id,
        rating=rating.rating,
        review=rating.review,
        rater_first_name=rater.first_name,
        rater_last_name=rater.last_name
    )
    
    return rating_response

@router.get("/user/{user_id}", response_model=List[RatingResponse])
async def get_user_ratings(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all ratings for a specific user.
    """
    # Check if the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")
    
    # Get all ratings for the user
    ratings_query = db.query(
        Rating,
        User.first_name.label("rater_first_name"),
        User.last_name.label("rater_last_name")
    ).join(
        User, Rating.rater_id == User.id
    ).filter(
        Rating.ratee_id == user_id
    ).order_by(Rating.created_at.desc())
    
    # Convert query results to response objects
    ratings = []
    for rating, first_name, last_name in ratings_query:
        ratings.append(
            RatingResponse(
                id=rating.id,
                rater_id=rating.rater_id,
                ratee_id=rating.ratee_id,
                ride_id=rating.ride_id,
                rating=rating.rating,
                review=rating.review,
                rater_first_name=first_name,
                rater_last_name=last_name
            )
        )
    
    return ratings

@router.get("/ride/{ride_id}", response_model=List[RatingResponse])
async def get_ride_ratings(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all ratings for a specific ride.
    """
    # Check if the ride exists
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise NotFoundError(f"Ride with ID {ride_id} not found")
    
    # Get all ratings for the ride
    ratings_query = db.query(
        Rating,
        User.first_name.label("rater_first_name"),
        User.last_name.label("rater_last_name")
    ).join(
        User, Rating.rater_id == User.id
    ).filter(
        Rating.ride_id == ride_id
    ).order_by(Rating.created_at.desc())
    
    # Convert query results to response objects
    ratings = []
    for rating, first_name, last_name in ratings_query:
        ratings.append(
            RatingResponse(
                id=rating.id,
                rater_id=rating.rater_id,
                ratee_id=rating.ratee_id,
                ride_id=rating.ride_id,
                rating=rating.rating,
                review=rating.review,
                rater_first_name=first_name,
                rater_last_name=last_name
            )
        )
    
    return ratings 