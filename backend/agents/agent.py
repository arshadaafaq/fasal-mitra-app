"""
Primary Orchestrator Agent - "Mitra" Brain
Built with ADK framework for Project Kisan
"""

import os
import json
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
from dotenv import load_dotenv
from google.adk.agents import LlmAgent
from agents.vaidya_agent.agent import vaidya_agent
from agents.sahayak_agent.agent import sahayak_agent
from agents.vyapari_agent.agent import vyapari_agent
from agents.shikshak_agent.agent import shikshak_agent

# Load environment variables
load_dotenv()

root_agent = LlmAgent(
    name="Mitra",
    model=os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash-exp"),
    description=(
        "A friendly AI assistant that helps Indian farmers by answering their "
        "questions about farming."
    ),
    instruction=(
        "You are Mitra, an AI assistant for Indian farmers. "
        "Answer farming questions directly and practically. "
        "For crop diseases, use Vaidya agent. "
        "For market prices and weather, use Vyapari agent. "
        "For government schemes and education, use Sahayak agent. "
        "For video content, use Shikshak agent. "
        "Always provide helpful, actionable advice."
    ),
    sub_agents=[
        vaidya_agent, 
        sahayak_agent, 
        vyapari_agent, 
        shikshak_agent
    ]
)