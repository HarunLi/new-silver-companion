from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.activity import Activity, ActivityParticipant
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityParticipantCreate

class CRUDActivity(CRUDBase[Activity, ActivityCreate, ActivityUpdate]):
    def create_with_creator(
        self, db: Session, *, obj_in: ActivityCreate, creator_id: int
    ) -> Activity:
        obj_in_data = obj_in.dict()
        db_obj = Activity(
            **obj_in_data,
            creator_id=creator_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_creator(
        self, db: Session, *, creator_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        return (
            db.query(self.model)
            .filter(Activity.creator_id == creator_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_available_activities(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        now = datetime.utcnow()
        return (
            db.query(self.model)
            .filter(
                and_(
                    Activity.status == "scheduled",
                    Activity.start_time > now
                )
            )
            .order_by(Activity.start_time.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def add_participant(
        self, db: Session, *, obj_in: ActivityParticipantCreate
    ) -> ActivityParticipant:
        db_obj = ActivityParticipant(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_participant(
        self, db: Session, *, participant: ActivityParticipant
    ) -> ActivityParticipant:
        participant.status = "cancelled"
        db.add(participant)
        db.commit()
        db.refresh(participant)
        return participant

    def get_participant(
        self, db: Session, *, activity_id: int, user_id: int
    ) -> Optional[ActivityParticipant]:
        return db.query(ActivityParticipant).filter(
            and_(
                ActivityParticipant.activity_id == activity_id,
                ActivityParticipant.user_id == user_id,
                ActivityParticipant.status != "cancelled"
            )
        ).first()

    def is_participant(
        self, db: Session, *, activity_id: int, user_id: int
    ) -> bool:
        return db.query(ActivityParticipant).filter(
            and_(
                ActivityParticipant.activity_id == activity_id,
                ActivityParticipant.user_id == user_id,
                ActivityParticipant.status != "cancelled"
            )
        ).first() is not None


activity = CRUDActivity(Activity)
