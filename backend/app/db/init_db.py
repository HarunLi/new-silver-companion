from sqlalchemy.orm import Session

from app.crud.user import user
from app.schemas.user import UserCreate
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

def init_db(db: Session) -> None:
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    # 检查是否已有管理员用户
    admin_user = user.get_by_email(db, email=settings.ADMIN_EMAIL)
    if not admin_user:
        user_in = UserCreate(
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD,
            full_name="Admin",
            phone="admin",
            is_active=True,
            is_superuser=True,
        )
        user.create(db, obj_in=user_in)
