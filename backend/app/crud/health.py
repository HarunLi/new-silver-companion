from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.crud.base import CRUDBase
from app.models.health import HealthRecord, HealthAlert
from app.schemas.health import HealthRecordCreate, HealthRecordUpdate, HealthAlertCreate, HealthAlertUpdate

class CRUDHealthRecord(CRUDBase[HealthRecord, HealthRecordCreate, HealthRecordUpdate]):
    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[HealthRecord]:
        return (
            db.query(self.model)
            .filter(HealthRecord.user_id == user_id)
            .order_by(HealthRecord.measured_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_type(
        self,
        db: Session,
        *,
        user_id: int,
        record_type: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[HealthRecord]:
        query = db.query(self.model).filter(
            and_(
                HealthRecord.user_id == user_id,
                HealthRecord.record_type == record_type
            )
        )
        
        if start_date:
            query = query.filter(HealthRecord.measured_at >= start_date)
        if end_date:
            query = query.filter(HealthRecord.measured_at <= end_date)
            
        return query.order_by(HealthRecord.measured_at.asc()).all()

    def get_stats(
        self,
        db: Session,
        *,
        user_id: int,
        record_type: str,
        start_date: datetime,
        end_date: datetime,
    ) -> dict:
        records = self.get_by_type(
            db,
            user_id=user_id,
            record_type=record_type,
            start_date=start_date,
            end_date=end_date,
        )
        
        if not records:
            return {
                "data": [],
                "summary": {
                    "count": 0,
                    "min": None,
                    "max": None,
                    "avg": None,
                }
            }

        # Convert string values to float for numeric calculations
        # Skip for non-numeric types like medication
        if record_type != "medication":
            values = [float(r.value) for r in records]
            summary = {
                "count": len(values),
                "min": min(values),
                "max": max(values),
                "avg": sum(values) / len(values),
            }
        else:
            summary = {
                "count": len(records),
            }

        return {
            "data": [{
                "id": r.id,
                "value": r.value,
                "unit": r.unit,
                "measured_at": r.measured_at,
            } for r in records],
            "summary": summary
        }

class CRUDHealthAlert(CRUDBase[HealthAlert, HealthAlertCreate, HealthAlertUpdate]):
    def get_active_alerts(
        self, db: Session, *, user_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[HealthAlert]:
        query = db.query(self.model).filter(HealthAlert.status == "active")
        
        if user_id:
            query = query.filter(HealthAlert.user_id == user_id)
            
        return (
            query
            .order_by(HealthAlert.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_status(
        self, db: Session, *, alert_id: int, status: str
    ) -> HealthAlert:
        alert = db.query(self.model).filter(HealthAlert.id == alert_id).first()
        if not alert:
            return None
            
        alert.status = status
        if status in ["resolved", "dismissed"]:
            alert.resolved_at = datetime.utcnow()
            
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    def create_vital_signs_alert(
        self,
        db: Session,
        *,
        user_id: int,
        record_type: str,
        value: float,
        unit: str,
    ) -> Optional[HealthAlert]:
        # Define threshold values for different vital signs
        thresholds = {
            "blood_pressure": {
                "high": {"systolic": 140, "diastolic": 90},
                "low": {"systolic": 90, "diastolic": 60}
            },
            "heart_rate": {"high": 100, "low": 60},
            "blood_sugar": {"high": 7.0, "low": 4.0},
            "temperature": {"high": 37.5, "low": 36.0}
        }
        
        if record_type not in thresholds:
            return None
            
        message = None
        severity = None
        
        if record_type == "blood_pressure":
            # Expecting value format: "120/80"
            try:
                systolic, diastolic = map(float, value.split("/"))
                if (systolic >= thresholds[record_type]["high"]["systolic"] or 
                    diastolic >= thresholds[record_type]["high"]["diastolic"]):
                    message = f"血压偏高: {value} {unit}"
                    severity = "high"
                elif (systolic <= thresholds[record_type]["low"]["systolic"] or 
                    diastolic <= thresholds[record_type]["low"]["diastolic"]):
                    message = f"血压偏低: {value} {unit}"
                    severity = "medium"
            except:
                return None
        else:
            value_float = float(value)
            if value_float >= thresholds[record_type]["high"]:
                message = f"{record_type}偏高: {value} {unit}"
                severity = "high"
            elif value_float <= thresholds[record_type]["low"]:
                message = f"{record_type}偏低: {value} {unit}"
                severity = "medium"
                
        if message and severity:
            alert_in = HealthAlertCreate(
                user_id=user_id,
                alert_type="abnormal_vital_signs",
                severity=severity,
                message=message
            )
            return super().create(db, obj_in=alert_in)
            
        return None

health_record = CRUDHealthRecord(HealthRecord)
health_alert = CRUDHealthAlert(HealthAlert)
