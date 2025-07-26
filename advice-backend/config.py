import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")  # Use regular key for backend
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY")  # Keep anon key for reference
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    API_URL: str = os.getenv("API_URL", "https://advice-production-d210.up.railway.app")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings() 