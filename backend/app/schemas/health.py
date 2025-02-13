from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class HealthRecordBase(BaseModel):
    user_id: int
    record_type: str
    value: str
    unit: str
    measured_at: datetime
    notes: Optional[str] = None

class HealthRecordCreate(HealthRecordBase):
    pass

class HealthRecordUpdate(BaseModel):
    record_type: Optional[str] = None
    value: Optional[str] = None
    unit: Optional[str] = None
    measured_at: Optional[datetime] = None
    notes: Optional[str] = None

class HealthRecord(HealthRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class HealthAlertBase(BaseModel):
    user_id: int
    alert_type: str
    severity: str
    message: str

class HealthAlertCreate(HealthAlertBase):
    pass

class HealthAlertUpdate(BaseModel):
    status: str
    resolved_at: Optional[datetime] = None

class HealthAlert(HealthAlertBase):
    id: int
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class HealthStats(BaseModel):
    user_id: int
    record_type: str
    start_date: datetime
    end_date: datetime
    data: list
    summary: dict
