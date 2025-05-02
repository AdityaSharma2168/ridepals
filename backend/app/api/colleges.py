from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import College
from app.utils.errors import NotFoundError
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response validation
class CollegeResponse(BaseModel):
    id: str
    name: str
    location: str
    abbreviation: str
    latitude: float
    longitude: float
    zoom: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CollegeResponse])
async def get_all_colleges(db: Session = Depends(get_db)):
    """
    Get all colleges.
    This endpoint returns all colleges in the database,
    which directly aligns with the colleges array in the frontend context.
    """
    colleges = db.query(College).all()
    return colleges

@router.get("/{college_id}", response_model=CollegeResponse)
async def get_college_by_id(college_id: str, db: Session = Depends(get_db)):
    """
    Get a specific college by ID.
    """
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise NotFoundError(detail=f"College with id {college_id} not found")
    return college 