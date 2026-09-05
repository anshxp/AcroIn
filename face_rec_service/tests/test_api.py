from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_embed_rejects_missing_file():
    response = client.post("/embed")
    assert response.status_code == 422


def test_search_rejects_invalid_image():
    response = client.post(
        "/search",
        files={"file": ("invalid.jpg", b"not-an-image", "image/jpeg")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid image upload"


def test_production_requires_face_api_key():
    with patch.dict("os.environ", {"ENVIRONMENT": "production", "FACE_API_KEY": ""}):
        response = client.post(
            "/search",
            files={"file": ("invalid.jpg", b"not-an-image", "image/jpeg")},
        )
    assert response.status_code == 503


def test_wrong_face_api_key_is_rejected():
    with patch.dict("os.environ", {"FACE_API_KEY": "expected-key", "ENVIRONMENT": "development"}):
        response = client.post(
            "/search",
            headers={"X-Face-Api-Key": "wrong-key"},
            files={"file": ("invalid.jpg", b"not-an-image", "image/jpeg")},
        )
    assert response.status_code == 401
