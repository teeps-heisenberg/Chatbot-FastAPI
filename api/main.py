from dotenv import load_dotenv
import os
import logging
import time
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (including frontend.html) from the project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=project_root), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(project_root, "frontend.html"))

# Method 1: Read API key with better error handling and debugging
def get_api_key():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_GENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "API key not found. Please set one of these environment variables:\n"
            "- GEMINI_API_KEY\n"
            "- GOOGLE_API_KEY\n"
            "- GOOGLE_GENAI_API_KEY"
        )
    return api_key

# Get API key with better error handling
try:
    api_key = get_api_key()
    logger.info(f"API key found: {api_key[:10]}...")
    client = genai.Client(api_key=api_key)
    logger.info("✅ Gemini client initialized successfully")
except ValueError as e:
    logger.error(f"❌ API Key Error: {e}")
    client = None
except Exception as e:
    logger.error(f"❌ Unexpected error initializing Gemini client: {e}")
    client = None

class ChatRequest(BaseModel):
    user_message: str
    language: str = "Python"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    logger.info(f"Received chat request: {request.user_message[:50]}...")
    
    if client is None:
        logger.error("Gemini client not initialized")
        raise HTTPException(
            status_code=500, 
            detail="Gemini client not initialized. Please check your API key configuration."
        )
    
    user_prompt = (
        f"{request.user_message + " Use this coding language if this involves coding: " + request.language}"
    )
    system_prompt = (
    "You are BlueBot, an expert coding and technology assistant. "
    "You strictly answer only programming, coding, or technology-related questions. "
    "If a user asks a non-tech question, politely reply: "
    "'Sorry, I can only answer programming, coding, or technology-related questions.' "
    "When answering coding questions, always use the user's selected programming language if provided, "
    "otherwise default to Python. Format code using markdown. "
    "Be concise, clear, and helpful."
)
    
    try:
        logger.info("Making request to Gemini API...")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
                max_output_tokens=2048,
            ),
            contents=user_prompt
        )
        
        elapsed_time = time.time() - start_time
        logger.info(f"Gemini API response received in {elapsed_time:.2f}s")
        
        if response.text:
            return {"response": response.text}
        else:
            logger.error("Empty response from Gemini API")
            raise HTTPException(status_code=500, detail="Empty response from Gemini API")
            
    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"Gemini API Error after {elapsed_time:.2f}s: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_client_ready": client is not None,
        "api_key_configured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_GENAI_API_KEY"))
    }

# Test endpoint to check API key and basic functionality
@app.get("/test")
def test_endpoint():
    try:
        # Check if API key is set
        api_key = get_api_key()
        api_key_status = f"API key found: {api_key[:10]}..." if api_key else "No API key found"
        
        # Test basic Gemini call
        if client:
            test_response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents="Say 'Hello World' in one word."
            )
            test_result = test_response.text if test_response.text else "Empty response"
        else:
            test_result = "Client not initialized"
            
        return {
            "api_key_status": api_key_status,
            "client_ready": client is not None,
            "test_response": test_result,
            "environment_vars": {
                "GEMINI_API_KEY": "Set" if os.getenv("GEMINI_API_KEY") else "Not set",
                "GOOGLE_API_KEY": "Set" if os.getenv("GOOGLE_API_KEY") else "Not set",
                "GOOGLE_GENAI_API_KEY": "Set" if os.getenv("GOOGLE_GENAI_API_KEY") else "Not set"
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "api_key_status": "Error checking API key",
            "client_ready": client is not None
        }