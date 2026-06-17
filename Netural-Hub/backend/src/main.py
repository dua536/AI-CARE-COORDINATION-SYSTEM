from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.auth_routes import router as auth_router
from src.routes import patient_routes, media_routes
from src.routes.agents import medical_rag_routes, therapy_agent_routes
from src.routes.appointment_routes import router as appointment_router
from src.db import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()

    # ✅ Startup pe purane documents vector store mein load karo
    try:
        from src.worker import process_document
        documents = await db.document.find_many()
        for doc in documents:
            await process_document(doc.content)
        print(f"✅ {len(documents)} documents loaded into vector store")
    except Exception as e:
        print(f"Vector store load error: {e}")

    yield
    await db.disconnect()

app = FastAPI(lifespan=lifespan, redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {"message": "AI Care Coordination System is running"}

app.include_router(auth_router,               prefix="/auth")
app.include_router(patient_routes.router,     prefix="/patients")
app.include_router(media_routes.router,       prefix="/documents")
app.include_router(medical_rag_routes.router, prefix="/agents")
app.include_router(therapy_agent_routes.router, prefix="/agents")
app.include_router(appointment_router,        prefix="/appointments")