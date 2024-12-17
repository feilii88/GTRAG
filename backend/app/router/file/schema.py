from typing import List
from pydantic import BaseModel

class ChatRequest(BaseModel):
    assistant_id: str
    session_id: str
    thread_id: str
    content: str

class NewSessionRequest(BaseModel):
    assistant_id: str
    session_id: str
    thread_id: str

class FileUploadResponse(BaseModel):
    assistant_id: str
    session_id: str

class ProcessRequest(BaseModel):
    assistant_id: str
    session_id: str

class ProcessResponse(BaseModel):
    thread_id: str
