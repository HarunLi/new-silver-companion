from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    record_type = Column(String(50), nullable=False)
    description = Column(Text)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="active")

    # Relationships
    user = relationship("User", back_populates="health_records", lazy="joined")
