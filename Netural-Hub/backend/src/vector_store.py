import faiss
import numpy as np

DIMENSION = 1024

index = faiss.IndexFlatL2(DIMENSION)
stored_chunks = []


async def add_vector(embedding, text):
    vector = np.array([embedding], dtype="float32")
    faiss.normalize_L2(vector)
    index.add(vector)
    stored_chunks.append(text)


async def search_vector(
    query_embedding, 
    top_k=6                                      # ✅ 3 se 6 kiya — zyada context
):
    if index.ntotal == 0:
        return []

    vector = np.array([query_embedding], dtype="float32")
    faiss.normalize_L2(vector)

    distances, indices = index.search(vector, top_k)

    results = []
    for i in indices[0]:
        if 0 <= i < len(stored_chunks):
            results.append(stored_chunks[i])

    return results