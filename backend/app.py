import os
import uuid
import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import config
from models import (
    FarmerCreate, FarmerResponse, UserQueryRequest, UserQueryResponse,
    ErrorResponse, APIResponse
)
from agents.agent import root_agent
from pydantic import ValidationError

# ADK imports for proper agent invocation
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types


def create_app(config_name='development'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    CORS(app)
    
    # Initialize Firebase
    # initialize_firebase()
    
    # Setup Google AI/Vertex AI environment variables for ADK
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "woven-hangar-466817-m1")
    location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    credentials_file = "woven-hangar-466817-m1-909162431659.json"
    
    # Make credentials path absolute
    credentials_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), credentials_file))
    
    # Set the required environment variables for ADK
    os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
    os.environ["GOOGLE_CLOUD_LOCATION"] = location
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
    
    # Set additional environment variables that might be needed
    os.environ["VERTEX_AI_PROJECT"] = project_id
    os.environ["VERTEX_AI_LOCATION"] = location
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
    
    # Initialize Google AI client explicitly
    try:
        from google.cloud import aiplatform
        
        # Initialize Vertex AI
        aiplatform.init(
            project=project_id,
            location=location,
            credentials=credentials_path
        )
        print("DEBUG: Vertex AI initialized successfully")
    except Exception as e:
        print(f"DEBUG: Vertex AI initialization error: {e}")
    
    # Verify credentials file exists
    if not os.path.exists(credentials_path):
        print(f"ERROR: Credentials file not found at: {credentials_path}")
    else:
        print(f"DEBUG: Credentials file found at: {credentials_path}")
    
    # Debug: Check environment variables
    print(f"DEBUG: GEMINI_MODEL_NAME = {os.getenv('GEMINI_MODEL_NAME')}")
    print(f"DEBUG: GOOGLE_CLOUD_PROJECT = {os.environ.get('GOOGLE_CLOUD_PROJECT')}")
    print(f"DEBUG: GOOGLE_CLOUD_LOCATION = {os.environ.get('GOOGLE_CLOUD_LOCATION')}")
    print(f"DEBUG: GOOGLE_APPLICATION_CREDENTIALS = {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
    
    # Initialize ADK Session Service and Runner
    APP_NAME = "fasal_mitra_kisan"
    
    session_service = InMemorySessionService()
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    @app.route('/')
    def hello_world():
        """Basic health check endpoint."""
        return jsonify({"message": "Hello from Fasal Mitra Backend!"})

    @app.route('/api/health')
    def health_check():
        """Health check endpoint."""
        return jsonify({"status": "healthy", "service": "fasal-mitra-backend"})

    
    @app.route('/api/registerFarmer', methods=['POST'])
    def register_farmer():
        """Register a new farmer in Firestore"""
        try:
            # Validate request data using Pydantic
            data = request.get_json()
            if not data:
                error_response = ErrorResponse(
                    error="Request body is required",
                    status="error"
                )
                return jsonify(error_response.dict()), 400
            
            # Parse and validate farmer data
            farmer_create = FarmerCreate(**data)
            
            # Create farmer response object
            farmer_response = FarmerResponse.from_farmer_create(farmer_create)
            
            # Store in Firestore
            # TODO:: UNcomment
            # saved_farmer = register_farmer_in_db(farmer_response)
            
            # Return success response
            api_response = APIResponse(
                message="Farmer registered successfully",
                status="success",
                data={
                    "farmer_id": "1234",
                    "farmer_data": farmer_response.dict()
                }
            )
            return jsonify(api_response.dict()), 201
            
        except ValidationError as e:
            error_response = ErrorResponse(
                error=f"Validation error: {str(e)}",
                status="error"
            )
            return jsonify(error_response.dict()), 400
            
        except Exception as e:
            error_response = ErrorResponse(
                error=f"Registration failed: {str(e)}",
                status="error"
            )
            return jsonify(error_response.dict()), 500

    @app.route('/api/getUserQueryResponse', methods=['POST'])
    def get_user_query_response():
        """Process user query using Mitra multi-agent system."""
        try:
            # Validate request data
            query_request = UserQueryRequest(**request.json)
            
            # Get the user's actual question
            if query_request.text_input:
                user_question = query_request.text_input
            elif query_request.voice_input_text:
                user_question = query_request.voice_input_text
            else:
                user_question = "I need farming advice"
            
            # Debug: Print the actual question being sent
            print(f"DEBUG: User question: {user_question}")
            
            # Create unique session for this query
            import time
            unique_session_id = f"session_{int(time.time())}_{query_request.farmer_id[:8]}"
            user_id = query_request.farmer_id
            
            # Create the session for this specific query
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=unique_session_id
            ))
            loop.close()
            
            # Convert user question to proper Content format
            new_message = types.Content(
                parts=[types.Part(text=user_question)]
            )
            
            # Run the agent and collect the response
            events = list(runner.run(
                user_id=user_id,
                session_id=unique_session_id,
                new_message=new_message
            ))
            
            # Extract the response from the events
            response_text = "No response received from agent"
            
            # Look for the actual response in the events
            for event in events:
                if hasattr(event, 'content') and event.content:
                    if hasattr(event.content, 'parts') and event.content.parts:
                        for part in event.content.parts:
                            if hasattr(part, 'text') and part.text:
                                # Skip system messages and look for actual responses
                                if not part.text.startswith("You are") and not part.text.startswith("I am"):
                                    response_text = part.text
                                    break
                        if response_text != "No response received from agent":
                            break
            
            # If no proper response found, use the last event
            if response_text == "No response received from agent" and events:
                last_event = events[-1]
                response_text = str(last_event)
            
            print(f"DEBUG: Agent response: {response_text}")
            
            # Create response object
            query_response = UserQueryResponse(
                text_response=str(response_text),
                voice_response_text=str(response_text),  # Same as text for now
                native_language=query_request.native_language or 'Kannada',
                query_id=str(uuid.uuid4()),
                image_response=None,
                image_responses=None
            )
            
            return jsonify(query_response.dict()), 200
            
        except ValueError as e:
            error_response = ErrorResponse(
                error=f"Validation error: {str(e)}",
                status="error"
            )
            return jsonify(error_response.dict()), 400
            
        except Exception as e:
            error_response = ErrorResponse(
                error=f"Query processing failed: {str(e)}",
                status="error"
            )
            return jsonify(error_response.dict()), 500

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 3005))
    app.run(host='0.0.0.0', port=port, debug=True) 