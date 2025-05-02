"""
User profile API endpoints.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Rating
from app.utils.firebase import get_current_user
from app.utils.errors import BadRequestError, NotFoundError, ForbiddenError
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response validation
class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None
    college_id: str
    college_email_verified: bool
    average_rating: float

    class Config:
        from_attributes = True

class RatingResponse(BaseModel):
    id: str
    rater_id: str
    ratee_id: str
    ride_id: str
    rating: int
    review: Optional[str] = None

    class Config:
        from_attributes = True

class RiderProfileResponse(BaseModel):
    user: UserProfileResponse
    ratings: List[RatingResponse]

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a user's profile by ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")
    
    return user

@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    user_data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current user's profile.
    """
    user_id = current_user["uid"]
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User not found")
    
    # Update user data
    if user_data.first_name:
        user.first_name = user_data.first_name
    if user_data.last_name:
        user.last_name = user_data.last_name
    if user_data.profile_image_url:
        user.profile_image_url = user_data.profile_image_url
    
    db.commit()
    db.refresh(user)
    
    return user

@router.get("/{user_id}/ratings", response_model=List[RatingResponse])
async def get_user_ratings(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all ratings for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")
    
    ratings = db.query(Rating).filter(Rating.ratee_id == user_id).all()
    return ratings

@router.get("/{user_id}/profile", response_model=RiderProfileResponse)
async def get_rider_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a complete rider profile including user data and ratings.
    Used for displaying driver/rider profiles in the app.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")
    
    ratings = db.query(Rating).filter(Rating.ratee_id == user_id).all()
    
    return {
        "user": user,
        "ratings": ratings
    } 