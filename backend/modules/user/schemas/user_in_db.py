from pydantic import BaseModel

class UserInDB(BaseModel):
    id: int
    email: str
    hashed_password: str
    
    class Config:
        from_attributes = True
