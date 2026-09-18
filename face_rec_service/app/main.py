import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.services.faiss_service import load_index

from app.services.embedding_service import get_embedding  # noqa: F401


@asynccontextmanager
async def lifespan(_app: FastAPI):
    environment = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).strip().lower()
    api_key = os.getenv("FACE_API_KEY", "").strip()
    if environment in {"production", "prod"} and not api_key:
        raise RuntimeError("FACE_API_KEY must be configured in production")
    load_index()
    yield


app = FastAPI(title="AcroIn Face Recognition Service", version="1.0.0", lifespan=lifespan)


@app.get("/")
def root() -> dict[str, object]:
    environment = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).strip().lower()
    return {
        "success": True,
        "service": "face_rec_service",
        "status": "healthy",
        "environment": environment,
    }


app.include_router(router)
