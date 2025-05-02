"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from typing import Optional
import json
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User as UserModel
from app.firebase_admin import get_current_user
from loguru import logger

router = APIRouter()
bearer_scheme = HTTPBearer()

# Request models
class UserRegister(BaseModel):
    """User registration request."""
    uid: str = Field(..., description="Firebase UID")
    email: EmailStr = Field(..., description="User email")
    college_id: str = Field(..., description="College ID")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    profile_image_url: Optional[str] = Field(None, description="Profile image URL")

class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")

# Response models
class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: str
    first_name: str
    last_name: str
    college_id: str
    profile_image_url: Optional[str] = None
    college_email_verified: bool
    face_verified: bool

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    firebase_user = Depends(get_current_user)
):
    """Register a new user with Firebase UID."""
    logger.info(f"Registering user: {user_data.email}")
    
    # Verify the Firebase token matches the user being registered
    if firebase_user.uid != user_data.uid:
        logger.error(f"UID mismatch in registration: token {firebase_user.uid} vs request {user_data.uid}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Firebase UID in token does not match the registration request"
        )
    
    # Check if user already exists by Firebase UID
    existing_user = db.query(UserModel).filter(UserModel.firebase_uid == user_data.uid).first()
    if existing_user:
        logger.info(f"User already exists with Firebase UID: {user_data.uid}")
        return existing_user
    
    # Check if email is already registered
    existing_email = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_email:
        logger.error(f"Email already registered: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )
    
    # Create new user
    try:
        new_user = UserModel(
            firebase_uid=user_data.uid,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            college_id=user_data.college_id,
            profile_image_url=user_data.profile_image_url,
            # Email is verified if it's a college email and Firebase says it's verified
            college_email_verified=firebase_user.email_verified and user_data.email.endswith(".edu")
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User registered successfully: {new_user.id}")
        return new_user
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )

@router.get("/session")
async def check_session(
    firebase_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check the current user's session."""
    try:
        # Look up the user in our database
        user = db.query(UserModel).filter(UserModel.firebase_uid == firebase_user.uid).first()
        
        if not user:
            # User exists in Firebase but not in our DB
            return {
                "authenticated": True,
                "firebase_user": {
                    "uid": firebase_user.uid,
                    "email": firebase_user.email,
                    "email_verified": firebase_user.email_verified,
                },
                "db_user": None,
                "status": "User exists in Firebase but not in the application database"
            }
        
        # Both Firebase and DB user exist
        return {
            "authenticated": True,
            "firebase_user": {
                "uid": firebase_user.uid,
                "email": firebase_user.email,
                "email_verified": firebase_user.email_verified,
            },
            "db_user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "college_id": user.college_id,
                "college_email_verified": user.college_email_verified,
            },
            "status": "User authenticated and found in database"
        }
    except Exception as e:
        logger.error(f"Error in session check: {str(e)}")
        return {
            "authenticated": False,
            "error": str(e),
            "status": "Error checking session"
        }

@router.post("/logout")
async def logout(response: Response):
    """Log out the current user."""
    try:
        # Clear any server-side session data if needed
        # Here we could clear session cookies if we were using them
        
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Error logging out: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log out: {str(e)}"
        ) 