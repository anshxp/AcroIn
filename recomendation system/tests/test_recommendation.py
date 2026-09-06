from fastapi.testclient import TestClient

from app.main import app
from app.services.recommendation_service import build_recommendations


def test_aliases_and_case_are_normalized():
    students = [{"id": "a", "name": "A", "tech_stack": ["ReactJS", "Node.js"]}]
    result = build_recommendations(students, {"required_skills": ["react", "node"], "top_n": 10})
    assert result[0]["student_id"] == "a"
    assert result[0]["match_score"] >= 50.0
    assert set(result[0]["matched_skills"]) == {"react", "nodejs"}
    assert result[0]["missing_skills"] == []


def test_cgpa_filter_excludes_lower_candidates():
    students = [
        {"id": "high", "name": "High", "cgpa": 9.0, "tech_stack": ["Python"]},
        {"id": "low", "name": "Low", "cgpa": 6.0, "tech_stack": ["Python"]},
    ]
    result = build_recommendations(students, {"required_skills": ["Python"], "min_cgpa": 8})
    assert [item["student_id"] for item in result] == ["high"]


def test_empty_students_returns_empty():
    assert build_recommendations([], {"required_skills": ["Python"]}) == []


def test_ranking_prefers_required_skill_match():
    students = [
        {"id": "weak", "name": "Weak", "tech_stack": ["python"]},
        {"id": "strong", "name": "Strong", "tech_stack": ["react", "nodejs"]},
    ]
    result = build_recommendations(students, {"required_skills": ["react", "node"], "top_n": 10})
    assert [item["student_id"] for item in result][:2] == ["strong", "weak"]


def test_http_contract():
    client = TestClient(app)
    assert client.get("/recommendations/health").status_code == 200
    assert client.post("/recommendations", json={"top_n": 0}).status_code == 422
    assert client.post("/recommendations", json={"required_skills": ["python"], "students": []}).status_code == 404
