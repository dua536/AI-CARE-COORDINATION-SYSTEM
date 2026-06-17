from src.db import db
from fastapi import HTTPException

# -----------------------------
# GET ALL PATIENTS
# -----------------------------
async def get_all_patients():
    return await db.patient.find_many()


# -----------------------------
# GET SINGLE PATIENT
# -----------------------------
async def get_patient(patient_id: str):
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


# -----------------------------
# CREATE PATIENT
# -----------------------------
async def add_patient(data) -> dict:
    return await db.patient.create(data={
        "name": data.name,
        "age": data.age,
        "condition": data.condition or "",
        "gender": data.gender,
        "status": data.status or "active",
        "phone": data.phone,
        "email": data.email,
        "notes": data.notes,
    })


# -----------------------------
# UPDATE PATIENT
# -----------------------------
async def update_patient(patient_id: str, data) -> dict:
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = {k: v for k, v in data.dict().items() if v is not None}

    # diagnosis → condition mapping
    if "diagnosis" in update_data:
        update_data["condition"] = update_data.pop("diagnosis")

    return await db.patient.update(
        where={"id": patient_id},
        data=update_data
    )


# -----------------------------
# DELETE PATIENT
# -----------------------------
async def delete_patient(patient_id: str) -> dict:
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    await db.patient.delete(where={"id": patient_id})
    return {"message": "Patient deleted successfully"}