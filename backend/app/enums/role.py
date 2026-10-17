from enum import Enum


class Role(str, Enum):
    """User roles for access control."""

    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    TREASURER = "TREASURER"
    MEMBER = "MEMBER"
