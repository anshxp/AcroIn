from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any, Iterable

from ..core.config import settings

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "for",
    "from",
    "has",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "requirements",
    "required",
    "student",
    "students",
    "the",
    "to",
    "with",
    "looking",
    "need",
    "needs",
    "project",
    "projects",
    "role",
    "roles",
    "job",
    "candidate",
    "candidates",
}

SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "node": "nodejs",
    "node.js": "nodejs",
    "machinelearning": "machine learning",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "mongodb": "mongo",
}


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def normalize_skill(value: Any) -> str:
    skill = normalize_text(value)
    skill = re.sub(r"[^a-z0-9+#.\- ]", "", skill)
    return SKILL_ALIASES.get(skill, skill)


def normalize_skill_list(values: Any) -> list[str]:
    if not values:
        return []

    if isinstance(values, str):
        values = [values]

    normalized = []
    for value in values:
        skill = normalize_skill(value)
        if skill and skill not in normalized:
            normalized.append(skill)
    return normalized


def tokenize_requirements(value: str) -> list[str]:
    tokens = []
    for raw_token in re.findall(r"[a-zA-Z0-9+#.\-]+", normalize_text(value)):
        token = normalize_skill(raw_token)
        if token and token not in STOPWORDS:
            tokens.append(token)
    return tokens


def student_skill_pool(student: dict[str, Any]) -> list[str]:
    skills = []

    skills.extend(normalize_skill_list(student.get("tech_stack")))

    for item in student.get("skills") or []:
        if isinstance(item, dict):
            skills.append(normalize_skill(item.get("name")))
        else:
            skills.append(normalize_skill(item))

    for project in student.get("projects") or []:
        if isinstance(project, dict):
            skills.extend(normalize_skill_list(project.get("technologies")))

    return [skill for skill in dict.fromkeys(skill for skill in skills if skill)]


def text_corpus(student: dict[str, Any]) -> str:
    parts: list[str] = []
    for key in ("bio", "department", "year", "semester", "location", "name"):
        parts.append(str(student.get(key) or ""))

    parts.extend(student_skill_pool(student))

    for collection_name in ("projects", "internships", "competitions", "certificates"):
        for item in student.get(collection_name) or []:
            if isinstance(item, dict):
                parts.extend(str(value or "") for value in item.values())

    return normalize_text(" ".join(parts))


def count_related_items(student: dict[str, Any]) -> int:
    total = 0
    for collection_name in ("projects", "internships", "competitions", "certificates"):
        items = student.get(collection_name) or []
        if isinstance(items, list):
            total += len(items)
    return total


def safe_float(value: Any) -> float | None:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def score_skill_overlap(student_skills: list[str], required_skills: list[str], preferred_skills: list[str]) -> tuple[float, list[str], list[str]]:
    student_lookup = set(student_skills)
    required = [skill for skill in required_skills if skill]
    preferred = [skill for skill in preferred_skills if skill and skill not in required]

    matched = [skill for skill in required if skill in student_lookup]
    missing = [skill for skill in required if skill not in student_lookup]
    preferred_matches = [skill for skill in preferred if skill in student_lookup]

    score = 0.0
    if required:
        score += (len(matched) / len(required)) * 45.0
        if not missing:
            score += 5.0
    if preferred:
        score += (len(preferred_matches) / len(preferred)) * 20.0

    return score, matched, missing


def score_student(student: dict[str, Any], requirements: dict[str, Any]) -> dict[str, Any] | None:
    student_skills = student_skill_pool(student)
    requirement_text = normalize_text(requirements.get("requirements") or "")
    required_skills = normalize_skill_list(requirements.get("required_skills"))
    preferred_skills = normalize_skill_list(requirements.get("preferred_skills"))
    preferred_department = normalize_text(requirements.get("department") or "")
    min_cgpa = safe_float(requirements.get("min_cgpa"))

    if min_cgpa is not None:
        student_cgpa = safe_float(student.get("cgpa"))
        if student_cgpa is not None and student_cgpa < min_cgpa:
            return None

    score = 0.0
    reasons: list[str] = []

    skill_score, matched_skills, missing_skills = score_skill_overlap(student_skills, required_skills, preferred_skills)
    score += skill_score

    if matched_skills:
        reasons.append(f"Matched required skills: {', '.join(matched_skills[:4])}")
    if missing_skills:
        reasons.append(f"Missing required skills: {', '.join(missing_skills[:4])}")

    department = normalize_text(student.get("department") or "")
    if preferred_department and department == preferred_department:
        score += 12.0
        reasons.append("Department match")
    elif preferred_department and preferred_department in department:
        score += 7.0
        reasons.append("Department partial match")

    corpus = text_corpus(student)
    if requirement_text:
        requirement_tokens = [token for token in tokenize_requirements(requirement_text) if token not in STOPWORDS]
        if requirement_tokens:
            hits = [token for token in dict.fromkeys(requirement_tokens) if token in corpus]
            score += min(20.0, len(hits) * 4.0)
            if hits:
                reasons.append(f"Requirement keywords: {', '.join(hits[:5])}")

    student_cgpa = safe_float(student.get("cgpa"))
    if student_cgpa is not None:
        cgpa_scale = student_cgpa / 10.0 if student_cgpa > 4 else student_cgpa / 4.0
        score += max(0.0, min(10.0, cgpa_scale * 10.0))
        reasons.append(f"CGPA signal: {student_cgpa:.2f}")

    completeness = int(student.get("profileCompleteness") or 0)
    score += min(10.0, completeness / 10.0)
    if completeness:
        reasons.append(f"Profile completeness {completeness}%")

    if normalize_text(student.get("verificationStatus")) in {"verified", "strongly_verified"}:
        score += 5.0
        reasons.append("Verified profile")

    if normalize_text(student.get("faceVerificationStatus")) == "complete":
        score += 3.0
        reasons.append("Face verification complete")

    related_items = count_related_items(student)
    if related_items:
        score += min(10.0, math.log2(related_items + 1) * 3.0)
        reasons.append(f"Portfolio evidence: {related_items} items")

    summary_source = [student.get("bio"), student.get("department"), ", ".join(student_skills[:5])]
    summary = " | ".join(part for part in summary_source if part)
    if not summary:
        summary = "No summary available"

    ranked_score = round(min(score, 100.0), 2)
    return {
        "student_id": str(student.get("_id") or student.get("id") or ""),
        "name": student.get("name") or "Unknown Student",
        "department": student.get("department"),
        "year": student.get("year") or student.get("semester"),
        "cgpa": student_cgpa,
        "profile_image": student.get("profile_image"),
        "verification_status": student.get("verificationStatus"),
        "face_verification_status": student.get("faceVerificationStatus"),
        "profile_completeness": completeness if completeness else None,
        "match_score": ranked_score,
        "match_percent": int(round(ranked_score)),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "reasons": reasons[:6],
        "summary": summary,
    }


def build_recommendations(students: Iterable[dict[str, Any]], requirements: dict[str, Any]) -> list[dict[str, Any]]:
    ranked = []
    for student in students:
        item = score_student(student, requirements)
        if item is not None:
            ranked.append(item)

    ranked.sort(key=lambda item: (item["match_score"], len(item["matched_skills"]), item["summary"]), reverse=True)
    top_n = int(requirements.get("top_n") or 8)
    return ranked[:top_n]


def load_students_from_mongo() -> list[dict[str, Any]]:
    if not settings.mongo_uri:
        return []

    try:
        import importlib

        MongoClient = importlib.import_module("pymongo").MongoClient
    except ImportError:
        return []

    client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=4000)
    collection = client[settings.mongo_db][settings.student_collection]
    students = list(collection.find({}))

    for student in students:
        if "_id" in student:
            student["_id"] = str(student["_id"])

    return students
