from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class Rating(Base):
    """
    Model for user ratings and reviews.
    """
    __tablename__ = "ratings"

    id = Column(String, primary_key=True)
    rater_id = Column(String, ForeignKey("users.id"), nullable=False)
    ratee_id = Column(String, ForeignKey("users.id"), nullable=False)
    ride_id = Column(String, ForeignKey("rides.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    review = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Ensure rating is between 1 and 5
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    # Relationships
    # rater = relationship("User", back_populates="ratings_given", foreign_keys=[rater_id])
    # ratee = relationship("User", back_populates="ratings_received", foreign_keys=[ratee_id])
    # ride = relationship("Ride")

    def __repr__(self):
        return f"<Rating {self.id}: {self.rating}/5 from {self.rater_id} to {self.ratee_id}>" 