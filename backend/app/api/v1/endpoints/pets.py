from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.pet import pet as crud_pet
from app.models.user import User
from app.schemas.pet import Pet, PetCreate, PetUpdate, PetInteraction, PetInteractionCreate

router = APIRouter()

@router.post("/", response_model=Pet)
def create_pet(
    *,
    db: Session = Depends(deps.get_db),
    pet_in: PetCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new pet.
    """
    # 检查用户的宠物数量是否达到上限
    user_pets = crud_pet.get_multi_by_owner(db=db, owner_id=current_user.id)
    if len(user_pets) >= 3:  # 假设每个用户最多3个宠物
        raise HTTPException(
            status_code=400,
            detail="You have reached the maximum number of pets allowed."
        )
    pet = crud_pet.create_with_owner(db=db, obj_in=pet_in, owner_id=current_user.id)
    return pet

@router.get("/", response_model=List[Pet])
def read_pets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve pets.
    """
    if current_user.is_superuser:
        pets = crud_pet.get_multi(db, skip=skip, limit=limit)
    else:
        pets = crud_pet.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return pets

@router.get("/{pet_id}", response_model=Pet)
def read_pet(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get pet by ID.
    """
    pet = crud_pet.get(db=db, id=pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not current_user.is_superuser and (pet.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return pet

@router.put("/{pet_id}", response_model=Pet)
def update_pet(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: int,
    pet_in: PetUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update a pet.
    """
    pet = crud_pet.get(db=db, id=pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not current_user.is_superuser and (pet.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    pet = crud_pet.update(db=db, db_obj=pet, obj_in=pet_in)
    return pet

@router.delete("/{pet_id}", response_model=Pet)
def delete_pet(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Delete a pet.
    """
    pet = crud_pet.get(db=db, id=pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not current_user.is_superuser and (pet.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    pet = crud_pet.remove(db=db, id=pet_id)
    return pet

@router.post("/{pet_id}/interact", response_model=PetInteraction)
def interact_with_pet(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: int,
    interaction_in: PetInteractionCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Interact with a pet.
    """
    pet = crud_pet.get(db=db, id=pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not current_user.is_superuser and (pet.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    interaction = crud_pet.create_interaction(
        db=db,
        obj_in=interaction_in,
        pet_id=pet_id
    )
    if not interaction:
        raise HTTPException(status_code=400, detail="Failed to create interaction")
    return interaction
