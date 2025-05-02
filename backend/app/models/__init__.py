from sqlalchemy.orm import relationship
from app.models.college import College
from app.models.user import User
from app.models.ride import Ride, RideBooking
from app.models.pit_stop import PitStop, RidePitStop
from app.models.rating import Rating

# Activate relationships between models
# College relationships
College.users = relationship("User", back_populates="college")
College.rides_from = relationship("Ride", back_populates="from_college", foreign_keys="Ride.from_college_id")
College.rides_to = relationship("Ride", back_populates="to_college", foreign_keys="Ride.to_college_id")
College.pit_stops = relationship("PitStop", back_populates="college")

# User relationships
User.college = relationship("College", back_populates="users")
User.rides_as_driver = relationship("Ride", back_populates="driver")
User.rides_as_passenger = relationship("RideBooking", back_populates="passenger")
User.ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.rater_id")
User.ratings_received = relationship("Rating", back_populates="ratee", foreign_keys="Rating.ratee_id")

# Ride relationships
Ride.driver = relationship("User", back_populates="rides_as_driver")
Ride.from_college = relationship("College", back_populates="rides_from", foreign_keys=[Ride.from_college_id])
Ride.to_college = relationship("College", back_populates="rides_to", foreign_keys=[Ride.to_college_id])
Ride.bookings = relationship("RideBooking", back_populates="ride")
Ride.pit_stops = relationship("RidePitStop", back_populates="ride")
Ride.recurring_instances = relationship("Ride", back_populates="parent_ride")
Ride.parent_ride = relationship("Ride", back_populates="recurring_instances", remote_side=[Ride.id])

# RideBooking relationships
RideBooking.ride = relationship("Ride", back_populates="bookings")
RideBooking.passenger = relationship("User", back_populates="rides_as_passenger")

# PitStop relationships
PitStop.college = relationship("College", back_populates="pit_stops")
PitStop.ride_pit_stops = relationship("RidePitStop", back_populates="pit_stop")

# RidePitStop relationships
RidePitStop.ride = relationship("Ride", back_populates="pit_stops")
RidePitStop.pit_stop = relationship("PitStop", back_populates="ride_pit_stops")

# Rating relationships
Rating.rater = relationship("User", back_populates="ratings_given", foreign_keys=[Rating.rater_id])
Rating.ratee = relationship("User", back_populates="ratings_received", foreign_keys=[Rating.ratee_id])
Rating.ride = relationship("Ride") 