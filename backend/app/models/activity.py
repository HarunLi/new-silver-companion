from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base

class ActivityType(enum.Enum):
    EXERCISE = "exercise"
    ENTERTAINMENT = "entertainment"
    EDUCATION = "education"
    TRAVEL = "travel"
    SOCIAL = "social"
    OTHER = "other"

class ActivityStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    location = Column(String, nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    max_participants = Column(Integer, nullable=True)
    is_online = Column(Boolean, default=False)
    category = Column(String)
    status = Column(String, default="scheduled")  # scheduled, ongoing, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    organizer_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    organizer = relationship("User", back_populates="activities")
    participants = relationship("ActivityParticipant", back_populates="activity")

class ActivityParticipant(Base):
    __tablename__ = "activity_participants"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="registered")  # registered, attended, cancelled
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    activity = relationship("Activity", back_populates="participants")
    user = relationship("User", back_populates="participations")
