from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app import crud, models, schemas
from app.api import deps
from app.schemas.health import (
    HealthRecord,
    HealthRecordCreate,
    HealthRecordUpdate,
    HealthAlert,
    HealthAlertCreate,
    HealthAlertUpdate,
    HealthStats
)

router = APIRouter()

@router.get("/records/", response_model=List[HealthRecord])
def get_health_records(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    record_type: Optional[str] = None,
):
    """
    获取健康记录列表。
    管理员可以查看所有用户的记录，普通用户只能查看自己的记录。
    """
    if user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    target_user_id = user_id if user_id and current_user.is_admin else current_user.id
    
    if record_type:
        records = crud.health_record.get_by_type(
            db, user_id=target_user_id, record_type=record_type
        )
    else:
        records = crud.health_record.get_by_user(
            db, user_id=target_user_id, skip=skip, limit=limit
        )
    return records

@router.post("/records/", response_model=HealthRecord)
def create_health_record(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    record_in: HealthRecordCreate,
):
    """
    创建新的健康记录。
    管理员可以为任何用户创建记录，普通用户只能为自己创建记录。
    """
    if record_in.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    record = crud.health_record.create(db, obj_in=record_in)
    
    # Check if need to create alert for abnormal vital signs
    try:
        crud.health_alert.create_vital_signs_alert(
            db,
            user_id=record.user_id,
            record_type=record.record_type,
            value=record.value,
            unit=record.unit
        )
    except:
        pass  # Ignore alert creation errors
        
    return record

@router.put("/records/{record_id}", response_model=HealthRecord)
def update_health_record(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    record_id: int,
    record_in: HealthRecordUpdate,
):
    """
    更新健康记录。
    管理员可以更新任何记录，普通用户只能更新自己的记录。
    """
    record = crud.health_record.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found")
    if record.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    record = crud.health_record.update(db, db_obj=record, obj_in=record_in)
    return record

@router.delete("/records/{record_id}")
def delete_health_record(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    record_id: int,
):
    """
    删除健康记录。
    管理员可以删除任何记录，普通用户只能删除自己的记录。
    """
    record = crud.health_record.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found")
    if record.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    crud.health_record.remove(db, id=record_id)
    return {"status": "success"}

@router.get("/alerts/", response_model=List[HealthAlert])
def get_health_alerts(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
):
    """
    获取健康警报列表。
    管理员可以查看所有警报，普通用户只能查看自己的警报。
    """
    if user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    target_user_id = user_id if user_id and current_user.is_admin else current_user.id
    alerts = crud.health_alert.get_active_alerts(
        db, user_id=target_user_id, skip=skip, limit=limit
    )
    return alerts

@router.put("/alerts/{alert_id}/status", response_model=HealthAlert)
def update_alert_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    alert_id: int,
    status_in: HealthAlertUpdate,
):
    """
    更新健康警报状态。
    管理员可以更新任何警报，普通用户只能更新自己的警报。
    """
    alert = crud.health_alert.get(db, id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Health alert not found")
    if alert.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    alert = crud.health_alert.update_status(
        db, alert_id=alert_id, status=status_in.status
    )
    return alert

@router.get("/stats/", response_model=HealthStats)
def get_health_stats(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    user_id: int,
    record_type: str,
    start_date: datetime,
    end_date: datetime,
):
    """
    获取健康数据统计。
    管理员可以查看任何用户的统计，普通用户只能查看自己的统计。
    """
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    stats = crud.health_record.get_stats(
        db,
        user_id=user_id,
        record_type=record_type,
        start_date=start_date,
        end_date=end_date,
    )
    return {
        "user_id": user_id,
        "record_type": record_type,
        "start_date": start_date,
        "end_date": end_date,
        **stats
    }
