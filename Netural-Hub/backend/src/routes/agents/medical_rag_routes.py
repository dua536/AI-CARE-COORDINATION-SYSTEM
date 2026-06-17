from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from src.controllers.agents.medical_rag_controller import (
    process_medical_rag,
    get_care_plan_controller
)

router = APIRouter()


class MedicalQuery(BaseModel):
    question: str
    patient_id: Optional[str] = None


# Optional improvement - agar patient_id na ho tab bhi handle ho
@router.post("/medical-rag")
async def medical_rag_endpoint(body: MedicalQuery):
    return await process_medical_rag(
        patient_data={"patient_id": body.patient_id or ""},  # ✅ None se bachao
        query=body.question
    )


@router.get("/care-plan/{patient_id}")
async def care_plan_endpoint(patient_id: str):
    return await get_care_plan_controller(patient_id)