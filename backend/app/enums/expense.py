from enum import Enum


class ExpenseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ExpenseCategory(str, Enum):
    TRAVEL = "travel"
    FOOD = "food"
    OFFICE = "office"
    SOFTWARE = "software"
    OTHER = "other"