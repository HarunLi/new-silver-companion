from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime

@as_declarative()
class Base:
    id: Any
    __name__: str
    
    # 通用字段
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 自动生成表名
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
