from fastapi import FastAPI
from app.api.routes import router
from app.services.faiss_service import load_index
from app.services.liveness_service import liveness_model

app = FastAPI(title="AcroIn Face Recognition Service", version="1.1.0")


@app.on_event("startup")
def startup_event():
    load_index()
    if liveness_model.model_path:
        liveness_model.load()


@app.get("/")
def root() -> dict[str, object]:
    return {
        "success": True,
        "service": "face_rec_service",
        "status": "healthy",
        "liveness_configured": liveness_model.configured,
    }


app.include_router(router)
