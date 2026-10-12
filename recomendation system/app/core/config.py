from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    app_name: str = "AcroIn Recommendation System"
    environment: str = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).strip().lower()
    mongo_uri: str = os.getenv("MONGO_URI", "").strip()
    mongo_db: str = os.getenv("MONGO_DB", "acroin").strip() or "acroin"
    student_collection: str = os.getenv("MONGO_STUDENT_COLLECTION", "students").strip() or "students"
    internal_api_key: str = os.getenv("RECOMMENDATION_API_KEY", "").strip()
    allowed_origins: tuple[str, ...] = tuple(
        origin.strip().rstrip("/")
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if origin.strip()
    )


def validate_production_configuration(
    config: Settings,
    configured_origins: str,
) -> None:
    if config.environment not in {"production", "prod"}:
        return

    missing = [
        name
        for name, value in {
            "MONGO_URI": config.mongo_uri,
            "RECOMMENDATION_API_KEY": config.internal_api_key,
            "ALLOWED_ORIGINS": configured_origins.strip(),
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(
            "Missing required production recommendation-service configuration: "
            + ", ".join(missing)
        )

    if not config.allowed_origins or any(
        origin == "*" or not origin.lower().startswith("https://")
        for origin in config.allowed_origins
    ):
        raise RuntimeError(
            "ALLOWED_ORIGINS must contain explicit HTTPS origins in production"
        )


settings = Settings()
