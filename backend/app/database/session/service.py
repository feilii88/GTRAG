from typing import Optional
from sqlmodel import select
from sqlalchemy.exc import NoResultFound

from app.database.session.model import SessionModel
from app.database.base.service import BaseService

class SessionService(BaseService):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def add_session(self, session: SessionModel):
        existing_session = await self.get_session_by_id(session_id=session.session_id)
        if existing_session:
            return None
        await session.save(db_session=self.db_session)
        return session

    async def get_session_by_id(self, session_id: str) -> Optional[SessionModel]:  
        """  
        Retrieve a session record by its session ID.  

        Args:  
        session_id: ID of the session to retrieve.  

        Returns:  
        The session record if found; otherwise, None.  
        """  
        statement = select(SessionModel).where(SessionModel.session_id == session_id)  
        try:  
            result = await self.db_session.exec(statement)  
            session = result.one_or_none()  
            if session:  
                return session  
            return None  
        except NoResultFound:  
            return None  