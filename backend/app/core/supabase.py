from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured")

    if not settings.supabase_key:
        raise RuntimeError("SUPABASE_KEY is not configured")

    return create_client(settings.supabase_url, settings.supabase_key)