from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base

class Guide(Base):
    __tablename__ = "guides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, index=True)
    difficulty = Column(String, default="beginner")  # beginner, intermediate, advanced
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    author = relationship("User", back_populates="guides")
    steps = relationship("GuideStep", back_populates="guide", order_by="GuideStep.order")

class GuideStep(Base):
    __tablename__ = "guide_steps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    content = Column(Text)
    order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    guide_id = Column(Integer, ForeignKey("guides.id"))

    # Relationships
    guide = relationship("Guide", back_populates="steps")
