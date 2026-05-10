from fastapi import FastAPI
from app.api.routes import router
from app.services.faiss_service import load_index

app = FastAPI()

@app.on_event("startup")
def startup_event():
    load_index()

app.include_router(router)