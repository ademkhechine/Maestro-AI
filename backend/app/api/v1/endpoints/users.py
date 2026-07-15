from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, date
from typing import Optional

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user, _user_dict
from app.models.user import User, InstrumentType, ExperienceLevel
from app.models.session import PracticeSession
from app.models.achievement import DailyStatistic, UserAchievement, Achievement, Notification

router = APIRouter()


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    instrument: Optional[str] = None
    experience_level: Optional[str] = None
    daily_goal_minutes: Optional[int] = None
    bio: Optional[str] = None


@router.patch("/me")
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile settings"""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.instrument is not None:
        # Validate instrument name against enum values
        try:
            current_user.instrument = InstrumentType(data.instrument.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid instrument. Allowed: {[e.value for e in InstrumentType]}")
    if data.experience_level is not None:
        try:
            current_user.experience_level = ExperienceLevel(data.experience_level.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid experience level. Allowed: {[e.value for e in ExperienceLevel]}")
    if data.daily_goal_minutes is not None:
        current_user.daily_goal_minutes = data.daily_goal_minutes
    if data.bio is not None:
        current_user.bio = data.bio

    await db.flush()
    await db.refresh(current_user)
    return _user_dict(current_user)


@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user dashboard summary data"""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    # Today's practice
    today_result = await db.execute(
        select(func.sum(PracticeSession.duration_seconds))
        .where(
            PracticeSession.user_id == current_user.id,
            func.date(PracticeSession.started_at) == today
        )
    )
    today_seconds = today_result.scalar() or 0

    # This week sessions
    week_result = await db.execute(
        select(func.count(PracticeSession.id), func.avg(PracticeSession.overall_score))
        .where(
            PracticeSession.user_id == current_user.id,
            func.date(PracticeSession.started_at) >= week_start
        )
    )
    week_row = week_result.one()
    week_sessions = week_row[0] or 0
    week_avg_score = round(week_row[1] or 0, 1)

    # Weekly stats for chart (last 7 days)
    weekly_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_result = await db.execute(
            select(func.sum(PracticeSession.duration_seconds), func.avg(PracticeSession.overall_score))
            .where(
                PracticeSession.user_id == current_user.id,
                func.date(PracticeSession.started_at) == day
            )
        )
        row = day_result.one()
        weekly_chart.append({
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "minutes": int((row[0] or 0) / 60),
            "score": round(row[1] or 0, 1)
        })

    return {
        "today_minutes": today_seconds // 60,
        "today_goal_minutes": current_user.daily_goal_minutes,
        "today_progress_pct": min(100, int((today_seconds / 60) / max(1, current_user.daily_goal_minutes) * 100)),
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "total_xp": current_user.total_xp,
        "current_level": current_user.current_level,
        "pieces_mastered": current_user.pieces_mastered,
        "average_accuracy": current_user.average_accuracy,
        "week_sessions": week_sessions,
        "week_avg_score": week_avg_score,
        "total_practice_minutes": current_user.total_practice_minutes,
        "weekly_chart": weekly_chart,
    }
