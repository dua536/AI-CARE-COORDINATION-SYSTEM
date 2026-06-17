import httpx
import os
from src.db import db
from src.vector_store import search_vector
from src.worker import generate_embedding

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-medium"

# -----------------------------
# RETRIEVE CONTEXT
# -----------------------------
async def retrieve_medical_context(query: str) -> str:
    try:
        query_embedding = await generate_embedding(query)
        results = await search_vector(query_embedding, top_k=8)   # ✅ 6 se 8 kiya
        return " ".join(results) if results else "No relevant medical data found"
    except Exception as e:
        print("Embedding/Search Error:", e)
        return "No relevant medical data found"


# -----------------------------
# MISTRAL API CALL (helper)
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
                "content": "You are a precise, fact-checking medical AI assistant. Accuracy of numerical data is your highest priority — always verify numbers against their correct source/column before stating them."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.0                                  # ✅ 0.3 se 0.0 — maximum determinism
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
# AI SUMMARY — Mistral
# -----------------------------
async def generate_ai_summary(patient_data: dict, context: str) -> dict:
    prompt = f"""
You are a medical AI assistant. Read the medical context EXTREMELY CAREFULLY before answering.

CRITICAL RULES FOR READING LAB REPORTS:
1. Lab reports have a "Current Result" column and a "Previous Results & Date" column.
2. The "Current Result" is ALWAYS the most recent test, taken from the most recent date in the report header (e.g., "Reported on" date).
3. NEVER state a "Previous Result" value as if it were the "Current Result" — these are different numbers.
4. Before writing any number, verify: which column does this number belong to, and what date is attached to it?
5. If unsure which value is current, say so explicitly rather than guessing.

Patient Data: {patient_data}
Medical Context: {context}

Provide:
1. Clinical Summary (state the CURRENT result first, clearly labeled with its date)
2. Risk Assessment (Low/Medium/High)
3. Key Recommendations
4. Urgent flags (if any)

Be concise, professional, and double-check all numerical values against their correct column before finalizing your answer.
"""
    try:
        result = await call_mistral(prompt)
    except Exception as e:
        print("Mistral Error:", e)
        result = "AI service unavailable. Please try again."

    await db.aihistory.create(
        data={
            "query": str(patient_data),
            "response": result,
            "context": context
        }
    )

    return {"ai_response": result}

async def get_care_plan(patient_id: str) -> dict:
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        return {"error": "Patient not found"}

    # ✅ FIX — Specific query jo "current result" target kare
    rag_context = await retrieve_medical_context(
        f"{patient.name} current HbA1c result most recent test value and date"
    )

    prompt = f"""
You are a medical AI assistant. Create a detailed, ACCURATE care plan based STRICTLY on the data below. 
Do NOT write "assumed" or guess any condition — use only the confirmed information provided.

CONFIRMED PATIENT RECORD (from database — this is the verified diagnosis):
Name: {patient.name}
Age: {patient.age}
Diagnosed Condition: {patient.condition}
Gender: {patient.gender}
Status: {patient.status}
Notes: {patient.notes}

ADDITIONAL MEDICAL DOCUMENTS (lab reports, test history):
{rag_context}

CRITICAL RULES FOR READING LAB REPORTS:
1. The "Current Result" column is always the MOST RECENT test value (check the "Reported on" date).
2. "Previous Results & Date" are OLDER values from earlier dates — never confuse them with the current result.
3. Use "Diagnosed Condition" above as the confirmed diagnosis — never write "assumed based on context".
4. Cross-check the date attached to each number before stating it as "current".

Provide a structured care plan including:
1. Recommended Treatments
2. Medications (if applicable)
3. Follow-up Schedule
4. Lifestyle Recommendations
5. Risk Level and Monitoring Plan

Be specific and professional. Double check the current HbA1c value before finalizing your answer.
"""
    try:
        result = await call_mistral(prompt)
    except Exception as e:
        print("Mistral Error:", e)
        result = "AI service unavailable. Please try again."

    await db.aihistory.create(
        data={
            "query": f"care-plan:{patient_id}",
            "response": result,
            "context": f"Patient: {patient.name}, Condition: {patient.condition}"
        }
    )

    return {"care_plan": result}