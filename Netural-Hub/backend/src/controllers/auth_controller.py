# src/services/auth_service_logic.py
from prisma import Prisma
from src.services.auth_service import hash_password, verify_password
import jwt
import datetime
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

async def register_user(email: str, password: str, name: str = "", role: str = "staff"):
    async with Prisma() as db:
        existing = await db.user.find_unique(where={"email": email})
        if existing:
            return {"error": "User already exists"}
        
        hashed = hash_password(password)
        user = await db.user.create(data={
            "email": email,
            "password": hashed,
            "name": name,
            "role": role
        })
        return {"message": "User registered successfully", "id": user.id}

async def login_user(email: str, password: str):
    async with Prisma() as db:
        user = await db.user.find_unique(where={"email": email})
        if not user:
            return {"error": "User not found"}
        
        if verify_password(password, user.password):
            token = jwt.encode({
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm="HS256")
            return {
                "access_token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "role": user.role
                }
            }
        
        return {"error": "Invalid credentials"}