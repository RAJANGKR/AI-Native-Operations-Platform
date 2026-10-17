import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_attachment_service,
    get_current_user,
    get_expense_service,
    get_scope_organization_id,
    get_scope_member_id,
    translate_service_exception,
)
from app.models.member import Member
from app.schemas.attachment import AttachmentResponse
from app.schemas.common import MessageResponse
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.attachment_service import AttachmentService
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get(
    "/",
    response_model=list[ExpenseResponse],
    status_code=status.HTTP_200_OK,
    summary="List all expenses",
    description="Return expenses filtered by member scope.",
)
async def list_expenses(
    current_user: Member = Depends(get_current_user),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ExpenseService = Depends(get_expense_service),
) -> list[ExpenseResponse]:
    try:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        member_id = current_user.id if user_role.upper() == "MEMBER" else None
        expenses = await service.get_all_expenses(scope_organization_id, member_id)
        return [ExpenseResponse.model_validate(exp) for exp in expenses]
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create expense",
    description="Create a new expense resource.",
)
async def create_expense(
    payload: ExpenseCreate,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    scope_member_id: uuid.UUID | None = Depends(get_scope_member_id),
    service: ExpenseService = Depends(get_expense_service),
) -> ExpenseResponse:
    try:
        expense = await service.create_expense(
            scope_organization_id, scope_member_id, **payload.model_dump()
        )
        return ExpenseResponse.model_validate(expense)
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/report/{report_id}",
    response_model=list[ExpenseResponse],
    status_code=status.HTTP_200_OK,
    summary="List expenses for report",
    description="Return all expenses belonging to a specific expense report.",
)
async def get_expenses_for_report(
    report_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    scope_member_id: uuid.UUID | None = Depends(get_scope_member_id),
    service: ExpenseService = Depends(get_expense_service),
) -> list[ExpenseResponse]:
    try:
        expenses = await service.get_expenses_for_report(
            report_id, scope_organization_id, scope_member_id
        )
        return [ExpenseResponse.model_validate(expense) for expense in expenses]
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get expense",
    description="Fetch a single expense by its identifier.",
)
async def get_expense(
    expense_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    scope_member_id: uuid.UUID | None = Depends(get_scope_member_id),
    service: ExpenseService = Depends(get_expense_service),
) -> ExpenseResponse:
    try:
        expense = await service.get_expense(
            expense_id, scope_organization_id, scope_member_id
        )
        if expense is None:
            raise ValueError("Expense not found")
        return ExpenseResponse.model_validate(expense)
    except Exception as exc:
        return translate_service_exception(exc)


@router.patch(
    "/{expense_id}",
    response_model=ExpenseResponse,
    status_code=status.HTTP_200_OK,
    summary="Update expense",
    description="Partially update an expense by its identifier.",
)
async def update_expense(
    expense_id: UUID,
    payload: ExpenseUpdate,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    scope_member_id: uuid.UUID | None = Depends(get_scope_member_id),
    service: ExpenseService = Depends(get_expense_service),
) -> ExpenseResponse:
    try:
        expense = await service.update_expense(
            expense_id,
            scope_organization_id,
            scope_member_id,
            **payload.model_dump(exclude_unset=True),
        )
        return ExpenseResponse.model_validate(expense)
    except Exception as exc:
        return translate_service_exception(exc)


@router.delete(
    "/{expense_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete expense",
    description="Delete an expense by its identifier.",
)
async def delete_expense(
    expense_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    scope_member_id: uuid.UUID | None = Depends(get_scope_member_id),
    service: ExpenseService = Depends(get_expense_service),
) -> MessageResponse:
    try:
        await service.delete_expense(
            expense_id, scope_organization_id, scope_member_id
        )
        return MessageResponse(message="Expense deleted successfully")
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{expense_id}/attachments",
    response_model=list[AttachmentResponse],
    status_code=status.HTTP_200_OK,
    summary="List attachments for expense",
    description="Return all attachments belonging to a specific expense.",
)
async def get_attachments_for_expense(
    expense_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    scope_member_id: uuid.UUID | None = Depends(get_scope_member_id),
    attachment_service: AttachmentService = Depends(get_attachment_service),
) -> list[AttachmentResponse]:
    try:
        attachments = await attachment_service.get_attachments_for_expense(
            expense_id, scope_organization_id, scope_member_id
        )
        return [AttachmentResponse.model_validate(att) for att in attachments]
    except Exception as exc:
        return translate_service_exception(exc)

