from src.db import db
from fastapi import HTTPException

async def get_all_patients_controller():
    return await db.patient.find_many()

async def get_patient_controller(patient_id: str):
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

async def create_patient_controller(data):
    return await db.patient.create(data={
        "name": data.name,
        "age": data.age,
        "condition": data.diagnosis or "",
        "gender": data.gender,
        "status": data.status or "active",
        "phone": data.phone,
        "email": data.email,
        "notes": data.notes,
    })

async def update_patient_controller(patient_id: str, data):
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    # ✅ Agar frontend "diagnosis" bhejta hai tab bhi handle ho
    if "diagnosis" in update_data:
        update_data["condition"] = update_data.pop("diagnosis")
    
    return await db.patient.update(where={"id": patient_id}, data=update_data)

async def delete_patient_controller(patient_id: str):
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    await db.patient.delete(where={"id": patient_id})
    return {"message": "Patient deleted successfully"}