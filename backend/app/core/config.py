from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # 基本设置
    APP_NAME: str = "Silver Companion"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # 数据库设置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://lihaowen:@localhost:5432/silver_companion")

    # 安全设置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 管理员设置
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin123"

    # Redis 设置
    REDIS_URL: str = "redis://localhost:6379/0"

    # 文件存储设置
    UPLOAD_DIR: str = "/tmp/silver_companion/uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB in bytes

    # 宠物设置
    MAX_PETS_PER_USER: int = 3
    PET_LEVEL_UP_THRESHOLD: int = 80

    # 活动设置
    MAX_ACTIVITIES_PER_USER: int = 10
    ACTIVITY_REGISTRATION_DEADLINE_HOURS: int = 24

    # 指南设置
    MAX_DIFFICULTY_LEVEL: int = 5
    MAX_STEPS_PER_GUIDE: int = 20

    class Config:
        env_file = ".env"

settings = Settings()
