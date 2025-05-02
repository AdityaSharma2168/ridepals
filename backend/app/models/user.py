from sqlalchemy import Column, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base

class User(Base):
    """
    User model storing profile information and linking to Firebase authentication.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    firebase_uid = Column(String, unique=True, nullable=True)  # Firebase UID field
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    profile_image_url = Column(String, nullable=True)
    college_id = Column(String, ForeignKey("colleges.id"), nullable=False)
    college_email_verified = Column(Boolean, default=False)
    face_verified = Column(Boolean, default=False)
    average_rating = Column(Float, default=0.0)
    stripe_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships - will be uncommented as we add other models
    # college = relationship("College", back_populates="users")
    # rides_as_driver = relationship("Ride", back_populates="driver")
    # rides_as_passenger = relationship("RideBooking", back_populates="passenger")
    # ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.rater_id")
    # ratings_received = relationship("Rating", back_populates="ratee", foreign_keys="Rating.ratee_id")

    def __repr__(self):
        return f"<User {self.email} ({self.id})>" 