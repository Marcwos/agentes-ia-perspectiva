from pydantic_settings import BaseSettings
import os

enviroment = os.environ.get("ENVIRONMENT", "dev")


class DatabaseSettings(BaseSettings):
    # SQLite/Database
    database_url: str = "sqlite:///./tmp/agents.db"
    db_name: str = "agentes_db"

    class Config:
        env_file = f"core/envs/.db.{enviroment}.env"
