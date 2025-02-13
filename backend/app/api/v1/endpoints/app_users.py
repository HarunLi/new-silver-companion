from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.AppUser])
def read_app_users(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    phone: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve app users.
    """
    app_users = crud.app_user.get_multi(
        db, skip=skip, limit=limit, phone=phone, is_active=is_active
    )
    return app_users

@router.get("/{user_id}", response_model=schemas.AppUser)
def read_app_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get app user by ID.
    """
    app_user = crud.app_user.get(db, id=user_id)
    if not app_user:
        raise HTTPException(status_code=404, detail="App user not found")
    return app_user

@router.put("/{user_id}", response_model=schemas.AppUser)
def update_app_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.AppUserUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update an app user.
    """
    app_user = crud.app_user.get(db, id=user_id)
    if not app_user:
        raise HTTPException(status_code=404, detail="App user not found")
    app_user = crud.app_user.update(db, db_obj=app_user, obj_in=user_in)
    return app_user

@router.delete("/{user_id}")
def delete_app_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete an app user.
    """
    app_user = crud.app_user.get(db, id=user_id)
    if not app_user:
        raise HTTPException(status_code=404, detail="App user not found")
    app_user = crud.app_user.remove(db, id=user_id)
    return {"status": "success"}
