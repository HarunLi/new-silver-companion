from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.activity import activity as crud_activity
from app.models.user import User
from app.schemas.activity import (
    Activity,
    ActivityCreate,
    ActivityUpdate,
    ActivityParticipant,
    ActivityParticipantCreate
)

router = APIRouter()

@router.post("/", response_model=Activity)
def create_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_in: ActivityCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new activity.
    """
    activity = crud_activity.create_with_creator(
        db=db, obj_in=activity_in, creator_id=current_user.id
    )
    return activity

@router.get("/", response_model=List[Activity])
def read_activities(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve activities.
    """
    activities = crud_activity.get_multi(db, skip=skip, limit=limit)
    return activities

@router.get("/{activity_id}", response_model=Activity)
def read_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get activity by ID.
    """
    activity = crud_activity.get(db=db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.put("/{activity_id}", response_model=Activity)
def update_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    activity_in: ActivityUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update an activity.
    """
    activity = crud_activity.get(db=db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if not current_user.is_superuser and (activity.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    activity = crud_activity.update(db=db, db_obj=activity, obj_in=activity_in)
    return activity

@router.delete("/{activity_id}", response_model=Activity)
def delete_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Delete an activity.
    """
    activity = crud_activity.get(db=db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if not current_user.is_superuser and (activity.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    activity = crud_activity.remove(db=db, id=activity_id)
    return activity

@router.post("/{activity_id}/join", response_model=ActivityParticipant)
def join_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Join an activity.
    """
    activity = crud_activity.get(db=db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Check if user is already a participant
    if crud_activity.is_participant(db=db, activity_id=activity_id, user_id=current_user.id):
        raise HTTPException(status_code=400, detail="Already joined this activity")
    
    # Check if activity is full
    if activity.max_participants and len(activity.participants) >= activity.max_participants:
        raise HTTPException(status_code=400, detail="Activity is full")
    
    participant_in = ActivityParticipantCreate(
        activity_id=activity_id,
        user_id=current_user.id,
        status="registered"
    )
    return crud_activity.add_participant(db=db, obj_in=participant_in)

@router.post("/{activity_id}/leave", response_model=ActivityParticipant)
def leave_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Leave an activity.
    """
    activity = crud_activity.get(db=db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    participant = crud_activity.get_participant(
        db=db, activity_id=activity_id, user_id=current_user.id
    )
    if not participant:
        raise HTTPException(status_code=400, detail="Not a participant of this activity")
    
    return crud_activity.remove_participant(db=db, participant=participant)
