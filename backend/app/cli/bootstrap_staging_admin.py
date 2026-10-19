"""One-time, interactive bootstrap for the configured staging project only."""

from __future__ import annotations

import asyncio
import getpass
from urllib.parse import urlsplit

from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import func, select, text
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.enums.role import Role
from app.models.member import Member

STAGING_PROJECT_REF = "womtkmjxqltuthdetcvs"
BOOTSTRAP_REVISION = "9c72a4e1f6b3"


def validate_staging_target(app_env: str, supabase_url: str, database_url: str) -> None:
    """Fail closed unless both configured endpoints identify the approved stage."""
    if app_env.lower() != "staging":
        raise ValueError("Bootstrap is available only when APP_ENV is staging.")

    supabase_host = (urlsplit(supabase_url).hostname or "").lower()
    expected_host = f"{STAGING_PROJECT_REF}.supabase.co"
    if supabase_host != expected_host:
        raise ValueError("SUPABASE_URL does not identify the approved staging project.")

    try:
        database_user = make_url(database_url).username
    except Exception as exc:
        raise ValueError("DATABASE_URL could not be validated as the approved staging target.") from exc
    if database_user != f"postgres.{STAGING_PROJECT_REF}":
        raise ValueError("DATABASE_URL user does not identify the approved staging project pooler.")


async def _create_first_admin(email: str, full_name: str, password_hash: str) -> None:
    async with SessionLocal() as session, session.begin():
        # Serialize simultaneous invocations; only the first can observe
        # the empty table and create the bootstrap account.
        await session.execute(
            text("SELECT pg_advisory_xact_lock(hashtext(:lock_name))"),
            {"lock_name": "project-x-staging-first-admin-bootstrap"},
        )
        revision = await session.scalar(text("SELECT version_num FROM alembic_version"))
        if revision != BOOTSTRAP_REVISION:
            raise RuntimeError("Staging schema revision is not the expected revision.")

        member_count = await session.scalar(select(func.count()).select_from(Member))
        if member_count != 0:
            raise RuntimeError("Bootstrap requires an empty staging members table.")

        session.add(
            Member(
                email=email,
                full_name=full_name,
                organization_id=None,
                role=Role.SUPERADMIN,
                hashed_password=password_hash,
                approval_status="APPROVED",
                is_active=True,
            )
        )


async def main() -> None:
    validate_staging_target(settings.app_env, settings.supabase_url, settings.database_url)
    confirmation = input(f"Type {STAGING_PROJECT_REF} to confirm this staging project: ").strip()
    if confirmation != STAGING_PROJECT_REF:
        raise SystemExit("Project confirmation did not match; no account was created.")

    email_text = input("First admin email: ").strip()
    try:
        email = str(TypeAdapter(EmailStr).validate_python(email_text))
    except ValidationError as exc:
        raise SystemExit("Enter a valid email address; no account was created.") from exc
    full_name = input("First admin full name: ").strip()
    if not full_name or len(full_name) > 255:
        raise SystemExit("Full name must contain 1–255 characters; no account was created.")

    password = getpass.getpass("Set a staging admin password (12+ characters): ")
    password_confirmation = getpass.getpass("Confirm staging admin password: ")
    if len(password) < 12 or password != password_confirmation:
        raise SystemExit("Password confirmation failed or password is too short; no account was created.")

    await _create_first_admin(email, full_name, hash_password(password))
    print("Staging first-admin bootstrap completed. Sign in using the email entered above.")


if __name__ == "__main__":
    asyncio.run(main())
