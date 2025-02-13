from typing import Optional
from pydantic import BaseModel
from .app_user import AppUser

class Token(BaseModel):
    access_token: str
    token_type: str
    user: AppUser

class TokenPayload(BaseModel):
    sub: Optional[int] = None
