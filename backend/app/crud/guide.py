from typing import List, Optional, Dict, Union, Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.guide import Guide, GuideStep
from app.schemas.guide import GuideCreate, GuideUpdate, GuideStepCreate, GuideStepUpdate


class CRUDGuide(CRUDBase[Guide, GuideCreate, GuideUpdate]):
    def create_with_creator(
        self, db: Session, *, obj_in: GuideCreate, creator_id: int
    ) -> Guide:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data, creator_id=creator_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_published(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Guide]:
        return (
            db.query(self.model)
            .filter(self.model.is_published == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_creator(
        self, db: Session, *, creator_id: int, skip: int = 0, limit: int = 100
    ) -> List[Guide]:
        return (
            db.query(self.model)
            .filter(self.model.creator_id == creator_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_step(
        self, db: Session, *, id: int
    ) -> Optional[GuideStep]:
        return db.query(GuideStep).filter(GuideStep.id == id).first()

    def create_step(
        self, db: Session, *, obj_in: GuideStepCreate, guide_id: int
    ) -> GuideStep:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = GuideStep(**obj_in_data, guide_id=guide_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_step(
        self, db: Session, *, db_obj: GuideStep, obj_in: Union[GuideStepUpdate, Dict[str, Any]]
    ) -> GuideStep:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_step(
        self, db: Session, *, id: int
    ) -> GuideStep:
        obj = db.query(GuideStep).get(id)
        db.delete(obj)
        db.commit()
        return obj


guide = CRUDGuide(Guide)
