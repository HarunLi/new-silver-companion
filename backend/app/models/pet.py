from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base

class PetType(enum.Enum):
    CAT = "cat"
    DOG = "dog"
    BIRD = "bird"
    RABBIT = "rabbit"
    OTHER = "other"

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    breed = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    level = Column(Integer, default=1)
    health = Column(Float, default=100.0)
    happiness = Column(Float, default=100.0)
    experience = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="pets")
    interactions = relationship("PetInteraction", back_populates="pet")

class PetInteraction(Base):
    __tablename__ = "pet_interactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # feed, play, sleep, etc.
    description = Column(Text)
    health_effect = Column(Integer, default=0)
    happiness_effect = Column(Integer, default=0)
    experience_gain = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign keys
    pet_id = Column(Integer, ForeignKey("pets.id"))

    # Relationships
    pet = relationship("Pet", back_populates="interactions")
