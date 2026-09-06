from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any

MODEL_VERSION = "acroin-intelligence-v1"


def _float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _skills(value: Any) -> set[str]:
    if isinstance(value, str):
        value = re.split(r"[,|]", value)
    if not isinstance(value, list):
        return set()
    return {str(v).strip().lower() for v in value if str(v).strip()}


def _text(value: Any) -> str:
    if isinstance(value, str):
        return value.lower()
    if isinstance(value, list):
        return " ".join(_text(v) for v in value)
    if isinstance(value, dict):
        return " ".join(_text(v) for v in value.values())
    return str(value or "").lower()


def smart_match(student: dict[str, Any], faculty: dict[str, Any]) -> dict[str, Any]:
    student_skills = _skills(student.get("skills") or student.get("tech_stack"))
    faculty_skills = _skills(faculty.get("skills") or faculty.get("expertise"))
    common = sorted(student_skills & faculty_skills)
    skill_score = (len(common) / max(len(faculty_skills), 1)) * 100

    student_projects = _text(student.get("projects"))
    faculty_projects = _text(faculty.get("research_interests") or faculty.get("projects"))
    project_tokens = set(re.findall(r"[a-z0-9+#.-]{3,}", faculty_projects))
    project_hits = sum(1 for token in project_tokens if token in student_projects)
    project_score = min(100.0, project_hits * 10.0)

    # Personality is only used when the user has explicitly supplied compatible
    # preference dimensions. It is never inferred from protected attributes.
    student_style = _text(student.get("work_style") or student.get("collaboration_style"))
    faculty_style = _text(faculty.get("work_style") or faculty.get("collaboration_style"))
    personality_score = 100.0 if student_style and faculty_style and student_style == faculty_style else 50.0

    overall = round(skill_score * 0.55 + project_score * 0.30 + personality_score * 0.15, 2)
    return {
        "model_version": MODEL_VERSION,
        "match_score": overall,
        "skill_compatibility": round(skill_score, 2),
        "project_alignment": round(project_score, 2),
        "personality_compatibility": round(personality_score, 2),
        "matched_skills": common,
    }


def placement_prediction(profile: dict[str, Any]) -> dict[str, Any]:
    skills = _skills(profile.get("skills") or profile.get("tech_stack"))
    projects = len(profile.get("projects") or []) if isinstance(profile.get("projects"), list) else 0
    internships = len(profile.get("internships") or []) if isinstance(profile.get("internships"), list) else 0
    cgpa = _float(profile.get("cgpa"))
    completeness = max(0.0, min(100.0, _float(profile.get("profileCompleteness"))))

    skill_signal = min(1.0, len(skills) / 10.0)
    academic_signal = max(0.0, min(1.0, cgpa / 10.0))
    evidence_signal = min(1.0, (projects + internships * 2) / 8.0)
    profile_signal = completeness / 100.0

    logit = -2.4 + 1.6 * skill_signal + 1.0 * academic_signal + 1.25 * evidence_signal + 0.6 * profile_signal
    probability = 1.0 / (1.0 + math.exp(-logit))
    probability_pct = round(probability * 100, 2)

    skill_gaps = []
    if len(skills) < 5:
        skill_gaps.append("Expand validated technical skills")
    if projects < 2:
        skill_gaps.append("Build more demonstrable projects")
    if internships == 0:
        skill_gaps.append("Add internship or industry experience")
    if cgpa and cgpa < 7.0:
        skill_gaps.append("Strengthen academic performance")

    pathways = ["Software Engineering"]
    if "python" in skills or "machine learning" in skills or "artificial intelligence" in skills:
        pathways.append("AI/ML Engineering")
    if "react" in skills or "javascript" in skills:
        pathways.append("Full-Stack Development")
    if "sql" in skills or "mongodb" in skills:
        pathways.append("Data Engineering")

    return {
        "model_version": MODEL_VERSION,
        "success_probability": probability_pct,
        "confidence": "baseline" if not profile.get("prediction_model_version") else "model-backed",
        "skill_gap_analysis": skill_gaps,
        "career_pathways": list(dict.fromkeys(pathways)),
        "disclaimer": "This is a decision-support estimate, not a guarantee of placement outcome.",
    }


def anomaly_score(profile: dict[str, Any]) -> dict[str, Any]:
    signals: list[tuple[str, float]] = []
    email = str(profile.get("email") or "").lower()
    name = str(profile.get("name") or "").strip()
    completeness = _float(profile.get("profileCompleteness"))

    if email and re.search(r"(temp|test|fake|spam|mailinator|guerrillamail)", email):
        signals.append(("disposable_or_suspicious_email", 0.35))
    if not name or len(name) < 3:
        signals.append(("incomplete_identity", 0.25))
    if completeness < 30:
        signals.append(("low_profile_completeness", 0.15))

    activity = profile.get("activity") or {}
    if isinstance(activity, dict):
        requests = _float(activity.get("requests_last_hour"))
        failed_logins = _float(activity.get("failed_logins_last_hour"))
        if requests > 300:
            signals.append(("abnormal_request_volume", 0.45))
        if failed_logins > 10:
            signals.append(("repeated_failed_logins", 0.35))

    score = min(1.0, sum(weight for _, weight in signals))
    if score >= 0.7:
        risk = "high"
    elif score >= 0.35:
        risk = "medium"
    else:
        risk = "low"

    return {
        "model_version": MODEL_VERSION,
        "anomaly_score": round(score, 3),
        "risk_level": risk,
        "signals": [{"type": kind, "weight": weight} for kind, weight in signals],
        "action": "manual_review" if risk == "high" else "allow_with_monitoring" if risk == "medium" else "allow",
    }
