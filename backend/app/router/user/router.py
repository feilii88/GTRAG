from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth  
from starlette.config import Config
from sqlalchemy.orm.exc import NoResultFound
from uuid import UUID
from sqlmodel import Session
from authlib.integrations.starlette_client import OAuth
from httpx import AsyncClient
from json_repair import repair_json
import json
import random

from app.database.config import get_db_session
from app.database.user.service import UserService
from app.database.user.model import UserCreate, UserModel, UserUpdate
from app.util.auth import AuthUtil
from app.router.user.schema import LoginRequestModel
from app.service.mailer_send import MailerSend
from app.service.otp import OTP
from .dependency import get_current_user
from app.config import constants

router = APIRouter(prefix="/user", tags=["Users"])

@router.get("/")
async def get_users(db_session=Depends(get_db_session)):
    """
    Endpoint to retrieve a list of users.

    This function uses a dependency to get a database session and then
    calls the UserService to fetch all users from the database. It 
    returns the list of users if available, otherwise an empty list.

    Args:
    db_session: Database session dependency, provided by the get_db_session function.

    Returns:
    A list of user objects or an empty list if no users are found.
    """ 
    user_service = UserService(db_session=db_session)
    result = await user_service.get_users()
    if not result:
        return []
    return result

@router.post("/add-user", response_model=UserModel)
async def add_user(
    user: UserCreate,
    db_session = Depends(get_db_session)
):
    """
    Endpoint to add a new user.

    This function receives a UserCreate object, creates a UserModel
    instance, and adds it to the database using the UserService.

    Args:
    user: UserCreate object containing the new user details.
    db_session: Database session dependency, provided by the get_db_session function.

    Returns:
    The newly added UserModel object.
    """
    user_service = UserService(db_session=db_session)
    verify_code = random.randint(100000, 999999)
    new_user = UserModel(
        email=user.email,
        status="pending",
        verify_code=str(verify_code),
        password=user.password  # Password hashing should be done separately for security reasons
    )
    added_user = await user_service.add_user(new_user)
    if added_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered"
        )
    
    mailer_send = MailerSend()
    mailer_send.signup_mailer(user.email, verify_code)

    return added_user

@router.put("/{user_id}", response_model=UserModel)
async def update_user(
    user_id: int,
    user: UserUpdate,
    db_session = Depends(get_db_session)
):  
    """
    Endpoint to update an existing user.

    This function receives a UserUpdate object along with a user_id,
    retrieves the existing user from the database, updates the fields,
    and then saves the updated user using the UserService.

    Args:
    user_id: The ID of the user to be updated.
    user: UserUpdate object containing the user update details.
    db_session: Database session dependency, provided by the get_db_session function.

    Returns:
    The updated UserModel object, or raises an HTTPException if the user is not found or update fails.
    """
    user_service = UserService(db_session=db_session)
    existing_user = await user_service.get_users(uuid=user_id)# Assuming this method can handle filtering by ID

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    existing_user = existing_user[0]
    existing_user.email = user.email or existing_user.email
    existing_user.status = user.status or existing_user.status
    existing_user.password = user.password or existing_user.password  # Password hashing should be done separately

    updated = await user_service.update_user(existing_user)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user"
        )

    return existing_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db_session = Depends(get_db_session)
):  
    """
    Endpoint to delete an existing user.

    This function receives a user_id, retrieves the user from the
    database, and then deletes it using the UserService.

    Args:
    user_id: The UUID of the user to be deleted.
    db_session: Database session dependency, provided by the get_db_session function.

    Returns:
    HTTP 204 No Content status code if successful, or raises an HTTPException if the user is not found or deletion fails.
    """
    user_service = UserService(db_session=db_session)
    existing_user = await user_service.get_users(uuid=user_id)

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    try:  
        await user_service.delete_user(existing_user[0].uuid)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete user"
        )

    return None

@router.post("/login")
async def login(login_request: LoginRequestModel, request: Request, db_session: Session = Depends(get_db_session)):
    """
    Endpoint for user login and token generation.

    This function verifies the user credentials and returns an access token.

    Args:
    login_request: LoginRequestModel containing the user credentials: email, password.
    db_session: Database session dependency, provided by the get_db_session function.

    Returns:
    A dictionary containing the access token and token type, or raises an HTTPException if credentials are invalid.
    """
    user_service = UserService(db_session=db_session)
    user = await user_service.verify_user(email=login_request.email, password=login_request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=constants.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthUtil.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/protected-route", dependencies=[Depends(get_current_user)])
async def protected_route():
    """
    Endpoint for a protected route.

    This function demonstrates an endpoint that requires user authentication
    by ensuring the current user is successfully retrieved by the get_current_user dependency.

    Returns:
    A dictionary with a message indicating that this is a protected route.
    """
    return {"message": "This is a protected route"}



# Read environment variables  
GOOGLE_CLIENT_ID = constants.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = constants.GOOGLE_CLIENT_SECRET

# Configure FastAPI and OAuth  
config_data = {'GOOGLE_CLIENT_ID': GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_SECRET': GOOGLE_CLIENT_SECRET}
starlette_config = Config(environ=config_data)
oauth = OAuth(starlette_config)
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

@router.get("/google/login")
async def login(request: Request):
    # redirect_uri = 'http://localhost:8000/api/user/google/callback'
    # return await oauth.google.authorize_redirect(request, redirect_uri)
    REDIRECT_URI = f"{constants.FRONTEND_URL}login/callback"
    google_auth_url = (  
        f"https://accounts.google.com/o/oauth2/v2/auth?"  
        f"response_type=code&client_id={GOOGLE_CLIENT_ID}&"  
        f"redirect_uri={REDIRECT_URI}&scope=openid email profile"  
    )  
    return {"auth_url": google_auth_url}

@router.get("/google/callback")
async def auth_callback(code: str):
    # access_token = await oauth.google.authorize_access_token(request)

    # print(access_token)
    # request.session['user'] = dict(access_token['userinfo'])
    # request.session['id_token'] = access_token['id_token']
    # return RedirectResponse(url="http://localhost:3000/login")
    REDIRECT_URI = f"{constants.FRONTEND_URL}login/callback"
    token_url = "https://oauth2.googleapis.com/token"  
    token_data = {  
        "code": code,  
        "client_id": GOOGLE_CLIENT_ID,  
        "client_secret": GOOGLE_CLIENT_SECRET,  
        "redirect_uri": REDIRECT_URI,  
        "grant_type": "authorization_code",  
    }  
    client = AsyncClient()
    token_response = await client.post(token_url, data=token_data)  
    token_json = token_response.json()  
    token_data = json.loads(repair_json(str(token_json)))

    if "id_token" not in token_data:  
        raise HTTPException(status_code=400, detail="Invalid token response")  
    
    id_token = token_json["id_token"]  

    return {"id_token": id_token}  

@router.post("/verifyEmail")
async def verify_email(email: str, token: str, db_session: Session = Depends(get_db_session)):
    user_service = UserService(db_session=db_session)
    existing_user = await user_service.get_user_by_email(email)

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if existing_user.verify_code == token:
        existing_user.status = "verified"
        updated = await user_service.update_user(existing_user)

        return updated
