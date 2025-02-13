from fastapi import APIRouter

from app.api.v1.endpoints import login, users, pets, activities, guides, app_users

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(app_users.router, prefix="/app-users", tags=["app-users"])
api_router.include_router(pets.router, prefix="/pets", tags=["pets"])
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(guides.router, prefix="/guides", tags=["guides"])
