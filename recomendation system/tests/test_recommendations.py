from fastapi.testclient import TestClient

from app.main import app
from app.services.recommendation_service import build_recommendations


client = TestClient(app)


def test_health():
    response = client.get("/recommendations/health")
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_invalid_top_n_is_rejected():
    response = client.post("/recommendations", json={"top_n": 0})
    assert response.status_code == 422


def test_empty_students_returns_not_found():
    response = client.post(
        "/recommendations",
        json={"required_skills": ["python"], "students": []},
    )
    assert response.status_code == 404


def test_skill_aliases_and_ranking():
    students = [
        {
            "id": "perfect",
            "name": "Perfect",
            "department": "CSE",
            "tech_stack": ["ReactJS", "Node.js"],
        },
        {
            "id": "partial",
            "name": "Partial",
            "department": "CSE",
            "tech_stack": ["React"],
        },
    ]
    ranked = build_recommendations(
        students,
        {"required_skills": ["react", "nodejs"], "department": "CSE", "top_n": 2},
    )
    assert ranked[0]["student_id"] == "perfect"
    assert ranked[0]["match_percent"] > ranked[1]["match_percent"]


def test_cgpa_filter():
    students = [
        {"id": "high", "name": "High", "cgpa": 9.0, "tech_stack": []},
        {"id": "low", "name": "Low", "cgpa": 6.0, "tech_stack": []},
    ]
    ranked = build_recommendations(students, {"min_cgpa": 8})
    assert [item["student_id"] for item in ranked] == ["high"]
