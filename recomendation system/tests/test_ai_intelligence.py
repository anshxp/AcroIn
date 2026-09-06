from app.services.ai_intelligence import anomaly_score, placement_prediction, smart_match


def test_smart_match_returns_component_scores():
    result = smart_match(
        {"skills": ["Python", "React"], "projects": ["AI dashboard"], "work_style": "collaborative"},
        {"skills": ["python", "sql"], "research_interests": "AI dashboards", "work_style": "collaborative"},
    )
    assert result["match_score"] >= 0
    assert result["skill_compatibility"] > 0
    assert "python" in result["matched_skills"]


def test_placement_prediction_is_bounded_and_explainable():
    result = placement_prediction({"skills": ["python", "sql"], "projects": [{"name": "x"}], "cgpa": 8.0, "profileCompleteness": 90})
    assert 0 <= result["success_probability"] <= 100
    assert isinstance(result["skill_gap_analysis"], list)
    assert result["career_pathways"]


def test_anomaly_detection_flags_suspicious_activity():
    result = anomaly_score({"email": "test@mailinator.com", "name": "A", "profileCompleteness": 10, "activity": {"requests_last_hour": 500}})
    assert result["risk_level"] in {"medium", "high"}
    assert result["signals"]
