"""Database models - Practice Session"""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    piece_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("pieces.id"), nullable=True)

    # Session info
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    bpm_practiced: Mapped[int] = mapped_column(Integer, nullable=True)
    measures_practiced: Mapped[str] = mapped_column(String(50), nullable=True)  # e.g. "1-24"

    # Scores
    pitch_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    rhythm_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    tempo_stability: Mapped[float] = mapped_column(Float, default=0.0)
    expression_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Analysis data (JSON)
    heatmap_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    note_analysis: Mapped[dict] = mapped_column(JSON, nullable=True)
    timing_deviations: Mapped[dict] = mapped_column(JSON, nullable=True)

    # AI feedback
    ai_feedback: Mapped[str] = mapped_column(Text, nullable=True)
    ai_recommendations: Mapped[dict] = mapped_column(JSON, nullable=True)

    # Recording
    recording_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # XP earned
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ended_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="sessions")
    piece: Mapped["Piece"] = relationship(back_populates="sessions")
