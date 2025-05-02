from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class Ride(Base):
    """
    Ride model for storing ride details.
    This aligns with the Ride type in the frontend.
    """
    __tablename__ = "rides"

    id = Column(String, primary_key=True)
    driver_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Origin and destination
    from_location = Column(String, nullable=False)
    to_location = Column(String, nullable=False)
    from_latitude = Column(Float, nullable=False)
    from_longitude = Column(Float, nullable=False)
    to_latitude = Column(Float, nullable=False)
    to_longitude = Column(Float, nullable=False)
    
    # College relation (optional - for intercampus rides)
    from_college_id = Column(String, ForeignKey("colleges.id"), nullable=True)
    to_college_id = Column(String, ForeignKey("colleges.id"), nullable=True)
    is_intercampus = Column(Boolean, default=False)
    
    # Ride details
    departure_time = Column(DateTime(timezone=True), nullable=False)
    seats_available = Column(Integer, nullable=False)
    price_per_seat = Column(Float, nullable=False)
    
    # Optional details
    description = Column(Text, nullable=True)
    route_polyline = Column(Text, nullable=True)  # Encoded route polyline from Mapbox
    estimated_duration_minutes = Column(Integer, nullable=True)
    estimated_distance_miles = Column(Float, nullable=True)
    
    # Preferences
    women_only = Column(Boolean, default=False)
    
    # For recurring rides
    is_recurring = Column(Boolean, default=False)
    recurring_pattern = Column(String, nullable=True)  # E.g., "WEEKLY_MWF"
    parent_ride_id = Column(String, ForeignKey("rides.id"), nullable=True)  # For instances of recurring rides
    
    # Status and metadata
    status = Column(String, default="active")  # active, cancelled, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships - will be uncommented as we add related models
    # driver = relationship("User", back_populates="rides_as_driver")
    # from_college = relationship("College", back_populates="rides_from", foreign_keys=[from_college_id])
    # to_college = relationship("College", back_populates="rides_to", foreign_keys=[to_college_id])
    # bookings = relationship("RideBooking", back_populates="ride")
    # pit_stops = relationship("RidePitStop", back_populates="ride")
    # recurring_instances = relationship("Ride", back_populates="parent_ride")
    # parent_ride = relationship("Ride", back_populates="recurring_instances", remote_side=[id])

    def __repr__(self):
        return f"<Ride {self.id}: {self.from_location} → {self.to_location}>"


class RideBooking(Base):
    """
    Model for storing ride bookings/reservations.
    """
    __tablename__ = "ride_bookings"

    id = Column(String, primary_key=True)
    ride_id = Column(String, ForeignKey("rides.id"), nullable=False)
    passenger_id = Column(String, ForeignKey("users.id"), nullable=False)
    seats_booked = Column(Integer, default=1)
    status = Column(String, default="pending")  # pending, confirmed, cancelled, completed
    payment_status = Column(String, default="unpaid")  # unpaid, pending, paid, refunded
    payment_intent_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # ride = relationship("Ride", back_populates="bookings")
    # passenger = relationship("User", back_populates="rides_as_passenger")

    def __repr__(self):
        return f"<RideBooking {self.id}: Ride {self.ride_id}, Passenger {self.passenger_id}>" 