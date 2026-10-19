import pytest

from app.cli.bootstrap_staging_admin import STAGING_PROJECT_REF, validate_staging_target


def _staging_database_url(username: str) -> str:
    return f"postgresql+psycopg://{username}:placeholder@pooler.example:5432/postgres"


def test_staging_admin_bootstrap_accepts_only_expected_staging_target():
    validate_staging_target(
        "staging",
        f"https://{STAGING_PROJECT_REF}.supabase.co",
        _staging_database_url(f"postgres.{STAGING_PROJECT_REF}"),
    )


@pytest.mark.parametrize(
    ("app_env", "supabase_url", "database_url"),
    [
        ("production", f"https://{STAGING_PROJECT_REF}.supabase.co", _staging_database_url(f"postgres.{STAGING_PROJECT_REF}")),
        ("staging", "https://production.supabase.co", _staging_database_url(f"postgres.{STAGING_PROJECT_REF}")),
        ("staging", f"https://{STAGING_PROJECT_REF}.supabase.co", _staging_database_url("postgres.productionref")),
        ("staging", f"https://{STAGING_PROJECT_REF}.supabase.co", "not-a-database-url"),
    ],
)
def test_staging_admin_bootstrap_fails_closed_for_mismatched_targets(
    app_env, supabase_url, database_url
):
    with pytest.raises(ValueError):
        validate_staging_target(app_env, supabase_url, database_url)
