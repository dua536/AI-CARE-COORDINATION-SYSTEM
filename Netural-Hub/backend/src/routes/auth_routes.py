from fastapi import APIRouter
from pydantic import BaseModel
from src.controllers.auth_controller import register_user, login_user

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "staff"                         # ✅ lowercase — schema ke saath align

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(data: RegisterRequest):      # ✅ async added
    return await register_user(                 # ✅ await added
        data.email, 
        data.password, 
        data.name, 
        data.role
    )

@router.post("/login")
async def login(data: LoginRequest):            # ✅ async added
    return await login_user(                    # ✅ await added
        data.email, 
        data.password
    )