"""Pieces (Sheet Music) endpoints"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.piece import Piece

router = APIRouter()


class PieceOut(BaseModel):
    id: str
    title: str
    composer: Optional[str]
    instrument: Optional[str]
    difficulty: Optional[str]
    tempo_bpm: Optional[int]
    key_signature: Optional[str]
    time_signature: Optional[str]
    total_measures: Optional[int]
    thumbnail_url: Optional[str]
    musicxml_url: Optional[str]
    midi_url: Optional[str]
    is_favorite: bool
    is_mastered: bool
    folder: Optional[str]
    omr_status: str
    best_score: float
    average_score: float
    total_practice_sessions: int
    last_practiced_at: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PieceOut])
async def list_pieces(
    folder: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    sort_by: str = Query("created_at"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all pieces for the current user"""
    query = select(Piece).where(Piece.user_id == current_user.id)

    if folder:
        query = query.where(Piece.folder == folder)
    if search:
        query = query.where(Piece.title.ilike(f"%{search}%"))
    if is_favorite is not None:
        query = query.where(Piece.is_favorite == is_favorite)

    if sort_by == "title":
        query = query.order_by(Piece.title)
    elif sort_by == "last_practiced":
        query = query.order_by(Piece.last_practiced_at.desc().nullslast())
    elif sort_by == "score":
        query = query.order_by(Piece.best_score.desc())
    else:
        query = query.order_by(Piece.created_at.desc())

    result = await db.execute(query)
    pieces = result.scalars().all()
    return [_piece_to_dict(p) for p in pieces]


@router.post("/upload", status_code=201)
async def upload_piece(
    title: str = Form(...),
    composer: Optional[str] = Form(None),
    instrument: Optional[str] = Form(None),
    folder: str = Form("My Library"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a sheet music file (PDF, PNG, JPEG)"""
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # In production: upload to Firebase Storage here
    # For now, store with a placeholder URL
    file_id = str(uuid.uuid4())
    mock_url = f"/uploads/{file_id}/{file.filename}"

    piece = Piece(
        user_id=current_user.id,
        title=title,
        composer=composer,
        instrument=instrument or current_user.instrument,
        folder=folder,
        original_file_url=mock_url,
        omr_status="pending",
    )
    db.add(piece)
    await db.flush()
    await db.refresh(piece)

    # TODO: Trigger background OMR processing task

    return {"id": piece.id, "title": piece.title, "omr_status": piece.omr_status}


@router.get("/{piece_id}", response_model=PieceOut)
async def get_piece(
    piece_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    piece = await _get_piece_or_404(piece_id, current_user.id, db)
    return _piece_to_dict(piece)


@router.patch("/{piece_id}")
async def update_piece(
    piece_id: str,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    piece = await _get_piece_or_404(piece_id, current_user.id, db)
    allowed = {"title", "composer", "folder", "is_favorite", "tags"}
    for key, value in updates.items():
        if key in allowed:
            setattr(piece, key, value)
    await db.flush()
    return {"success": True}


@router.delete("/{piece_id}", status_code=204)
async def delete_piece(
    piece_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    piece = await _get_piece_or_404(piece_id, current_user.id, db)
    await db.delete(piece)


async def _get_piece_or_404(piece_id: str, user_id: str, db: AsyncSession) -> Piece:
    result = await db.execute(
        select(Piece).where(Piece.id == piece_id, Piece.user_id == user_id)
    )
    piece = result.scalar_one_or_none()
    if not piece:
        raise HTTPException(status_code=404, detail="Piece not found")
    return piece


def _piece_to_dict(p: Piece) -> dict:
    return {
        "id": p.id, "title": p.title, "composer": p.composer,
        "instrument": p.instrument, "difficulty": p.difficulty,
        "tempo_bpm": p.tempo_bpm, "key_signature": p.key_signature,
        "time_signature": p.time_signature, "total_measures": p.total_measures,
        "thumbnail_url": p.thumbnail_url, "musicxml_url": p.musicxml_url,
        "midi_url": p.midi_url, "is_favorite": p.is_favorite,
        "is_mastered": p.is_mastered, "folder": p.folder,
        "omr_status": p.omr_status, "best_score": p.best_score,
        "average_score": p.average_score,
        "total_practice_sessions": p.total_practice_sessions,
        "last_practiced_at": p.last_practiced_at.isoformat() if p.last_practiced_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }
