import os
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from app.utils.image_utils import read_image
from app.services.embedding_service import get_embedding
from app.services.faiss_service import add_embedding, search_embedding

router = APIRouter()


def verify_api_key(x_face_api_key: str | None) -> None:
    expected_api_key = os.getenv("FACE_API_KEY", "").strip()
    environment = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).strip().lower()

    if not expected_api_key and environment in {"production", "prod"}:
        raise HTTPException(status_code=503, detail="Face service authentication is not configured")

    if expected_api_key and x_face_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized request")


def safe_read_image(file: UploadFile):
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
        raise HTTPException(status_code=500, detail="Face embedding failed") from exc


@router.post("/enroll")
async def enroll(
    student_id: str = Form(...),
    front: UploadFile = File(...),
    left: UploadFile = File(...),
    right: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None),
):
    verify_api_key(x_face_api_key)

    front_img = safe_read_image(front)
    left_img = safe_read_image(left)
    right_img = safe_read_image(right)

    emb_front = safe_embedding(front_img)
    emb_left = safe_embedding(left_img)
    emb_right = safe_embedding(right_img)

    try:
        add_embedding(emb_front, student_id)
        add_embedding(emb_left, student_id)
        add_embedding(emb_right, student_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Face enrollment failed") from exc

    return {
        "success": True,
        "model_version": "arcface_v1",
        "embeddings": {
            "front": emb_front.tolist(),
            "left": emb_left.tolist(),
            "right": emb_right.tolist(),
        },
    }


@router.post("/search")
async def search(
    file: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None),
):
    verify_api_key(x_face_api_key)

    img = safe_read_image(file)
    emb = safe_embedding(img)

    try:
        result = search_embedding(emb)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Face search failed") from exc

    if result is None:
        return {"match": False}

    return {
        "match": True,
        "student_id": result["student_id"],
        "confidence": result["confidence"],
    }


@router.post("/embed")
async def embed(
    file: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None),
):
    verify_api_key(x_face_api_key)

    img = safe_read_image(file)
    emb = safe_embedding(img)

    return {
        "success": True,
        "embedding": emb.tolist(),
    }
