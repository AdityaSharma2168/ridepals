from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.orm import relationship

from app.database import Base

class College(Base):
    """
    College model representing universities in the Bay Area.
    This aligns with the College type in the frontend's college-context.tsx.
    """
    __tablename__ = "colleges"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    abbreviation = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zoom = Column(Integer, nullable=False, default=14)

    # Relationships - will be uncommented as we add other models
    # users = relationship("User", back_populates="college")
    # rides_from = relationship("Ride", back_populates="from_college", foreign_keys="Ride.from_college_id")
    # rides_to = relationship("Ride", back_populates="to_college", foreign_keys="Ride.to_college_id")
    # pit_stops = relationship("PitStop", back_populates="college")

    def __repr__(self):
        return f"<College {self.abbreviation} ({self.id})>" 