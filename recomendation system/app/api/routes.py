from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException

from ..core.config import settings
from ..schemas import RecommendationItem, RecommendationRequest, RecommendationResponse
from ..services.recommendation_service import build_recommendations, load_students_from_mongo

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def verify_internal_api_key(x_recommendation_api_key: str | None) -> None:
    if settings.environment in {"production", "prod"} and not settings.internal_api_key:
        raise HTTPException(status_code=503, detail="Recommendation service authentication is not configured")

    if settings.internal_api_key and x_recommendation_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized request")


@router.get("/health")
def health_check() -> dict[str, Any]:
    return {"success": True, "message": "Recommendation service is running"}


@router.post("", response_model=RecommendationResponse)
def recommend_students(
    payload: RecommendationRequest,
    x_recommendation_api_key: str | None = Header(default=None),
) -> RecommendationResponse:
    verify_internal_api_key(x_recommendation_api_key)

    students = payload.students or load_students_from_mongo()
    if not students:
        raise HTTPException(status_code=404, detail="No students available for recommendation")

    ranked_students = [
        RecommendationItem(**student)
        for student in build_recommendations(students, payload.model_dump())
    ]
    return RecommendationResponse(
        success=True,
        data=ranked_students,
        total=len(ranked_students),
        source="request-body" if payload.students else "mongodb",
    )
