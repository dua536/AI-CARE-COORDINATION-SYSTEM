from src.services.agents.medical_rag_service import (
    retrieve_medical_context,
    generate_ai_summary,
    get_care_plan
)
from src.db import db

async def process_medical_rag(patient_data: dict, query: str) -> dict:
    # ✅ Agar patient_id diya gaya hai, poora patient record fetch karo
    patient_id = patient_data.get("patient_id")
    
    if patient_id:
        patient = await db.patient.find_unique(where={"id": patient_id})
        if patient:
            patient_data = {
                "patient_id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "condition": patient.condition,    # ✅ asli diagnosis
                "gender": patient.gender,
                "status": patient.status,
                "notes": patient.notes
            }

    context = await retrieve_medical_context(query)
    result = await generate_ai_summary(patient_data, context)
    return result

async def get_care_plan_controller(patient_id: str) -> dict:
    return await get_care_plan(patient_id)