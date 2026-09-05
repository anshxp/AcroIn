from pathlib import Path
import pickle

import faiss
import numpy as np


DIMENSION = 512
SERVICE_ROOT = Path(__file__).resolve().parents[2]
INDEX_PATH = SERVICE_ROOT / "faiss_index.bin"
IDS_PATH = SERVICE_ROOT / "student_ids.pkl"

index = faiss.IndexFlatIP(DIMENSION)
student_ids: list[str] = []


def load_index() -> None:
    global index, student_ids

    if not INDEX_PATH.exists():
        return

    if not IDS_PATH.exists():
        # A legacy repository may contain an orphaned FAISS index without its
        # student-ID mapping. It cannot safely be searched, so start clean and
        # let the next enrollment persist a consistent pair of files.
        index = faiss.IndexFlatIP(DIMENSION)
        student_ids = []
        return

    loaded_index = faiss.read_index(str(INDEX_PATH))
    with IDS_PATH.open("rb") as f:
        loaded_ids = pickle.load(f)

    if not isinstance(loaded_ids, list):
        raise ValueError("Invalid student ID index")

    normalized_ids = [str(student_id) for student_id in loaded_ids]
    if loaded_index.ntotal != len(normalized_ids):
        raise ValueError(
            f"Face index mismatch: {loaded_index.ntotal} embeddings but {len(normalized_ids)} student IDs"
        )

    index = loaded_index
    student_ids = normalized_ids


def save_index() -> None:
    faiss.write_index(index, str(INDEX_PATH))
    with IDS_PATH.open("wb") as f:
        pickle.dump(student_ids, f)


def add_embedding(embedding, student_id: str) -> None:
    global index, student_ids

    vector = np.asarray([embedding], dtype="float32")
    if vector.shape != (1, DIMENSION):
        raise ValueError(f"Expected embedding shape (1, {DIMENSION})")

    index.add(vector)
    student_ids.append(student_id)
    save_index()


THRESHOLD = 0.65


def search_embedding(query_embedding, k: int = 1):
    query = np.asarray([query_embedding], dtype="float32")

    if query.shape != (1, DIMENSION):
        raise ValueError(f"Expected query embedding shape (1, {DIMENSION})")

    if index.ntotal == 0:
        return None

    if index.ntotal != len(student_ids):
        raise RuntimeError("Face index and student ID mapping are out of sync")

    D, I = index.search(query, k)
    confidence = float(D[0][0])
    match_index = int(I[0][0])

    if confidence < THRESHOLD:
        return None

    if match_index < 0 or match_index >= len(student_ids):
        return None

    return {
        "student_id": student_ids[match_index],
        "confidence": confidence,
    }
