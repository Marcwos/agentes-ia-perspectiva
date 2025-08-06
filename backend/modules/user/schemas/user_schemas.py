from pydantic import BaseModel
from typing import List


class UserBaseSchema(BaseModel):
    email: str
    
    
class UserCreateSchema(UserBaseSchema):
    password: str
    
    
class UserResponseSchema(BaseModel):
    id: int
    email: str
    
    class Config:
        from_attributes = True
    
    
class UsersResponseSchema(BaseModel):
    users: List[UserResponseSchema]
    
    
class LoginUserSchema(UserBaseSchema):
    access_token: str
