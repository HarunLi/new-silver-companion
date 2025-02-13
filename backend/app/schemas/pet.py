from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class PetBase(BaseModel):
    name: str
    type: str
    breed: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    health: int = 100
    happiness: int = 100
    level: int = 1
    experience: int = 0

# Properties to receive on pet creation
class PetCreate(PetBase):
    pass

# Properties to receive on pet update
class PetUpdate(PetBase):
    name: Optional[str] = None
    type: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    health: Optional[int] = None
    happiness: Optional[int] = None
    level: Optional[int] = None
    experience: Optional[int] = None

# Properties shared by models stored in DB
class PetInDBBase(PetBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Pet(PetInDBBase):
    pass

# Properties stored in DB
class PetInDB(PetInDBBase):
    pass

# Pet interaction base schema
class PetInteractionBase(BaseModel):
    type: str
    description: str
    health_effect: int = 0
    happiness_effect: int = 0
    experience_gain: int = 0

# Properties to receive on pet interaction creation
class PetInteractionCreate(PetInteractionBase):
    pass

# Properties to return to client
class PetInteraction(PetInteractionBase):
    id: int
    pet_id: int
    created_at: datetime

    class Config:
        from_attributes = True
