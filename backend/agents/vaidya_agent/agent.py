"""
Vaidya Agent - Crop Disease Diagnosis Specialist
Built with ADK framework for Project Kisan
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv
from google.adk.agents import LlmAgent
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API (service account or API key)
if os.getenv("GOOGLE_API_KEY"):
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

GEMINI_MODEL = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

def answer_crop_health_query(query: str, native_language: str = "Kannada") -> Dict[str, Any]:
    """
    Answers queries related to crop health, diseases, treatments, and prevention
    using Gemini LLM.
    Args:
        query: Farmer's question about crop health, disease, treatment, or 
            prevention.
    Returns:
        Dict with answer in native language for farmer.
    """
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        prompt = (
            "You are an expert plant pathologist. "
            f"Answer the following question from a farmer in simple "
            f"{native_language}. "
            "Provide clear, actionable advice about crop health, diseases, "
            "treatments, or prevention. "
            "If relevant, include name, cause, treatment, and prevention tips."
        )
        response = model.generate_content([
            prompt,
            query
        ])
        result = response.text if hasattr(response, "text") else str(response)
        return {"answer": result}
    except Exception as e:
        return {"answer": None, "error": str(e)}


vaidya_agent = LlmAgent(
    name="Vaidya",
    model=os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash"),
    description=(
        "Expert in crop health, disease diagnosis, treatment, and prevention "
        "using agricultural knowledge."
    ),
    instruction=(
        "You are Vaidya, the crop health and disease specialist. "
        "Answer farmers' questions about crop health, diseases, pests, or "
        "nutritional deficiencies. Provide accurate, actionable advice with "
        "confidence scores and comprehensive treatment or prevention plans. "
        "Reply in simple native language of farmer."
    ),
    tools=[answer_crop_health_query]
)