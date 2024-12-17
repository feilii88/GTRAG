from fastapi import Depends, FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from pathlib import Path

from app.router import user_router, chat_router
from app.websocket import router as websocket_router
from app.config import constants

# Create the FastAPI app
app = FastAPI()

origins = [  
    "http://gtrag.bot:3000",
    "http://gtrag.bot:8000",
    "https://gtrag.bot:3000",
    "https://gtrag.bot:8000",
    "http://localhost:3000",
    "http://localhost:8000",
]  

app.add_middleware(  
    CORSMiddleware,  
    allow_origins=["*"],  # List of allowed origins  
    allow_credentials=True,  # Allow cookies and authentication credentials  
    allow_methods=["*"],  # Allow all HTTP methods: 'GET', 'POST', 'PUT', 'DELETE', etc.  
    allow_headers=["*"],  # Allow all custom headers  
)

app.add_middleware(SessionMiddleware, secret_key=constants.SECRET_KEY)

static_path = Path("./static")  
if not static_path.exists():  
    static_path.mkdir(parents=True, exist_ok=True)
    
app.mount("/static", StaticFiles(directory="static"), name="static-images")  

app.include_router(user_router, prefix="/backend")
app.include_router(chat_router, prefix="/backend")
app.include_router(websocket_router, prefix="/backend")
