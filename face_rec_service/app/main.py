from fastapi import FastAPI
from app.api.routes import router
from app.services.faiss_service import load_index

app = FastAPI(title="AcroIn Face Recognition Service", version="1.0.0")


@app.on_event("startup")
def startup_event():
    load_index()


@app.get("/")
def root() -> dict[str, object]:
    return {
        "success": True,
        "service": "face_rec_service",
        "status": "healthy",
    }


app.include_router(router)
