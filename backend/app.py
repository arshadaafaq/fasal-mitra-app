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
    os.environ["VERTEX_AI_PROJECT"] = project_id
    os.environ["VERTEX_AI_LOCATION"] = location
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
    
    # Initialize Google AI client
    try:
        from google.cloud import aiplatform
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
            
            print(f"DEBUG: Processing question: {user_question}")
            
            # Create unique session for each query
            unique_session_id = f"session_{uuid.uuid4()}"
            user_id = query_request.farmer_id or str(uuid.uuid4())
            
            # Run async operations
            async def run_agent_async():
                # Create a new session
                await session_service.create_session(
                    app_name=APP_NAME,
                    user_id=user_id,
                    session_id=unique_session_id
                )
                
                # Create the message content
                new_message = types.Content(
                    parts=[types.Part(text=user_question)]
                )
                
                print(f"DEBUG: Sending to agent: {user_question}")
                
                # Collect all events from the agent
                all_events = []
                try:
                    async for event in runner.run_async(
                        user_id=user_id,
                        session_id=unique_session_id,
                        new_message=new_message
                    ):
                        all_events.append(event)
                        
                        # Log the response
                        if hasattr(event, 'content') and event.content:
                            if hasattr(event.content, 'parts'):
                                for part in event.content.parts:
                                    if hasattr(part, 'text'):
                                        print(f"DEBUG: Agent response preview: {part.text[:100]}...")
                except Exception as e:
                    print(f"ERROR: Agent execution failed: {str(e)}")
                    raise
                
                return all_events
            
            # Execute the async function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                events = loop.run_until_complete(run_agent_async())
            finally:
                loop.close()
            
            print(f"DEBUG: Received {len(events)} events")
            
            # Extract the response
            response_text = None
            
            # Look for the actual response in events
            for event in events:
                if hasattr(event, 'content') and event.content:
                    if hasattr(event.content, 'parts') and event.content.parts:
                        for part in event.content.parts:
                            if hasattr(part, 'text') and part.text:
                                text = part.text.strip()
                                # Skip empty responses
                                if text:
                                    response_text = text
                                    break
                    if response_text:
                        break
            
            # Fallback if no response
            if not response_text:
                response_text = "I apologize, but I couldn't process your query. Please try again."
            
            print(f"DEBUG: Final response length: {len(response_text)} characters")
            
            # Create response object
            query_response = UserQueryResponse(
                text_response=response_text,
                voice_response_text=response_text,
                native_language=query_request.native_language or 'Kannada',
                query_id=str(uuid.uuid4()),
                image_response=None,
                image_responses=None
            )
            
            return jsonify(query_response.dict()), 200
            
        except Exception as e:
            print(f"ERROR: Exception in query processing: {str(e)}")
            import traceback
            traceback.print_exc()
            
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
