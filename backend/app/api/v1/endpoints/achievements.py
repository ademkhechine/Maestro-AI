"""Achievements endpoint - real user achievement tracking"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement

router = APIRouter()

# Static achievement definitions (catalog)
ACHIEVEMENTS_CATALOG = [
    {"id": "first_session", "name": "First Steps", "description": "Complete your first practice session", "icon": "🎵", "xp_reward": 50, "category": "Practice"},
    {"id": "streak_3", "name": "Getting Started", "description": "Practice 3 days in a row", "icon": "🌟", "xp_reward": 75, "category": "Streak"},
    {"id": "streak_7", "name": "Week Warrior", "description": "Practice 7 days in a row", "icon": "🔥", "xp_reward": 200, "category": "Streak"},
    {"id": "streak_30", "name": "Monthly Master", "description": "Practice 30 days in a row", "icon": "💎", "xp_reward": 1000, "category": "Streak"},
    {"id": "accuracy_90", "name": "Precision Player", "description": "Achieve 90%+ accuracy in a session", "icon": "🎯", "xp_reward": 300, "category": "Accuracy"},
    {"id": "hour_10", "name": "Dedicated Student", "description": "Practice 10 total hours", "icon": "⏰", "xp_reward": 150, "category": "Practice"},
    {"id": "pieces_5", "name": "Repertoire Builder", "description": "Master 5 pieces", "icon": "📚", "xp_reward": 500, "category": "Practice"},
    {"id": "perfect_session", "name": "Flawless", "description": "Score 100% in a session", "icon": "⭐", "xp_reward": 1000, "category": "Accuracy"},
    {"id": "night_owl", "name": "Night Owl", "description": "Practice after midnight", "icon": "🦉", "xp_reward": 25, "category": "Fun"},
    {"id": "upload_5", "name": "Sheet Collector", "description": "Upload 5 pieces of sheet music", "icon": "📄", "xp_reward": 100, "category": "Library"},
    {"id": "speed_demon", "name": "Speed Demon", "description": "Practice at 140+ BPM", "icon": "⚡", "xp_reward": 200, "category": "Fun"},
    {"id": "early_bird", "name": "Early Bird", "description": "Practice before 7am", "icon": "🌅", "xp_reward": 50, "category": "Fun"},
    {"id": "maqam_explorer", "name": "Maqam Explorer", "description": "Explore 5 different Maqamat in the Maqam World", "icon": "🎼", "xp_reward": 250, "category": "Arabic Music"},
    {"id": "arabic_instrument", "name": "Eastern Strings", "description": "Complete 10 sessions with Oud, Qanun, or Nay", "icon": "🪕", "xp_reward": 400, "category": "Arabic Music"},
]


def _check_earned(catalog_id: str, user: User) -> bool:
    """Determine if user has earned an achievement based on their stats"""
    if catalog_id == "first_session":
        return user.total_practice_minutes > 0
    if catalog_id == "streak_3":
        return user.current_streak >= 3 or user.longest_streak >= 3
    if catalog_id == "streak_7":
        return user.current_streak >= 7 or user.longest_streak >= 7
    if catalog_id == "streak_30":
        return user.current_streak >= 30 or user.longest_streak >= 30
    if catalog_id == "accuracy_90":
        return user.average_accuracy >= 90
    if catalog_id == "hour_10":
        return user.total_practice_minutes >= 600
    if catalog_id == "pieces_5":
        return user.pieces_mastered >= 5
    if catalog_id == "perfect_session":
        return user.average_accuracy >= 100
    if catalog_id == "night_owl":
        # Would need session data; approximate as False for now
        return False
    if catalog_id == "upload_5":
        return False  # Would check pieces count
    if catalog_id == "speed_demon":
        return False  # Would check session BPM data
    if catalog_id == "early_bird":
        return False  # Would check session time
    if catalog_id == "maqam_explorer":
        return False  # Would check maqam_views field
    if catalog_id == "arabic_instrument":
        return user.instrument in ("oud", "qanun", "nay") and user.total_practice_minutes >= 200
    return False


@router.get("/")
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Return achievements catalog with earned status computed from user stats"""
    achievements_with_status = []
    for ach in ACHIEVEMENTS_CATALOG:
        earned = _check_earned(ach["id"], current_user)
        achievements_with_status.append({
            **ach,
            "earned": earned,
        })

    earned_list = [a for a in achievements_with_status if a["earned"]]
    total_bonus_xp = sum(a["xp_reward"] for a in earned_list)

    return {
        "achievements": achievements_with_status,
        "earned_count": len(earned_list),
        "total_count": len(ACHIEVEMENTS_CATALOG),
        "bonus_xp": total_bonus_xp,
    }
