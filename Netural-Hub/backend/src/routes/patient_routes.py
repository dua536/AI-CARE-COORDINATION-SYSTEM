from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from src.controllers.patient_controller import (
    create_patient_controller,
    get_all_patients_controller,
    get_patient_controller,
    update_patient_controller,
    delete_patient_controller
)

router = APIRouter()

class PatientModel(BaseModel):
    name: str
    age: int
    gender: Optional[str] = "Male"
    status: Optional[str] = "active"
    phone: Optional[str] = None
    email: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
async def get_all_patients():
    return await get_all_patients_controller()

@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    return await get_patient_controller(patient_id)

@router.post("/")
async def create_patient(data: PatientModel):
    return await create_patient_controller(data)

@router.put("/{patient_id}")
async def update_patient(patient_id: str, data: PatientUpdate):
    return await update_patient_controller(patient_id, data)

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    return await delete_patient_controller(patient_id)