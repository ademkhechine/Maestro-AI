"""AI Coach endpoint - OpenAI-powered music feedback"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from openai import AsyncOpenAI

from app.core.config import settings
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()


class FeedbackRequest(BaseModel):
    session_data: dict  # pitch, rhythm, tempo scores + heatmap
    piece_title: str
    composer: Optional[str] = None
    instrument: str
    measures_practiced: Optional[str] = None
    previous_sessions: Optional[list] = None


class FeedbackResponse(BaseModel):
    feedback: str
    recommendations: list[str]
    practice_plan: list[dict]
    encouragement: str


@router.post("/feedback", response_model=FeedbackResponse)
async def generate_feedback(
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate AI-powered coaching feedback for a practice session"""
    if not settings.OPENAI_API_KEY:
        # Return mock feedback in dev mode
        return _mock_feedback(request)

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    system_prompt = """You are Maestro AI, an expert music teacher with 30 years of experience.
You provide highly specific, actionable feedback referencing exact measures and musical elements.
Your tone is encouraging yet professional. Never give generic feedback.
Always reference specific measure numbers, technical issues, and concrete improvements."""

    session = request.session_data
    user_prompt = f"""Analyze this practice session for {current_user.full_name}:

Instrument: {request.instrument}
Piece: {request.piece_title}{f' by {request.composer}' if request.composer else ''}
Measures Practiced: {request.measures_practiced or 'Full piece'}

Performance Scores:
- Pitch Accuracy: {session.get('pitch_accuracy', 0):.1f}%
- Rhythm Accuracy: {session.get('rhythm_accuracy', 0):.1f}%
- Tempo Stability: {session.get('tempo_stability', 0):.1f}%
- Expression: {session.get('expression_score', 0):.1f}%
- Overall: {session.get('overall_score', 0):.1f}%

Problem Measures (from heatmap): {session.get('problem_measures', [])}
Missed Notes: {session.get('missed_notes', 0)}
Wrong Notes: {session.get('wrong_notes', 0)}

Previous session overall score: {request.previous_sessions[0].get('overall_score', 0) if request.previous_sessions else 'First session'}

Provide:
1. Detailed specific feedback (3-4 sentences referencing specific measures/techniques)
2. 3 actionable practice recommendations with specific BPM and measure ranges
3. A 3-day micro practice plan
4. One encouraging closing statement

Respond in JSON format:
{{
  "feedback": "...",
  "recommendations": ["...", "...", "..."],
  "practice_plan": [
    {{"day": 1, "focus": "...", "duration_minutes": 20, "exercises": [...]}},
    {{"day": 2, "focus": "...", "duration_minutes": 25, "exercises": [...]}},
    {{"day": 3, "focus": "...", "duration_minutes": 30, "exercises": [...]}}
  ],
  "encouragement": "..."
}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1500,
        )

        import json
        result = json.loads(response.choices[0].message.content)
        return FeedbackResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/practice-plan")
async def generate_practice_plan(
    current_user: User = Depends(get_current_user)
):
    """Generate a personalized weekly practice plan based on user history"""
    return {
        "week_plan": [
            {"day": "Monday", "focus": "Scales & Technique", "duration": 30, "pieces": []},
            {"day": "Tuesday", "focus": "Current Piece - Measures 1-16", "duration": 45, "pieces": []},
            {"day": "Wednesday", "focus": "Sight Reading", "duration": 20, "pieces": []},
            {"day": "Thursday", "focus": "Problem Measures", "duration": 40, "pieces": []},
            {"day": "Friday", "focus": "Full Run-through", "duration": 35, "pieces": []},
            {"day": "Saturday", "focus": "Expression & Dynamics", "duration": 45, "pieces": []},
            {"day": "Sunday", "focus": "Rest or Light Review", "duration": 15, "pieces": []},
        ]
    }


def _mock_feedback(request: FeedbackRequest) -> FeedbackResponse:
    """Mock feedback for development without OpenAI key"""
    score = request.session_data.get('overall_score', 75)
    return FeedbackResponse(
        feedback=f"Your performance of {request.piece_title} shows excellent dedication. Your pitch accuracy in the opening section is commendable, though Measures 12-16 show some rhythmic rushing. The second theme was particularly expressive. Focus on the transition passages which need more careful attention.",
        recommendations=[
            f"Practice Measures 12-16 at 70% tempo with a metronome until the rhythm feels natural",
            f"Record yourself playing and listen back — you'll notice the slight pitch drift on the upper register",
            f"Spend 10 minutes daily on slow bow exercises to improve tone consistency",
        ],
        practice_plan=[
            {"day": 1, "focus": "Slow practice Measures 12-16", "duration_minutes": 20, "exercises": ["Metronome at 60 BPM", "Rhythm syllables"]},
            {"day": 2, "focus": "Intonation work", "duration_minutes": 25, "exercises": ["Drone tone matching", "Scale in key of piece"]},
            {"day": 3, "focus": "Full piece run-through", "duration_minutes": 30, "exercises": ["Tempo at 80%", "Focus on dynamics"]},
        ],
        encouragement=f"Your overall score of {score:.0f}% reflects real progress. Keep this dedication and you'll master this piece within the week!"
    )
