from app.services.recommendation_service import build_recommendations


def test_aliases_and_case_are_normalized():
    students = [{"id": "a", "name": "A", "tech_stack": ["ReactJS", "Node.js"]}]
    result = build_recommendations(students, {"required_skills": ["react", "node"], "top_n": 10})
    assert result[0]["student_id"] == "a"
    assert result[0]["match_score"] == 100.0


def test_cgpa_filter_excludes_lower_candidates():
    students = [
        {"id": "high", "name": "High", "cgpa": 9.0, "tech_stack": ["Python"]},
        {"id": "low", "name": "Low", "cgpa": 6.0, "tech_stack": ["Python"]},
    ]
    result = build_recommendations(students, {"required_skills": ["Python"], "min_cgpa": 8})
    assert [item["student_id"] for item in result] == ["high"]


def test_empty_students_returns_empty():
    assert build_recommendations([], {"required_skills": ["Python"]}) == []
