from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.app_user import AppUser
from app.schemas.app_user import AppUserCreate, AppUserUpdate

class CRUDAppUser(CRUDBase[AppUser, AppUserCreate, AppUserUpdate]):
    def get_by_phone(self, db: Session, *, phone: str) -> Optional[AppUser]:
        return db.query(AppUser).filter(AppUser.phone == phone).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        phone: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[AppUser]:
        query = db.query(self.model)
        
        if phone:
            query = query.filter(self.model.phone.contains(phone))
        if is_active is not None:
            query = query.filter(self.model.is_active == is_active)
            
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: AppUserCreate) -> AppUser:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: AppUser,
        obj_in: Union[AppUserUpdate, Dict[str, Any]]
    ) -> AppUser:
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

app_user = CRUDAppUser(AppUser)
