from fastapi import APIRouter
from pydantic import BaseModel
from src.controllers.agents.therapy_agent_controller import process_therapy

router = APIRouter()

class TherapyRequest(BaseModel):
    symptoms: str

@router.post("/therapy")
async def therapy_endpoint(request: TherapyRequest):        # ✅ async added
    return await process_therapy(request.symptoms)          # ✅ await added