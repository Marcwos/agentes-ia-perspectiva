import logging
from typing import Tuple
from fastapi import Depends, HTTPException, status
import jwt
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from .token_service import TokenService
from modules.user.schemas import UserCreateSchema, UserResponseSchema, UserInDB
from modules.user.model.user_model import UserModel
from db.database import get_db
from core.config import settings
from ..schemas import TokenData, Token, LoginResponseSchema, LogoutResponseSchema


CRENDENTIAL_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

class AuthService:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
    token_service = TokenService()

    def __init__(self):
        pass

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def get_current_user(self, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        try:
            payload = self.token_service.decode_token(token)
            email: str = payload.get("sub")
            if email is None:
                raise CRENDENTIAL_EXCEPTION
            token_data = TokenData(email=email)
        except InvalidTokenError:
            raise CRENDENTIAL_EXCEPTION
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
            )

        user = db.query(UserModel).filter(UserModel.email == email).first()
        if user is None:
            raise CRENDENTIAL_EXCEPTION
        return user

    def register_user(self, user: UserCreateSchema, db: Session = Depends(get_db)) -> UserResponseSchema:
        found_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if found_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
            )
        hashed_password = self.get_password_hash(user.password)
        
        # Crear nuevo usuario
        db_user = UserModel(
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return UserResponseSchema(id=db_user.id, email=db_user.email)

    def authenticate_user(self, email: str, password: str, db: Session):
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            return False
        if not self.verify_password(password, user.hashed_password):
            return False
        return user

    def login_user(self, user: UserCreateSchema, db: Session = Depends(get_db)) -> LoginResponseSchema:
        logger.info(f"Intentando login para usuario: {user.email}")
        authenticated_user = self.authenticate_user(user.email, user.password, db)
        if not authenticated_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )
        
        # Crear token de acceso incluyendo el ID del usuario
        access_expiration = timedelta(minutes=settings.jwt.jwt_expiration_minutes)
        access_token = self.token_service.create_access_token(
            data={
                "sub": authenticated_user.email,
                "user_id": str(authenticated_user.id),  # Incluir ID en el token
                "email": authenticated_user.email
            }, 
            expires_delta=access_expiration
        )

        token_obj = Token(access_token=access_token, token_type="bearer")

        # Crear respuesta del usuario incluyendo el ID
        user_response = UserResponseSchema(id=authenticated_user.id, email=authenticated_user.email)
        
        logger.info(f"Login exitoso para usuario: {authenticated_user.email} con ID: {authenticated_user.id}")

        return LoginResponseSchema(
            access_token=token_obj, user=user_response
        )

    def logout_user(self, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        """
        Logout del usuario.
        En este caso, como estamos usando JWT stateless, simplemente validamos el token
        y devolvemos un mensaje de éxito. El cliente debe eliminar el token.
        
        Para una implementación más segura, se podría implementar una blacklist de tokens.
        """
        try:
            # Validar que el token sea válido
            payload = self.token_service.decode_token(token)
            email: str = payload.get("sub")
            if email is None:
                raise CRENDENTIAL_EXCEPTION
            
            # Verificar que el usuario exista
            user = db.query(UserModel).filter(UserModel.email == email).first()
            if user is None:
                raise CRENDENTIAL_EXCEPTION
                
            logger.info(f"Usuario {email} ha cerrado sesión exitosamente")
            
            return {
                "message": "Logout successful",
                "detail": "Session closed successfully. Please remove the token from client."
            }
            
        except InvalidTokenError:
            raise CRENDENTIAL_EXCEPTION
        except jwt.ExpiredSignatureError:
            # Si el token ya expiró, consideramos el logout como exitoso
            return {
                "message": "Logout successful",
                "detail": "Token was already expired."
            }