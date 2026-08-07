from enum import Enum


class Role(str, Enum):
    """User roles for access control."""

    ADMIN = "ADMIN"
    TREASURER = "TREASURER"
    MEMBER = "MEMBER"
