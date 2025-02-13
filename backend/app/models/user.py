from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base
from app.models.health_record import HealthRecord
from app.models.activity import Activity, ActivityParticipant
from app.models.pet import Pet
from app.models.guide import Guide

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    health_records = relationship(HealthRecord, back_populates="user", lazy="dynamic")
    activities = relationship(Activity, back_populates="organizer", lazy="dynamic")
    participations = relationship(ActivityParticipant, back_populates="user", lazy="dynamic")
    pets = relationship(Pet, back_populates="owner", lazy="dynamic")
    guides = relationship(Guide, back_populates="author", lazy="dynamic")
