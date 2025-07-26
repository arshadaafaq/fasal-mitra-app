"""
Weather Agent - Real-time Weather Data Specialist
Built with ADK framework for Project Kisan
"""

import os
import requests
from typing import Dict, Any
from dotenv import load_dotenv
from google.adk.agents import LlmAgent

# Load environment variables
load_dotenv()

WEATHERAPI_API_KEY = os.getenv("WEATHERAPI_API_KEY", "YOUR_WEATHERAPI_API_KEY")

# Tool: Get current weather using WeatherAPI.com Realtime API
def get_weather_forecast(location: str) -> Dict[str, Any]:
    """
    Fetches current weather for a given location using WeatherAPI.com Realtime API.
    Args:
        location: City name or lat,lon string
    Returns:
        Dict with current weather data or error message
    """
    url = f"https://api.weatherapi.com/v1/current.json?key={WEATHERAPI_API_KEY}&q={location}&aqi=no"
    resp = requests.get(url)
    if resp.status_code != 200 or not resp.json():
        return {"status": "error", "message": "Location not found or API error"}
    data = resp.json()
    if "current" not in data:
        return {"status": "error", "message": "No weather data found"}
    current = data["current"]
    condition = current.get("condition", {})
    return {
        "status": "success",
        "location": data.get("location", {}).get("name", location),
        "last_updated": current.get("last_updated"),
        "temp_c": current.get("temp_c"),
        "feelslike_c": current.get("feelslike_c"),
        "wind_kph": current.get("wind_kph"),
        "wind_dir": current.get("wind_dir"),
        "pressure_mb": current.get("pressure_mb"),
        "precip_mm": current.get("precip_mm"),
        "humidity": current.get("humidity"),
        "cloud": current.get("cloud"),
        "uv": current.get("uv"),
        "condition_text": condition.get("text"),
        "condition_icon": condition.get("icon"),
        "is_day": current.get("is_day"),
    }

weather_agent = LlmAgent(
    name="WeatherAgent",
    model=os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash"),
    description="Provides real-time weather forecasts using WeatherAPI.com.",
    instruction=(
        "You are WeatherAgent. Use the get_weather_forecast tool to answer weather questions for any location in India."
    ),
    tools=[get_weather_forecast]
) 