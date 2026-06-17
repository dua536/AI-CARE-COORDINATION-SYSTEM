from fastapi import APIRouter, UploadFile, File
from src.services.media_service import save_file, list_files, delete_file

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return await save_file(file)

@router.get("")
@router.get("/")
async def get_files():
    return await list_files()

@router.delete("/delete/{file_id}")
async def remove_file(file_id: str):
    return await delete_file(file_id)