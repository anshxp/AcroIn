import numpy as np
from app.core.model import get_model

def get_embedding(image):
    model = get_model()

    faces = model.get(image)

    if len(faces) == 0:
        raise Exception("No face detected")

    if len(faces) > 1:
        raise Exception("Multiple faces detected")

    emb = faces[0].embedding
    emb = emb / np.linalg.norm(emb)

    return emb