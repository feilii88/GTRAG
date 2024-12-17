from typing import List, Optional
from sqlmodel import Field
from app.database.base.model import BaseModel, TimeStampMixin


class SessionModel(BaseModel, TimeStampMixin, table=True):

    __tablename__ = "sessions"

    session_id: Optional[str] = Field(default=None)
    files: Optional[str] = Field(default=None)


class SessionCreate(BaseModel):  
    session_id: str
    files: str


class SessionUpdate(BaseModel):  
    session_id: Optional[str]  
    files: Optional[str]