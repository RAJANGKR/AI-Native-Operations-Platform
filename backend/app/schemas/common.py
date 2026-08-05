from datetime import datetime
from decimal import Decimal
from typing import Annotated, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ItemT = TypeVar("ItemT")

NameStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=255,
        description="Human-readable name",
        examples=["Acme Finance"],
    ),
]

ShortTextStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=100,
        description="Short text value",
        examples=["Technology"],
    ),
]

RoleStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=50,
        description="Role assigned to the member",
        examples=["member"],
    ),
]

CurrencyCodeStr = Annotated[
    str,
    Field(
        min_length=3,
        max_length=10,
        description="Currency code used for financial values",
        examples=["INR", "USD"],
    ),
]

DescriptionStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=2000,
        description="Detailed free-form description",
        examples=["Quarterly operating budget for engineering"],
    ),
]

MerchantStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=255,
        description="Merchant or vendor name",
        examples=["Apple Store"],
    ),
]

PathStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=512,
        description="Storage path for the uploaded asset",
        examples=["receipts/2026/08/invoice-123.pdf"],
    ),
]

MimeTypeStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=255,
        description="MIME type for the uploaded asset",
        examples=["application/pdf"],
    ),
]

PositiveAmount = Annotated[
    Decimal,
    Field(
        gt=Decimal("0"),
        max_digits=12,
        decimal_places=2,
        description="Positive monetary amount",
        examples=["1250.00"],
    ),
]


class APIModel(BaseModel):
    """Base schema model for API contracts."""


class ORMResponseModel(APIModel):
    """Base response schema that can serialize ORM objects."""

    model_config = ConfigDict(from_attributes=True)


class TimestampedResponse(ORMResponseModel):
    """Base response schema for entities with identifiers and timestamps."""

    id: UUID = Field(description="Unique identifier")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")


class MessageResponse(APIModel):
    """Generic message wrapper."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Human-readable response message",
        examples=["Operation completed successfully"],
    )


class HealthResponse(APIModel):
    """Health check response payload."""

    status: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Current health status",
        examples=["ok"],
    )
    timestamp: datetime = Field(description="Timestamp of the health check response")


class PaginationResponse(APIModel, Generic[ItemT]):
    """Generic pagination response wrapper."""

    items: list[ItemT] = Field(
        default_factory=list,
        description="Paginated collection of response items",
    )
    total: int = Field(ge=0, description="Total number of available items")
    page: int = Field(ge=1, description="Current page number")
    page_size: int = Field(ge=1, description="Number of items in the current page")


class ErrorResponse(APIModel):
    """Generic error response."""

    error: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Machine-readable or short error identifier",
        examples=["resource_not_found"],
    )
    detail: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Human-readable error details",
        examples=["The requested organization does not exist."],
    )


class ValidationErrorDetail(APIModel):
    """Single validation error entry."""

    field: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Field that failed validation",
        examples=["email"],
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Validation failure message",
        examples=["value is not a valid email address"],
    )


class ValidationErrorResponse(APIModel):
    """Validation error envelope."""

    error: str = Field(
        default="validation_error",
        description="Fixed validation error identifier",
        examples=["validation_error"],
    )
    details: list[ValidationErrorDetail] = Field(
        default_factory=list,
        description="List of field-level validation errors",
    )
