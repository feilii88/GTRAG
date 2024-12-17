import os
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.database.config import get_db_session
from app.config import constants
from app.database.session.model import SessionModel
from app.database.session.service import SessionService
from app.service.pdf_assistant import PDFAssistant
from app.router.file.schema import ChatRequest, FileUploadResponse, NewSessionRequest, ProcessRequest, ProcessResponse

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/upload", response_model=FileUploadResponse)
async def upload_files(
    files: List[UploadFile] = File(...),
    db_session=Depends(get_db_session)):
    """
    Endpoint to upload Files.

    Args:
    files: List of uploaded files.
    db_session: Database session dependency, provided by the get_db_session function.

    Returns:
    Session id: Current session id
    """ 
    if not os.path.exists("./static/files"):  
        os.makedirs("./static/files")
    
    filepaths = []

    for file in files:
        filepaths.append(f"./static/files/{file.filename}")
        with open("./static/files/" + file.filename, "wb") as f:
            contents = await file.read()  
            f.write(contents)

    pdf_assistant = PDFAssistant()
    session_id = pdf_assistant.get_vector_store_id()
    assistant_id = pdf_assistant.get_assistant_id(session_id)

    session_service = SessionService(db_session=db_session)
    new_session = SessionModel(
        session_id=session_id,
        files="~`".join(filepaths)
    )
    await session_service.add_session(new_session)
 
    response = FileUploadResponse(assistant_id=assistant_id, session_id=session_id)
    return response

@router.post("/process", response_model=ProcessResponse)
async def process_files(
    request_body: ProcessRequest,
    db_session=Depends(get_db_session)):
    """  
    Endpoint to process files based on a session ID.  

    Args:  
    session_id: Optional session ID to identify the session context for processing files. If not provided, defaults to "".  
    db_session: Database session dependency, provided by the get_db_session function.  

    Returns:  
    thread_id: Status message indicating the success or failure of the file processing.
    """ 
    session_service = SessionService(db_session=db_session)
    session_record = await session_service.get_session_by_id(session_id=request_body.session_id)

    if not session_record:
        raise HTTPException(status_code=404, detail=f"Session with id {request_body.session_id} not found")
    
    pdf_assistant = PDFAssistant()
    pdf_assistant.upload_files(vector_store_id=request_body.session_id, filepaths=session_record.files.split("~`"))

    thread_id = pdf_assistant.get_thread_id()

    # questions = pdf_assistant.generate_questions(thread_id=thread_id, assistant_id=request_body.assistant_id)

    response = ProcessResponse(
        thread_id=thread_id
    )
    
    return response

@router.post("/chat")
def chat(chat_request: ChatRequest):
    pdf_assistant = PDFAssistant()
    return pdf_assistant.assistant_chat(chat_request.content, chat_request.thread_id, chat_request.assistant_id)

@router.post("/new-session")
def new_session(new_session_request: NewSessionRequest):
    pdf_assistant = PDFAssistant()

    if new_session_request.assistant_id:
        pdf_assistant.delete_assistant(new_session_request.assistant_id)
    if new_session_request.session_id:
        pdf_assistant.delete_vector_store(new_session_request.session_id)
    
    return "success"

@router.post("/clear-history/{thread_id}")
def clear_history(thread_id: str):
    pdf_assistant = PDFAssistant()

    if thread_id:
        pdf_assistant.delete_thread(thread_id=thread_id)

    return pdf_assistant.get_thread_id()

@router.post("/generate-questions")
def generate_questions(request_body: NewSessionRequest):
    pdf_assistant = PDFAssistant()
    thread_id = pdf_assistant.get_thread_id()
    questions = pdf_assistant.generate_questions(thread_id=thread_id, assistant_id=request_body.assistant_id)
    pdf_assistant.delete_thread(thread_id=thread_id)
    
    return questions