from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from typing import Optional, List


class FarmerCreate(BaseModel):
    """Model for creating a new farmer"""
    farmer_name: str = Field(..., description="Farmer's name")
    state: str = Field(..., description="Farmer's state")
    city: str = Field(..., description="Farmer's city")
    contact_number: str = Field(..., description="Farmer's contact number")
    native_language: str = Field(..., description="Farmer's native language")

    class Config:
        schema_extra = {
            "example": {
                "farmer_name": "John Doe",
                "state": "Maharashtra",
                "city": "Mumbai",
                "contact_number": "+91-9876543210",
                "native_language": "Hindi"
            }
        }


class FarmerResponse(BaseModel):
    """Model for farmer response"""
    farmer_id: str = Field(..., description="Unique identifier for the farmer")
    farmer_name: str = Field(..., description="Farmer's name")
    state: str = Field(..., description="Farmer's state")
    city: str = Field(..., description="Farmer's city")
    contact_number: str = Field(..., description="Farmer's contact number")
    native_language: str = Field(..., description="Farmer's native language")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")

    @classmethod
    def from_farmer_create(cls, farmer_create: FarmerCreate) -> \
            'FarmerResponse':
        """Create FarmerResponse from FarmerCreate"""
        now = datetime.now().isoformat()
        return cls(
            farmer_id=str(uuid.uuid4()),
            farmer_name=farmer_create.farmer_name,
            state=farmer_create.state,
            city=farmer_create.city,
            contact_number=farmer_create.contact_number,
            native_language=farmer_create.native_language,
            created_at=now,
            updated_at=now
        )

    class Config:
        schema_extra = {
            "example": {
                "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
                "farmer_name": "John Doe",
                "state": "Maharashtra",
                "city": "Mumbai",
                "contact_number": "+91-9876543210",
                "native_language": "Hindi",
                "created_at": "2024-01-01T12:00:00",
                "updated_at": "2024-01-01T12:00:00"
            }
        }


class UserQueryRequest(BaseModel):
    """Model for user query request"""
    farmer_id: str = Field(..., description="Farmer's unique identifier")
    native_language: str = Field(..., description="Farmer's native language")
    text_input: Optional[str] = Field(None, description="Text input from user")
    voice_input_text: Optional[str] = Field(None, description="Voice input text")
    image_input: Optional[str] = Field(None, description="Base64 image")
    image_inputs: Optional[List[str]] = Field(None, description="List of base64 images")

    class Config:
        schema_extra = {
            "example": {
                "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
                "native_language": "Hindi",
                "text_input": "What's the weather like today?",
                "voice_input_text": None,
                "image_input": None,
                "image_inputs": None
            }
        }


class UserQueryResponse(BaseModel):
    """Model for user query response"""
    text_response: str = Field(..., description="Text response to the query")
    voice_response_text: str = Field(..., description="Voice response as text")
    image_response: Optional[str] = Field(None, description="Base64 encoded image response")
    image_responses: Optional[List[str]] = Field(None, description="List of base64 image responses")
    native_language: str = Field(..., description="Response in native language")
    query_id: str = Field(..., description="Unique identifier for the query")

    class Config:
        schema_extra = {
            "example": {
                "text_response": "The weather is sunny today with temperature around 30°C.",
                "voice_response_text": "The weather is sunny today with temperature around 30°C.",
                "image_response": "base64_encoded_image_data",
                "image_responses": ["base64_encoded_image_1", "base64_encoded_image_2"],
                "native_language": "आज मौसम धूप है और तापमान लगभग 30°C है।",
                "query_id": "query-12345"
            }
        }


class APIResponse(BaseModel):
    """Standard API response model"""
    message: str = Field(..., description="Response message")
    status: str = Field(..., description="Response status")
    data: Optional[dict] = Field(None, description="Response data")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    status: str = Field(..., description="Error status") 