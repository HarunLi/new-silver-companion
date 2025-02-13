from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Guide step schemas
class GuideStepBase(BaseModel):
    title: str
    description: str
    content: str
    order: int

class GuideStepCreate(GuideStepBase):
    pass

class GuideStepUpdate(GuideStepBase):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None

class GuideStepInDBBase(GuideStepBase):
    id: int
    guide_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GuideStep(GuideStepInDBBase):
    pass

# Guide schemas
class GuideBase(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    is_published: bool = False

class GuideCreate(GuideBase):
    pass

class GuideUpdate(GuideBase):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    is_published: Optional[bool] = None

class GuideInDBBase(GuideBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Guide(GuideInDBBase):
    pass

class GuideWithSteps(Guide):
    steps: List[GuideStep] = []
