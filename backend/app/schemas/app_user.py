from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, constr

class AppUserBase(BaseModel):
    phone: constr(regex=r'^\d{11}$')
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    is_active: bool = True

class AppUserCreate(AppUserBase):
    pass

class AppUserUpdate(BaseModel):
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    is_active: Optional[bool] = None

class AppUserInDBBase(AppUserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class AppUser(AppUserInDBBase):
    pass

class AppUserInDB(AppUserInDBBase):
    pass
