from pydantic_settings import BaseSettings
from typing import List
import os

enviroment = os.environ.get("ENVIRONMENT", "dev")


class AppSettings(BaseSettings):
    app_name: str = "Proyecto Agentes"
    environment: str = "dev"
    debug: bool = True

    # CORS - using default values for now
    allowed_origins: List[str] = [
        "http://localhost:4200", 
        "http://127.0.0.1:4200", 
        "http://localhost:3000",
        "https://frontagentexam-585785395737.europe-west1.run.app"
    ]
    
    class Config:
        env_file = f"core/envs/.app.{enviroment}.env"

