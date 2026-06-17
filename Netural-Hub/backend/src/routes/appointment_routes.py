from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.db import db

router = APIRouter()

class AppointmentCreate(BaseModel):
    patient_id: str
    patient_name: str
    type: str
    date: str
    time: str
    notes: Optional[str] = ""
    status: Optional[str] = "pending"

@router.get("/")                                    # ✅ Fix
async def get_appointments():
    return await db.appointment.find_many()

@router.post("/")                                    # ✅ Fix
async def create_appointment(data: AppointmentCreate):
    return await db.appointment.create(data={
        "patientId": data.patient_id,
        "patientName": data.patient_name,
        "type": data.type,
        "date": data.date,
        "time": data.time,
        "notes": data.notes,
        "status": data.status or "pending"
    })

@router.put("/{appointment_id}")                     # ✅ Fix
async def update_appointment(appointment_id: str, data: AppointmentCreate):
    existing = await db.appointment.find_unique(where={"id": appointment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return await db.appointment.update(
        where={"id": appointment_id},
        data={
            "patientId": data.patient_id,
            "patientName": data.patient_name,
            "type": data.type,
            "date": data.date,
            "time": data.time,
            "notes": data.notes,
            "status": data.status
        }
    )

@router.delete("/{appointment_id}")                  # ✅ Fix
async def delete_appointment(appointment_id: str):
    existing = await db.appointment.find_unique(where={"id": appointment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await db.appointment.delete(where={"id": appointment_id})
    return {"message": "Appointment deleted successfully"}