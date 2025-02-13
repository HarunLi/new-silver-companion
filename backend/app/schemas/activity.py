from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class ActivityBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    max_participants: Optional[int] = None
    is_online: bool = False
    category: str
    status: str = "scheduled"  # scheduled, ongoing, completed, cancelled

# Properties to receive on activity creation
class ActivityCreate(ActivityBase):
    pass

# Properties to receive on activity update
class ActivityUpdate(ActivityBase):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_participants: Optional[int] = None
    is_online: Optional[bool] = None
    category: Optional[str] = None
    status: Optional[str] = None

# Properties shared by models stored in DB
class ActivityInDBBase(ActivityBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Activity(ActivityInDBBase):
    participant_count: int = 0
    is_participant: Optional[bool] = None

# Properties stored in DB
class ActivityInDB(ActivityInDBBase):
    pass

# Activity participant schema
class ActivityParticipantBase(BaseModel):
    activity_id: int
    user_id: int
    status: str = "registered"  # registered, attended, cancelled

class ActivityParticipantCreate(ActivityParticipantBase):
    pass

class ActivityParticipant(ActivityParticipantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
