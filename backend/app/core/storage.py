import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class SupabaseStorageClient:
    """Storage client wrapper for Supabase Storage operations."""

    def __init__(self) -> None:
        self.bucket_name = "expense-attachments"
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            if settings.supabase_url and settings.supabase_key:
                try:
                    from supabase import create_client
                    self._client = create_client(settings.supabase_url, settings.supabase_key)
                except Exception as exc:
                    logger.warning(f"Could not initialize Supabase client: {exc}")
        return self._client

    async def upload_file(
        self, storage_path: str, file_bytes: bytes, content_type: str
    ) -> str:
        client = self._get_client()
        if client:
            try:
                path = storage_path.replace(f"{self.bucket_name}/", "")
                client.storage.from_(self.bucket_name).upload(
                    file=file_bytes,
                    path=path,
                    file_options={"content-type": content_type, "upsert": "true"},
                )
                return storage_path
            except Exception as exc:
                logger.warning(f"Supabase upload warning: {exc}")
        return storage_path

    async def create_signed_url(self, storage_path: str, expires_in: int = 300) -> str:
        client = self._get_client()
        path = storage_path.replace(f"{self.bucket_name}/", "")
        if client:
            try:
                res = client.storage.from_(self.bucket_name).create_signed_url(path, expires_in)
                if isinstance(res, dict) and "signedURL" in res:
                    return res["signedURL"]
                if hasattr(res, "signed_url"):
                    return getattr(res, "signed_url")
                if isinstance(res, str):
                    return res
            except Exception as exc:
                logger.warning(f"Supabase create_signed_url warning: {exc}")

        # Local fallback signed URL for testing/dev environments
        return f"http://localhost:8000/api/v1/attachments/file-stream/{path}?expires_in={expires_in}"

    async def delete_file(self, storage_path: str) -> None:
        client = self._get_client()
        path = storage_path.replace(f"{self.bucket_name}/", "")
        if client:
            try:
                client.storage.from_(self.bucket_name).remove([path])
            except Exception as exc:
                logger.warning(f"Supabase delete_file warning: {exc}")


storage_client = SupabaseStorageClient()
