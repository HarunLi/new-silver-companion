from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.auth import Token
from app.utils.sms import send_verification_code
from app.core.redis import redis_client

router = APIRouter()

@router.post("/send-code")
async def send_verification_code_api(
    *,
    phone: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    发送验证码
    """
    # 验证手机号格式
    if not phone or not phone.isdigit() or len(phone) != 11:
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number",
        )
    
    # 检查是否频繁发送
    last_send_time = await redis_client.get(f"sms:lasttime:{phone}")
    if last_send_time:
        raise HTTPException(
            status_code=400,
            detail="Please wait 60 seconds before requesting another code",
        )
    
    # 生成验证码
    code = "123456"  # TODO: 生成随机验证码
    
    # 发送验证码
    try:
        # TODO: 集成短信服务
        # await send_verification_code(phone, code)
        pass
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to send verification code",
        )
    
    # 保存验证码到 Redis，有效期 5 分钟
    await redis_client.setex(f"sms:code:{phone}", 300, code)
    # 设置发送冷却时间 60 秒
    await redis_client.setex(f"sms:lasttime:{phone}", 60, "1")
    
    return {"message": "Verification code sent"}

@router.post("/verify-code")
async def verify_code(
    *,
    phone: str,
    code: str,
) -> Any:
    """
    验证验证码
    """
    stored_code = await redis_client.get(f"sms:code:{phone}")
    if not stored_code or stored_code != code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code",
        )
    return {"message": "Code verified"}

@router.post("/login", response_model=Token)
async def login(
    *,
    phone: str,
    code: str,
    nickname: str = None,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    使用手机号和验证码登录，如果用户不存在则自动注册
    """
    # 验证验证码
    stored_code = await redis_client.get(f"sms:code:{phone}")
    if not stored_code or stored_code != code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code",
        )
    
    # 获取或创建用户
    user = crud.app_user.get_by_phone(db, phone=phone)
    if not user:
        if not nickname:
            nickname = f"用户{phone[-4:]}"  # 使用手机号后四位作为默认昵称
        user_in = schemas.AppUserCreate(
            phone=phone,
            nickname=nickname,
            is_active=True,
        )
        user = crud.app_user.create(db, obj_in=user_in)
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.commit()
    
    # 生成 token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    
    # 删除验证码
    await redis_client.delete(f"sms:code:{phone}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

@router.post("/register", response_model=Token)
async def register(
    *,
    phone: str,
    code: str,
    nickname: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    注册新用户
    """
    # 验证验证码
    stored_code = await redis_client.get(f"sms:code:{phone}")
    if not stored_code or stored_code != code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code",
        )
    
    # 检查手机号是否已注册
    if crud.app_user.get_by_phone(db, phone=phone):
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered",
        )
    
    # 创建新用户
    user_in = schemas.AppUserCreate(
        phone=phone,
        nickname=nickname,
        is_active=True,
    )
    user = crud.app_user.create(db, obj_in=user_in)
    
    # 生成 token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    
    # 删除验证码
    await redis_client.delete(f"sms:code:{phone}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

@router.post("/logout")
async def logout(
    current_user: models.AppUser = Depends(deps.get_current_user),
) -> Any:
    """
    退出登录
    """
    return {"message": "Successfully logged out"}
