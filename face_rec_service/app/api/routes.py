import os
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from app.utils.image_utils import read_image
from app.services.embedding_service import get_embedding
from app.services.faiss_service import add_embedding, search_embedding

router = APIRouter()


def verify_api_key(x_face_api_key: str | None) -> None:
    expected_api_key = os.getenv("FACE_API_KEY", "").strip()
    if expected_api_key and x_face_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized request")

@router.post("/enroll")
async def enroll(
    student_id: str = Form(...),
    front: UploadFile = File(...),
    left: UploadFile = File(...),
    right: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None)
):
    verify_api_key(x_face_api_key)
    try:
        front_img = read_image(front)
        left_img = read_image(left)
        right_img = read_image(right)

        emb_front = get_embedding(front_img)
        emb_left = get_embedding(left_img)
        emb_right = get_embedding(right_img)

        # add all embeddings
        add_embedding(emb_front, student_id)
        add_embedding(emb_left, student_id)
        add_embedding(emb_right, student_id)

        return {
            "success": True,
            "model_version": "arcface_v1",
            "embeddings": {
                "front": emb_front.tolist(),
                "left": emb_left.tolist(),
                "right": emb_right.tolist(),
            },
        }

    except Exception as e:
        return {"error": str(e)}


@router.post("/search")
async def search(
    file: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None)
):
    verify_api_key(x_face_api_key)
    try:
        img = read_image(file)
        emb = get_embedding(img)

        result = search_embedding(emb)

        if result is None:
            return {"match": False}

        return {
            "match": True,
            "student_id": result["student_id"],
            "confidence": result["confidence"]
        }

    except Exception as e:
        return {"error": str(e)}


@router.post("/embed")
async def embed(
    file: UploadFile = File(...),
    x_face_api_key: str | None = Header(default=None)
):
    verify_api_key(x_face_api_key)
    try:
        img = read_image(file)
        emb = get_embedding(img)
        return {
            "success": True,
            "embedding": emb.tolist()
        }
    except Exception as e:
        return {"error": str(e)}