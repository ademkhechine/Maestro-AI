"""Database models - Piece (Sheet Music)"""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum


class DifficultyLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    virtuoso = "virtuoso"


class Piece(Base):
    __tablename__ = "pieces"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)

    # Metadata
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    composer: Mapped[str] = mapped_column(String(255), nullable=True)
    instrument: Mapped[str] = mapped_column(String(50), nullable=True)
    difficulty: Mapped[str] = mapped_column(Enum(DifficultyLevel), nullable=True)
    tempo_bpm: Mapped[int] = mapped_column(Integer, nullable=True)
    key_signature: Mapped[str] = mapped_column(String(20), nullable=True)
    time_signature: Mapped[str] = mapped_column(String(20), nullable=True)
    total_measures: Mapped[int] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True)

    # Files
    original_file_url: Mapped[str] = mapped_column(String(500), nullable=True)
    musicxml_url: Mapped[str] = mapped_column(String(500), nullable=True)
    midi_url: Mapped[str] = mapped_column(String(500), nullable=True)
    thumbnail_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # Parsed music data (JSON)
    music_data: Mapped[dict] = mapped_column(JSON, nullable=True)  # Full parsed MusicXML
    notes_data: Mapped[dict] = mapped_column(JSON, nullable=True)  # Individual notes

    # Organization
    folder: Mapped[str] = mapped_column(String(100), nullable=True, default="My Library")
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    is_mastered: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[list] = mapped_column(JSON, default=list)

    # OMR status
    omr_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/processing/done/failed
    omr_confidence: Mapped[float] = mapped_column(Float, nullable=True)

    # Stats
    total_practice_sessions: Mapped[int] = mapped_column(Integer, default=0)
    best_score: Mapped[float] = mapped_column(Float, default=0.0)
    average_score: Mapped[float] = mapped_column(Float, default=0.0)
    last_practiced_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="pieces")
    sessions: Mapped[list["PracticeSession"]] = relationship(back_populates="piece")
