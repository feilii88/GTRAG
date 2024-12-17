from fastapi import APIRouter

from .chat.router import websockets_router as chat_ws_router

# Initialize the main APIRouter
router = APIRouter()


# Include WebSocket routers with their respective prefixes and tags
router.include_router(chat_ws_router, prefix="/ws", tags=["WebSocket"])