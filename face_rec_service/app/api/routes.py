import os

from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException

from app.utils.image_utils import read_image
from app.services.embedding_service import get_embedding
from app.services.faiss_service import add_embedding, search_embedding
from app.services.liveness_service import liveness_model

router = APIRouter()
MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


def verify_api_key(x_face_api_key: str | None) -> None:
    expected_api_key = os.getenv("FACE_API_KEY", "").strip()
    environment = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).strip().lower()
    if not expected_api_key and environment in {"production", "prod"}:
        raise HTTPException(status_code=503, detail="Face service authentication is not configured")
    if expected_api_key and x_face_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized request")


def safe_read_image(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are accepted")
    try:
        image = read_image(file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image upload") from exc
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image upload")
    return image


def safe_embedding(image):
    try:
        return get_embedding(image)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def require_liveness(image) -> dict:
    required = os.getenv("REQUIRE_LIVENESS", "true").strip().lower() in {"1", "true", "yes"}
    if not required:
        return {"verified": False, "required": False, "status": "disabled"}
    if not liveness_model.configured:
        raise HTTPException(status_code=503, detail="Liveness verification is required but the anti-spoofing model is not configured")
    try:
        result = liveness_model.verify(image)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not result.get("live", False):
        raise HTTPException(status_code=403, detail="Liveness verification failed")
    return result


@router.get("/health")
def health() -> dict[str, object]:
    return {
        "success": True,
        "service": "face_rec_service",
        "model_version": "arcface_v1",
        "liveness_configured": liveness_model.configured,
        "liveness_required": os.getenv("REQUIRE_LIVENESS", "true").lower() in {"1", "true", "yes"},
    }


@router.post("/enroll")
async def enroll(
    student_id: str = Form(...),
    front: UploadFile = File(...),
    left: UploadFile = File(...),
    right: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None),
):
    verify_api_key(x_face_api_key)
    if not student_id.strip():
        raise HTTPException(status_code=422, detail="student_id is required")

    images = [safe_read_image(front), safe_read_image(left), safe_read_image(right)]
    for image in images:
        require_liveness(image)

    embeddings = [safe_embedding(image) for image in images]
    try:
        for embedding in embeddings:
            add_embedding(embedding, student_id.strip())
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Face enrollment failed") from exc

    # Never return biometric embeddings to clients.
    return {"success": True, "student_id": student_id.strip(), "model_version": "arcface_v1", "liveness": "verified"}


@router.post("/search")
async def search(file: UploadFile = File(...), x_face_api_key: str | None = Header(default=None)):
    verify_api_key(x_face_api_key)
    img = safe_read_image(file)
    liveness = require_liveness(img)
    emb = safe_embedding(img)
    try:
        result = search_embedding(emb)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Face search failed") from exc
    if result is None:
        return {"match": False, "liveness": liveness}
    return {"match": True, "student_id": result["student_id"], "confidence": result["confidence"], "liveness": liveness}


@router.post("/embed")
async def embed(file: UploadFile = File(...), x_face_api_key: str | None = Header(default=None)):
    verify_api_key(x_face_api_key)
    img = safe_read_image(file)
    require_liveness(img)
    emb = safe_embedding(img)
    # This endpoint remains internal and authenticated; embeddings should not be persisted by the client.
    return {"success": True, "model_version": "arcface_v1", "embedding": emb.tolist()}
