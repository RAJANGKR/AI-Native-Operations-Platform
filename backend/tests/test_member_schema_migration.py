import importlib.util
from pathlib import Path

import pytest
import sqlalchemy as sa

from app.models.member import Member


MIGRATION_PATH = (
    Path(__file__).parents[1]
    / "alembic"
    / "versions"
    / "9c72a4e1f6b3_add_missing_member_profile_approval_columns.py"
)


class RecordingOperations:
    def __init__(self):
        self.calls = []

    def add_column(self, table_name, column):
        self.calls.append(("add_column", table_name, column))

    def execute(self, statement):
        self.calls.append(("execute", statement))

    def alter_column(self, table_name, column_name, **kwargs):
        self.calls.append(("alter_column", table_name, column_name, kwargs))


def load_migration():
    spec = importlib.util.spec_from_file_location("member_schema_repair", MIGRATION_PATH)
    assert spec is not None and spec.loader is not None
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    return migration


def test_migration_extends_current_head_and_matches_member_model(monkeypatch):
    migration = load_migration()
    operations = RecordingOperations()
    monkeypatch.setattr(migration, "op", operations)

    assert migration.revision == "9c72a4e1f6b3"
    assert migration.down_revision == "f6e633d7d470"

    migration.upgrade()

    additions = [call for call in operations.calls if call[0] == "add_column"]
    assert [call[2].name for call in additions] == [
        "department",
        "year",
        "approval_status",
    ]

    for _, table_name, column in additions:
        assert table_name == "members"
        model_column = Member.__table__.c[column.name]
        assert isinstance(column.type, sa.String)
        assert column.type.length == model_column.type.length
        assert column.nullable == model_column.nullable or (
            column.name == "approval_status" and column.nullable
        )

    backfill_index = next(
        index for index, call in enumerate(operations.calls) if call[0] == "execute"
    )
    backfill_sql = str(operations.calls[backfill_index][1])
    assert "SET approval_status = 'PENDING'" in backfill_sql
    assert "WHERE approval_status IS NULL" in backfill_sql

    enforce_call = operations.calls[backfill_index + 1]
    assert enforce_call[:3] == ("alter_column", "members", "approval_status")
    assert enforce_call[3]["nullable"] is False


def test_migration_downgrade_is_explicitly_unsupported(monkeypatch):
    migration = load_migration()
    operations = RecordingOperations()
    monkeypatch.setattr(migration, "op", operations)

    with pytest.raises(NotImplementedError, match="forward-only"):
        migration.downgrade()

    assert operations.calls == []
