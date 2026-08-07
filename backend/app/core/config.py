from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI-Native Operations Platform"
    app_version: str = "1.0.0"
    app_env: str = "development"

    debug: bool = True

    database_url: str = ""

    supabase_url: str = ""
    supabase_key: str = ""

    jwt_secret_key: str = "dev_secret_key_change_in_production_123456789"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15

    def validate_supabase_config(self) -> None:
        if self.supabase_url and not self.supabase_key:
            raise ValueError("SUPABASE_KEY is missing while SUPABASE_URL is set")

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
settings.validate_supabase_config()
