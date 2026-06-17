import httpx
import os
from src.db import db

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-medium"

# -----------------------------
# MISTRAL HELPER
# -----------------------------
async def call_mistral(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MISTRAL_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a professional therapy and mental health AI assistant. Provide empathetic, evidence-based therapy plans."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.4
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            MISTRAL_API_URL,
            headers=headers,
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# -----------------------------
# GET CONTEXT
# -----------------------------
async def get_context(symptoms: str) -> str:        # ✅ async added
    # Later: RAG / medical docs se context fetch
    return f"Patient presenting symptoms: {symptoms}"


# -----------------------------
# GENERATE THERAPY PLAN — Mistral
# -----------------------------
async def generate_therapy_plan(                    # ✅ async added
    symptoms: str, 
    context: str
) -> dict:
    prompt = f"""
You are a professional therapy AI assistant. Create a detailed therapy plan.

Symptoms: {symptoms}
Clinical Context: {context}

Provide a structured therapy plan including:
1. Diagnosis Assessment
2. Recommended Therapy Type (CBT, DBT, etc.)
3. Session Plan (frequency and duration)
4. Coping Strategies
5. Emergency Guidelines
6. Follow-up Recommendations

Be empathetic, clear, and professional.
"""
    try:
        result = await call_mistral(prompt)         # ✅ Mistral call
    except Exception as e:
        print("Mistral Error:", e)
        result = "AI therapy service unavailable. Please consult a healthcare professional."

    # ✅ AIHistory mein save karo
    await db.aihistory.create(
        data={
            "query": symptoms,
            "response": result,
            "context": context
        }
    )

    return {
        "therapy_plan": result,
        "recommendation": "If symptoms worsen, consult a doctor immediately."
    }