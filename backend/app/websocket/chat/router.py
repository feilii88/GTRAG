from fastapi import APIRouter
from .handlers import ChatSocketHandler


websockets_router = APIRouter(prefix="/chat")


chat_handler = ChatSocketHandler()
websockets_router.websocket("/msg")(chat_handler)