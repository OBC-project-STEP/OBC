from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_path: str = "obc_users.db"
    jwt_secret: str = "change-me-in-production-use-long-random-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    password_reset_expire_minutes: int = 30
    frontend_url: str = "http://localhost:5173"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@obc.local"

    # Якщо в БД ще немає superadmin — створюється / підвищується цей акаунт (змініть у prod!)
    bootstrap_superadmin_email: str = "superadmin@example.com"
    bootstrap_superadmin_password: str = "superadmin123"


settings = Settings()
