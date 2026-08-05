from enum import Enum


class AttachmentType(str, Enum):
    RECEIPT = "receipt"
    INVOICE = "invoice"
    BOARDING_PASS = "boarding_pass"
    OTHER = "other"


class OCRStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
