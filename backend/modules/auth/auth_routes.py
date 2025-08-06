from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .services.auth_service import AuthService
from modules.user.schemas import UserCreateSchema, UserResponseSchema
from .schemas import LoginResponseSchema
from db.database import get_db

auth_router = APIRouter()
auth_service = AuthService()


@auth_router.post("/register")
def register_user(user: UserCreateSchema, db: Session = Depends(get_db)) -> UserResponseSchema:
    return auth_service.register_user(user, db)


@auth_router.post("/login")
def login_user(user: UserCreateSchema, db: Session = Depends(get_db)) -> LoginResponseSchema:
    return auth_service.login_user(user, db)


@auth_router.get("/me")
def current_user(token: str, db: Session = Depends(get_db)) -> UserResponseSchema:
    return auth_service.get_current_user(token, db)
