from typing import Optional
from sqlmodel import Field
from app.database.base.model import BaseModel, TimeStampMixin


class UserModel(BaseModel, TimeStampMixin, table=True):
    """
    Represents a user in the database.

    Attributes:

        id: Primary key for the user.

        email: The email of the user.

        status: The status of the user.

        password: The password of the user.

    """

    __tablename__ = "users"
 
    email: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default=None)
    password: Optional[str] = Field(default=None)
    verify_code: Optional[str] = Field(default=None)

class UserCreate(BaseModel):
    email: str  # This ensures that the email is correctly formatted
    status: Optional[str] = "pending"
    verify_code: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None
    verify_code: Optional[str] = None