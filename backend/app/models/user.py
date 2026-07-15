"""Database models - User"""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum


class InstrumentType(str, enum.Enum):
    violin = "violin"
    piano = "piano"
    guitar = "guitar"
    voice = "voice"
    oud = "oud"
    qanun = "qanun"
    nay = "nay"
    flute = "flute"


class ExperienceLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    professional = "professional"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    firebase_uid: Mapped[str] = mapped_column(String(255), nullable=True, unique=True)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)

    instrument: Mapped[str] = mapped_column(
        Enum(InstrumentType), default=InstrumentType.piano, nullable=False
    )
    experience_level: Mapped[str] = mapped_column(
        Enum(ExperienceLevel), default=ExperienceLevel.beginner, nullable=False
    )
    daily_goal_minutes: Mapped[int] = mapped_column(Integer, default=30)

    # Stats
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    current_level: Mapped[int] = mapped_column(Integer, default=1)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    total_practice_minutes: Mapped[int] = mapped_column(Integer, default=0)
    pieces_mastered: Mapped[int] = mapped_column(Integer, default=0)
    average_accuracy: Mapped[float] = mapped_column(Float, default=0.0)

    # Auth
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_teacher: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_practice_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationships
    sessions: Mapped[list["PracticeSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    pieces: Mapped[list["Piece"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    statistics: Mapped[list["DailyStatistic"]] = relationship(back_populates="user", cascade="all, delete-orphan")
