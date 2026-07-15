"""Practice Sessions endpoints with audio analysis"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from pydantic import BaseModel
import numpy as np
from datetime import datetime, date, timedelta
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.models.piece import Piece

router = APIRouter()


class SessionCreate(BaseModel):
    piece_id: Optional[str] = None
    bpm_practiced: Optional[int] = None
    measures_practiced: Optional[str] = None


class SessionAnalysis(BaseModel):
    pitch_accuracy: float
    rhythm_accuracy: float
    tempo_stability: float
    expression_score: float
    overall_score: float
    heatmap_data: Optional[dict] = None
    missed_notes: int = 0
    wrong_notes: int = 0
    problem_measures: List[int] = []


@router.post("/start", status_code=201)
async def start_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new practice session"""
    session = PracticeSession(
        user_id=current_user.id,
        piece_id=data.piece_id,
        bpm_practiced=data.bpm_practiced,
        measures_practiced=data.measures_practiced,
        started_at=datetime.utcnow(),
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return {"session_id": session.id, "started_at": session.started_at.isoformat()}


@router.post("/{session_id}/analyze")
async def analyze_audio(
    session_id: str,
    audio_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze uploaded audio recording.
    In production, this runs librosa + CREPE pitch detection.
    Returns mock analysis for now.
    """
    result = await db.execute(
        select(PracticeSession).where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # TODO: Real audio analysis with librosa/CREPE
    # audio_data = await audio_file.read()
    # analysis = await analyze_with_librosa(audio_data)

    # Mock realistic analysis
    analysis = {
        "pitch_accuracy": round(np.random.uniform(72, 96), 1),
        "rhythm_accuracy": round(np.random.uniform(68, 94), 1),
        "tempo_stability": round(np.random.uniform(75, 98), 1),
        "expression_score": round(np.random.uniform(60, 90), 1),
        "missed_notes": np.random.randint(0, 8),
        "wrong_notes": np.random.randint(0, 5),
        "problem_measures": sorted(np.random.choice(range(1, 25), size=3, replace=False).tolist()),
        "heatmap_data": {
            str(i): np.random.choice(["green", "yellow", "red"], p=[0.6, 0.25, 0.15])
            for i in range(1, 25)
        }
    }
    analysis["overall_score"] = round(
        (analysis["pitch_accuracy"] * 0.35 + analysis["rhythm_accuracy"] * 0.35 +
         analysis["tempo_stability"] * 0.20 + analysis["expression_score"] * 0.10), 1
    )

    return analysis


@router.post("/{session_id}/end")
async def end_session(
    session_id: str,
    analysis: SessionAnalysis,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End a practice session and save results"""
    result = await db.execute(
        select(PracticeSession).where(
            PracticeSession.id == session_id,
            PracticeSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.utcnow()
    duration = int((now - session.started_at).total_seconds())

    session.ended_at = now
    session.duration_seconds = duration
    session.pitch_accuracy = analysis.pitch_accuracy
    session.rhythm_accuracy = analysis.rhythm_accuracy
    session.tempo_stability = analysis.tempo_stability
    session.expression_score = analysis.expression_score
    session.overall_score = analysis.overall_score
    session.heatmap_data = analysis.heatmap_data

    # Award XP (score-based + time bonus)
    xp = int(analysis.overall_score * 0.5 + (duration // 60) * 2)
    session.xp_earned = xp
    current_user.total_xp += xp
    current_user.total_practice_minutes += max(1, duration // 60)
    current_user.last_practice_at = now

    # Recalculate average accuracy from all sessions
    avg_result = await db.execute(
        select(func.avg(PracticeSession.overall_score))
        .where(PracticeSession.user_id == current_user.id)
    )
    new_avg = avg_result.scalar() or analysis.overall_score
    current_user.average_accuracy = round(float(new_avg), 2)

    # Update level based on total XP (1000 XP per level)
    current_user.current_level = max(1, current_user.total_xp // 1000 + 1)

    # Update streak: check if practiced yesterday
    today = date.today()
    yesterday = today - timedelta(days=1)
    if current_user.last_practice_at:
        last_date = current_user.last_practice_at.date() if hasattr(current_user.last_practice_at, 'date') else today
        if last_date == yesterday or last_date == today:
            if last_date == today and session.duration_seconds < 30:
                pass  # Don't increment for same-day very short sessions
            else:
                current_user.current_streak += 1
                current_user.longest_streak = max(
                    current_user.longest_streak, current_user.current_streak
                )
        elif last_date < yesterday:
            current_user.current_streak = 1

    # Update piece stats if piece is linked
    if session.piece_id:
        piece_result = await db.execute(
            select(Piece).where(Piece.id == session.piece_id, Piece.user_id == current_user.id)
        )
        piece = piece_result.scalar_one_or_none()
        if piece:
            piece.total_practice_sessions += 1
            piece.last_practiced_at = now
            if analysis.overall_score > piece.best_score:
                piece.best_score = analysis.overall_score
            # Recalculate average_score
            total = piece.average_score * (piece.total_practice_sessions - 1) + analysis.overall_score
            piece.average_score = round(total / piece.total_practice_sessions, 2)
            # Mark as mastered if best_score >= 90
            if piece.best_score >= 90 and not piece.is_mastered:
                piece.is_mastered = True
                current_user.pieces_mastered += 1

    await db.flush()
    return {"success": True, "xp_earned": xp, "duration_seconds": duration, "new_level": current_user.current_level}


@router.get("/history")
async def get_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PracticeSession)
        .options(joinedload(PracticeSession.piece))
        .where(PracticeSession.user_id == current_user.id)
        .order_by(PracticeSession.started_at.desc())
        .limit(limit)
    )
    sessions = result.scalars().all()
    return [
        {
            "id": s.id,
            "piece_id": s.piece_id,
            "piece_title": s.piece.title if s.piece else "Sights & Improvisation",
            "piece_composer": s.piece.composer if s.piece else "Traditional",
            "piece_instrument": s.piece.instrument if s.piece else current_user.instrument,
            "duration_seconds": s.duration_seconds,
            "overall_score": s.overall_score,
            "pitch_accuracy": s.pitch_accuracy,
            "rhythm_accuracy": s.rhythm_accuracy,
            "tempo_stability": s.tempo_stability,
            "xp_earned": s.xp_earned,
            "started_at": s.started_at.isoformat() if s.started_at else None,
        }
        for s in sessions
    ]
