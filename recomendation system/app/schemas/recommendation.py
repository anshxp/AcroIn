from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    requirements: str = ""
    department: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    min_cgpa: float | None = None
    top_n: int = Field(default=8, ge=1, le=50)
    students: list[dict[str, Any]] = Field(default_factory=list)


class RecommendationItem(BaseModel):
    student_id: str | None = None
    name: str
    department: str | None = None
    year: str | None = None
    cgpa: float | None = None
    profile_image: str | None = None
    verification_status: str | None = None
    face_verification_status: str | None = None
    profile_completeness: int | None = None
    match_score: float
    match_percent: int
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    reasons: list[str] = Field(default_factory=list)
    summary: str


class RecommendationResponse(BaseModel):
    success: bool = True
    data: list[RecommendationItem]
    total: int
    source: str
