from pydantic_settings import BaseSettings, SettingsConfigDict

_DEV_JWT_SECRET_KEY = "dev_secret_key_change_in_production_123456789"


class Settings(BaseSettings):
    app_name: str = "AI-Native Operations Platform"
    app_version: str = "1.0.0"
    app_env: str = "development"

    debug: bool = True

    database_url: str = ""

    supabase_url: str = ""
    supabase_key: str = ""

    jwt_secret_key: str = _DEV_JWT_SECRET_KEY
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15

    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def validate_supabase_config(self) -> None:
        if self.supabase_url and not self.supabase_key:
            raise ValueError("SUPABASE_KEY is missing while SUPABASE_URL is set")

    def validate_jwt_secret(self) -> None:
        if self.app_env != "development" and self.jwt_secret_key == _DEV_JWT_SECRET_KEY:
            raise ValueError(
                "JWT_SECRET_KEY must be set to a real secret when APP_ENV is not 'development'."
            )

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
settings.validate_supabase_config()
settings.validate_jwt_secret()
