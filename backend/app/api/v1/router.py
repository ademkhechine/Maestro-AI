"""API v1 main router"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, pieces, sessions, statistics, achievements, notifications, ai_coach

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(pieces.router, prefix="/pieces", tags=["Sheet Music"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Practice Sessions"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(ai_coach.router, prefix="/coach", tags=["AI Coach"])
