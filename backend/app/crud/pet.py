from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.pet import Pet, PetInteraction
from app.schemas.pet import PetCreate, PetUpdate, PetInteractionCreate


class CRUDPet(CRUDBase[Pet, PetCreate, PetUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: PetCreate, owner_id: int
    ) -> Pet:
        obj_in_data = obj_in.model_dump()
        db_obj = Pet(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Pet]:
        return (
            db.query(self.model)
            .filter(Pet.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_pet_with_interactions(
        self, db: Session, *, pet_id: int
    ) -> Optional[Pet]:
        return (
            db.query(self.model)
            .filter(Pet.id == pet_id)
            .first()
        )

    def create_interaction(
        self, db: Session, *, obj_in: PetInteractionCreate, pet_id: int
    ) -> PetInteraction:
        pet = self.get(db, id=pet_id)
        if not pet:
            return None
        
        obj_in_data = obj_in.model_dump()
        db_obj = PetInteraction(**obj_in_data, pet_id=pet_id)
        
        # 更新宠物状态
        pet.health = min(100, max(0, pet.health + obj_in_data.get("health_effect", 0)))
        pet.happiness = min(100, max(0, pet.happiness + obj_in_data.get("happiness_effect", 0)))
        pet.experience += obj_in_data.get("experience_gain", 0)
        
        # 检查是否可以升级
        while pet.experience >= pet.level * 100:
            pet.experience -= pet.level * 100
            pet.level += 1
        
        db.add(db_obj)
        db.add(pet)
        db.commit()
        db.refresh(db_obj)
        return db_obj


pet = CRUDPet(Pet)
