from fastapi import WebSocket, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.config import get_db_session
from app.websocket.base import BaseWebSocketHandler
from app.router.file.schema import ChatRequest
from app.service.pdf_assistant import PDFAssistant

class ChatSocketHandler(BaseWebSocketHandler):
    
    def __init__(self):
        super().__init__(ChatRequest)
        self.config = {}
        
    async def handle_message(self, message: ChatRequest, websocket: WebSocket):
        pdf_assistant = PDFAssistant()
        answer_ended = False
        async for chunk in pdf_assistant.async_assistant_chat(content=message.content, thread_id=message.thread_id, assistant_id=message.assistant_id):
            if "*****" in chunk:
                answer_ended = True
            elif not "【" in chunk:
                if answer_ended:
                    await websocket.send_json({
                        "type": "citation",
                        "content": chunk
                    })
                else:
                    await websocket.send_json({
                        "type": "answer",
                        "content": chunk
                    })
        await websocket.send_json({
            "type": "end"
        })

    async def __call__(
        self,
        websocket: WebSocket,
        db_session: AsyncSession = Depends(get_db_session)
    ):
        """
        session_id (str): session id of the chat 
        """
    
        self.agent_db_session = db_session
        await self.handle_call(websocket)