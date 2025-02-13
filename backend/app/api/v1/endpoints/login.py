from datetime import timedelta
from typing import Any
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.crud.user import user as crud_user
from app.schemas.token import Token
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    logger.info(f"Login attempt for user: {form_data.username}")
    try:
        user = crud_user.authenticate(
            db, email=form_data.username, password=form_data.password
        )
        if not user:
            logger.warning(f"Authentication failed for user: {form_data.username}")
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        elif not user.is_active:
            logger.warning(f"Inactive user attempt to login: {form_data.username}")
            raise HTTPException(status_code=400, detail="Inactive user")
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
        logger.info(f"Login successful for user: {form_data.username}")
        return {
            "access_token": token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Error during login for user {form_data.username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-token", response_model=Token)
def test_token(current_user: User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user
