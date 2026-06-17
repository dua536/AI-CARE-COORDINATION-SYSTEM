from src.services.agents.therapy_agent_service import (
    get_context,
    generate_therapy_plan
)

async def process_therapy(symptoms: str):
    context = await get_context(symptoms)        # ✅ await added
    result = await generate_therapy_plan(symptoms, context)  # ✅ await added
    return result