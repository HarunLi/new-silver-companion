from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.guide import guide as crud_guide
from app.models.user import User
from app.schemas.guide import (
    Guide,
    GuideCreate,
    GuideUpdate,
    GuideWithSteps,
    GuideStep,
    GuideStepCreate,
    GuideStepUpdate
)

router = APIRouter()

@router.post("/", response_model=GuideWithSteps)
def create_guide(
    *,
    db: Session = Depends(deps.get_db),
    guide_in: GuideCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new guide.
    """
    guide = crud_guide.create_with_creator(
        db=db, obj_in=guide_in, creator_id=current_user.id
    )
    return guide

@router.get("/", response_model=List[Guide])
def read_guides(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve guides.
    """
    if current_user.is_superuser:
        guides = crud_guide.get_multi(db, skip=skip, limit=limit)
    else:
        guides = crud_guide.get_published(db, skip=skip, limit=limit)
    return guides

@router.get("/{guide_id}", response_model=GuideWithSteps)
def read_guide(
    *,
    db: Session = Depends(deps.get_db),
    guide_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get guide by ID.
    """
    guide = crud_guide.get(db=db, id=guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if not guide.is_published and not current_user.is_superuser and guide.creator_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return guide

@router.put("/{guide_id}", response_model=Guide)
def update_guide(
    *,
    db: Session = Depends(deps.get_db),
    guide_id: int,
    guide_in: GuideUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update a guide.
    """
    guide = crud_guide.get(db=db, id=guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if not current_user.is_superuser and (guide.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    guide = crud_guide.update(db=db, db_obj=guide, obj_in=guide_in)
    return guide

@router.delete("/{guide_id}", response_model=Guide)
def delete_guide(
    *,
    db: Session = Depends(deps.get_db),
    guide_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Delete a guide.
    """
    guide = crud_guide.get(db=db, id=guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if not current_user.is_superuser and (guide.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    guide = crud_guide.remove(db=db, id=guide_id)
    return guide

@router.post("/{guide_id}/steps", response_model=GuideStep)
def create_guide_step(
    *,
    db: Session = Depends(deps.get_db),
    guide_id: int,
    step_in: GuideStepCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new step for a guide.
    """
    guide = crud_guide.get(db=db, id=guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if not current_user.is_superuser and (guide.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    step = crud_guide.create_step(db=db, obj_in=step_in, guide_id=guide_id)
    return step

@router.put("/{guide_id}/steps/{step_id}", response_model=GuideStep)
def update_guide_step(
    *,
    db: Session = Depends(deps.get_db),
    guide_id: int,
    step_id: int,
    step_in: GuideStepUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update a step of a guide.
    """
    guide = crud_guide.get(db=db, id=guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if not current_user.is_superuser and (guide.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    step = crud_guide.get_step(db=db, id=step_id)
    if not step or step.guide_id != guide_id:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step = crud_guide.update_step(db=db, db_obj=step, obj_in=step_in)
    return step

@router.delete("/{guide_id}/steps/{step_id}", response_model=GuideStep)
def delete_guide_step(
    *,
    db: Session = Depends(deps.get_db),
    guide_id: int,
    step_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Delete a step of a guide.
    """
    guide = crud_guide.get(db=db, id=guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if not current_user.is_superuser and (guide.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    step = crud_guide.get_step(db=db, id=step_id)
    if not step or step.guide_id != guide_id:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step = crud_guide.remove_step(db=db, id=step_id)
    return step
