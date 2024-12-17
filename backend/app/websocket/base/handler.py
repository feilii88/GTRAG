from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Type

from app.util.connection_manager import ConnectionManager


class BaseWebSocketHandler:  
    
    def __init__(self, model: Type[BaseModel], **kwargs):  
        self.manager = ConnectionManager()  
        self.model = model  
        self.user: dict = None
        self.connected = False

    async def connect(self, websocket: WebSocket):  
        await self.manager.connect(websocket)  
        self.connected = True  
    
    async def disconnect(self, websocket: WebSocket):  
        if self.connected:  
            await self.manager.disconnect(websocket)  
            self.connected = False  

    async def send_model(self, message: BaseModel, websocket: WebSocket):  
        try:  
            if self.connected:  
                await websocket.send_json(message.model_dump())  
            else:  
                print("Attempted to send a message on a closed WebSocket connection.")  
        except WebSocketDisconnect:  
            print("WebSocket is disconnected, failed to send message.")  
            self.connected = False  

    async def handle_message(self, message, websocket: WebSocket):  
        raise NotImplemented("Override this")
    
    async def handle_call(self, websocket: WebSocket, **kwargs):  
        """  
        A method to handle the specific logic for different WebSocket endpoints.  
        To be overridden by subclasses if needed.  
        """
        
        await self.connect(websocket)            
    
        try:
            while self.connected:
                
                data = await websocket.receive_json()
                obj = self.model(**data)  
                await self.handle_message(message=obj, websocket=websocket, **kwargs)
        except WebSocketDisconnect as e:
            print(f"WebSocket disconnected with code: {e.code}")
        except Exception as e:  
            print(f"Error occurred: {e}")
            self.disconnect(websocket)

    async def __call__(self, websocket: WebSocket, **kwargs):  
        """  
        Default implementation of handling the call. Subclasses can override this  
        method to provide custom parameter handling logic.  
        """  
        await self.handle_call(websocket, **kwargs)    