from __future__ import annotations

from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .core.config import settings

environment = settings.environment
if environment in {"production", "prod"}:
    missing = [
        name
        for name, value in {
            "MONGO_URI": settings.mongo_uri,
            "RECOMMENDATION_API_KEY": settings.internal_api_key,
            "ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS", "").strip(),
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(
            "Missing required production recommendation-service configuration: "
            + ", ".join(missing)
        )

    if not settings.allowed_origins or any(
        origin == "*" or not origin.startswith("https://")
        for origin in settings.allowed_origins
    ):
        raise RuntimeError(
            "ALLOWED_ORIGINS must contain explicit HTTPS origins in production"
        )

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict[str, object]:
    return {
        "success": True,
        "message": "AcroIn recommendation system is running",
    }
