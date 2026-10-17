import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageOperationError(Exception):
    """A Storage operation failed; details are intentionally kept out of API errors."""


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
                    logger.warning("Could not initialize Supabase client (%s).", type(exc).__name__)
        return self._client

    async def upload_file(
        self, storage_path: str, file_bytes: bytes, content_type: str
    ) -> str:
        client = self._get_client()
        if client is None:
            logger.error("Supabase client unavailable; attachment upload was not performed.")
            raise StorageOperationError("Attachment storage is unavailable.")

        path = storage_path.replace(f"{self.bucket_name}/", "")
        try:
            client.storage.from_(self.bucket_name).upload(
                file=file_bytes,
                path=path,
                file_options={"content-type": content_type, "upsert": "true"},
            )
        except Exception as exc:
            logger.error("Supabase attachment upload failed (%s).", type(exc).__name__)
            raise StorageOperationError("Attachment storage upload failed.") from exc
        return storage_path

    async def create_signed_url(self, storage_path: str, expires_in: int = 300) -> str:
        client = self._get_client()
        path = storage_path.replace(f"{self.bucket_name}/", "")
        if client is None:
            logger.error("Supabase client unavailable; signed URL was not created.")
            raise StorageOperationError("Attachment storage is unavailable.")

        try:
            res = client.storage.from_(self.bucket_name).create_signed_url(path, expires_in)
        except Exception as exc:
            logger.error("Supabase signed URL creation failed (%s).", type(exc).__name__)
            raise StorageOperationError("Attachment download is unavailable.") from exc
        if isinstance(res, dict) and "signedURL" in res:
            return res["signedURL"]
        if hasattr(res, "signed_url"):
            return res.signed_url
        if isinstance(res, str):
            return res
        logger.error("Supabase returned an unexpected signed URL response (%s).", type(res).__name__)
        raise StorageOperationError("Attachment download is unavailable.")

    async def delete_file(self, storage_path: str) -> None:
        client = self._get_client()
        if client is None:
            logger.error("Supabase client unavailable; attachment deletion was not performed.")
            raise StorageOperationError("Attachment storage is unavailable.")

        path = storage_path.replace(f"{self.bucket_name}/", "")
        try:
            client.storage.from_(self.bucket_name).remove([path])
        except Exception as exc:
            logger.error("Supabase attachment deletion failed (%s).", type(exc).__name__)
            raise StorageOperationError("Attachment storage deletion failed.") from exc


storage_client = SupabaseStorageClient()
