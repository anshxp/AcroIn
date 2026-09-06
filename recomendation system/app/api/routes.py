from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from ..core.config import settings
from ..schemas import RecommendationItem, RecommendationRequest, RecommendationResponse
from ..services.ai_intelligence import anomaly_score, placement_prediction, smart_match
from ..services.recommendation_service import build_recommendations, load_students_from_mongo

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class IntelligencePayload(BaseModel):
    profile: dict[str, Any] = Field(default_factory=dict)


class MatchPayload(BaseModel):
    student: dict[str, Any] = Field(default_factory=dict)
    faculty: dict[str, Any] = Field(default_factory=dict)


def verify_internal_api_key(x_recommendation_api_key: str | None) -> None:
    if settings.environment in {"production", "prod"} and not settings.internal_api_key:
        raise HTTPException(status_code=503, detail="Recommendation service authentication is not configured")

    if settings.internal_api_key and x_recommendation_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized request")


@router.get("/health")
def health_check() -> dict[str, Any]:
    return {"success": True, "message": "Recommendation service is running", "model_version": "acroin-intelligence-v1"}


@router.post("", response_model=RecommendationResponse)
def recommend_students(
    payload: RecommendationRequest,
    x_recommendation_api_key: str | None = Header(default=None),
) -> RecommendationResponse:
    verify_internal_api_key(x_recommendation_api_key)
    students = payload.students or load_students_from_mongo()
    if not students:
        raise HTTPException(status_code=404, detail="No students available for recommendation")
    ranked_students = [RecommendationItem(**student) for student in build_recommendations(students, payload.model_dump())]
    return RecommendationResponse(success=True, data=ranked_students, total=len(ranked_students), source="request-body" if payload.students else "mongodb")


@router.post("/match")
def match_student_faculty(payload: MatchPayload, x_recommendation_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    verify_internal_api_key(x_recommendation_api_key)
    if not payload.student or not payload.faculty:
        raise HTTPException(status_code=422, detail="student and faculty profiles are required")
    return {"success": True, "data": smart_match(payload.student, payload.faculty)}


@router.post("/predict")
def predict_placement(payload: IntelligencePayload, x_recommendation_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    verify_internal_api_key(x_recommendation_api_key)
    if not payload.profile:
        raise HTTPException(status_code=422, detail="profile is required")
    return {"success": True, "data": placement_prediction(payload.profile)}


@router.post("/anomaly")
def detect_anomaly(payload: IntelligencePayload, x_recommendation_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    verify_internal_api_key(x_recommendation_api_key)
    if not payload.profile:
        raise HTTPException(status_code=422, detail="profile is required")
    return {"success": True, "data": anomaly_score(payload.profile)}
