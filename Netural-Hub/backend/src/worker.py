import os
import httpx
import asyncio
from dotenv import load_dotenv
from src.vector_store import add_vector
from fastapi import BackgroundTasks

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/embeddings"

async def generate_embedding(text: str) -> list:
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistral-embed",
        "input": [text]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            MISTRAL_API_URL,
            headers=headers,
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]


async def process_document(file_text: str) -> dict:
    lines = [l.strip() for l in file_text.split("\n") if l.strip()]

    chunk_size = 4
    chunks = []
    for i in range(0, len(lines), chunk_size):
        chunk = " ".join(lines[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)

    if len(chunks) <= 2:
        chunks.append(file_text.strip())

    # ✅ NEW — Full document ek dedicated chunk ke taur pe
    chunks.append(f"FULL ORIGINAL DOCUMENT (most reliable source, read carefully top to bottom): {file_text.strip()}")

    stored = 0
    for chunk in chunks:
        try:
            embedding = await generate_embedding(chunk)
            await add_vector(embedding, chunk)
            stored += 1
        except Exception as e:
            print(f"Chunk processing error: {e}")
            continue

    print(f"✅ Document processed: {stored} chunks stored")
    return {
        "status": "processed",
        "chunks_stored": stored
    }


async def run_in_background(func, *args):
    try:
        await func(*args)
    except Exception as e:
        print(f"Background task error: {e}")