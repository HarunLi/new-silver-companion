from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # 自动处理断开的连接
        pool_size=5,         # 连接池大小
        max_overflow=10,     # 最大溢出连接数
        echo=True           # 启用 SQL 日志
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Error creating database engine: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 数据库依赖项
def get_db():
    db = SessionLocal()
    try:
        logger.debug("Creating new database session")
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        logger.debug("Closing database session")
        db.close()
