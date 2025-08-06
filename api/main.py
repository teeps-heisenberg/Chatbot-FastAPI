from dotenv import load_dotenv
import os
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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
    client = genai.Client(api_key=api_key)
    print("✅ Gemini client initialized successfully")
except ValueError as e:
    print(f"❌ API Key Error: {e}")
    # You can choose to exit or handle this differently
    client = None

class ChatRequest(BaseModel):
    user_message: str
    language: str = "Python"

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    if client is None:
        raise HTTPException(
            status_code=500, 
            detail="Gemini client not initialized. Please check your API key configuration."
        )
    
    user_prompt = (
        f"[Language: {request.language}]\n"
        f"{request.user_message}"
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
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_prompt
            ),
            contents=user_prompt
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_client_ready": client is not None
    }