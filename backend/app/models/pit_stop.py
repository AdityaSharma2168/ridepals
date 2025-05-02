from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class PitStop(Base):
    """
    Model for businesses that can be selected as pit stops during rides.
    Aligns with the pit stop functionality in the frontend.
    """
    __tablename__ = "pit_stops"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Coffee, Food, etc.
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    
    # Location
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    college_id = Column(String, ForeignKey("colleges.id"), nullable=True)  # Associated college if applicable
    
    # Discount details
    discount_description = Column(String, nullable=False)  # "10% off", "Free cookie", etc.
    discount_code = Column(String, nullable=True)
    
    # Business details
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # college = relationship("College", back_populates="pit_stops")
    # ride_pit_stops = relationship("RidePitStop", back_populates="pit_stop")

    def __repr__(self):
        return f"<PitStop {self.name} ({self.id})>"


class RidePitStop(Base):
    """
    Join model to associate pit stops with rides.
    """
    __tablename__ = "ride_pit_stops"

    id = Column(String, primary_key=True)
    ride_id = Column(String, ForeignKey("rides.id"), nullable=False)
    pit_stop_id = Column(String, ForeignKey("pit_stops.id"), nullable=False)
    is_primary = Column(Boolean, default=False)  # Is this the main pit stop for the ride?
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # ride = relationship("Ride", back_populates="pit_stops")
    # pit_stop = relationship("PitStop", back_populates="ride_pit_stops")

    def __repr__(self):
        return f"<RidePitStop: Ride {self.ride_id}, PitStop {self.pit_stop_id}>" 