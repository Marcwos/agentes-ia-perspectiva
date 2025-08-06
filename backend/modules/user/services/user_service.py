from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..model.user_model import UserModel
from ..schemas import UserResponseSchema, UsersResponseSchema


class UserService:
    def __init__(self):
        pass

    def get_user_by_id(self, user_id: int, db: Session) -> UserResponseSchema:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return UserResponseSchema(id=user.id, email=user.email)

    def get_all_users(self, db: Session) -> UsersResponseSchema:
        users = db.query(UserModel).all()
        return UsersResponseSchema(users=[UserResponseSchema(id=user.id, email=user.email) for user in users])