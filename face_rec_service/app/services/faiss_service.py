import faiss
import numpy as np
import os
import pickle

dimension = 512
index_path = "faiss_index.bin"
ids_path = "student_ids.pkl"

# initialize empty
index = faiss.IndexFlatIP(dimension)
student_ids = []

# 🔥 LOAD IF EXISTS
def load_index():
    global index, student_ids

    if os.path.exists(index_path):
        index = faiss.read_index(index_path)

    if os.path.exists(ids_path):
        with open(ids_path, "rb") as f:
            student_ids = pickle.load(f)


# 🔥 SAVE
def save_index():
    faiss.write_index(index, index_path)

    with open(ids_path, "wb") as f:
        pickle.dump(student_ids, f)


# 🔥 ADD EMBEDDING
def add_embedding(embedding, student_id):
    global index, student_ids

    embedding = np.array([embedding]).astype('float32')

    index.add(embedding)
    student_ids.append(student_id)

    save_index()  # 🔥 persist immediately


# 🔥 SEARCH WITH THRESHOLD
THRESHOLD = 0.65

def search_embedding(query_embedding, k=1):
    query = np.array([query_embedding]).astype('float32')

    if index.ntotal == 0:
        return None

    D, I = index.search(query, k)

    confidence = float(D[0][0])
    match_index = I[0][0]

    if confidence < THRESHOLD:
        return None

    if match_index >= len(student_ids):
        return None

    return {
        "student_id": student_ids[match_index],
        "confidence": confidence
    }