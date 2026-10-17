"""Settings read from the environment (chapter 06).

Every setting has a SHELF_ prefix, for example SHELF_DATABASE_URL. Secrets use SecretStr so they
never appear in logs or error messages by accident.
"""

from functools import lru_cache
from typing import Literal, Self

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_API_KEY = "dev-key-change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHELF_", env_file=".env", extra="ignore")

    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "sqlite:///./shelf.db"
    api_key: SecretStr = SecretStr(DEV_API_KEY)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    @model_validator(mode="after")
    def refuse_dev_key_in_production(self) -> Self:
        if self.environment == "production" and self.api_key.get_secret_value() == DEV_API_KEY:
            raise ValueError("SHELF_API_KEY must be set to a real secret in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
