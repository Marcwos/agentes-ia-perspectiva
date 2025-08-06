from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .services.user_service import UserService
from .schemas import UserCreateSchema, UsersResponseSchema, UserResponseSchema
from db.database import get_db

users_router = APIRouter()
user_service = UserService()

@users_router.get("/{user_id}")
def get_user_by_id(user_id: int, db: Session = Depends(get_db)) -> UserResponseSchema:
    return user_service.get_user_by_id(user_id, db)

@users_router.get("/")
def get_all_users(db: Session = Depends(get_db)) -> UsersResponseSchema:
    return user_service.get_all_users(db)