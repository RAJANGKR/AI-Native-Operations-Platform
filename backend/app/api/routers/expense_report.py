import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_current_user,
    get_expense_report_service,
    get_scope_organization_id,
    translate_service_exception,
)
from app.models.member import Member
from app.schemas.common import MessageResponse
from app.schemas.expense_report import (
    ExpenseReportCreate,
    ExpenseReportResponse,
    ExpenseReportUpdate,
)
# pyrefly: ignore [missing-import]
from app.services.expense_report_service import ExpenseReportService

router = APIRouter(prefix="/expense-reports", tags=["Expense Reports"])


@router.get(
    "/",
    response_model=list[ExpenseReportResponse],
    status_code=status.HTTP_200_OK,
    summary="List all expense reports",
    description="Return all expense reports scoped by organization and user role.",
)
async def get_reports(
    current_user: Member = Depends(get_current_user),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> list[ExpenseReportResponse]:
    try:
        reports = await service.get_all_reports(scope_organization_id)
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role.upper() == "MEMBER":
            reports = [r for r in reports if str(r.member_id) == str(current_user.id)]
        return [ExpenseReportResponse.model_validate(r) for r in reports]
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create expense report",
    description="Create a new expense report resource.",
)
async def create_report(
    payload: ExpenseReportCreate,
    current_user: Member = Depends(get_current_user),
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        data = payload.model_dump()
        data["organization_id"] = current_user.organization_id
        data["member_id"] = current_user.id
        report = await service.create_report(**data)
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{report_id}",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get expense report",
    description="Fetch a single expense report by its identifier.",
)
async def get_report(
    report_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        report = await service.get_report(report_id, scope_organization_id)
        if report is None:
            raise ValueError("Expense report not found")
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        return translate_service_exception(exc)


@router.patch(
    "/{report_id}",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Update expense report",
    description="Partially update an expense report by its identifier.",
)
async def update_report(
    report_id: UUID,
    payload: ExpenseReportUpdate,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        data = payload.model_dump(exclude_unset=True)
        data.pop("organization_id", None)
        data.pop("member_id", None)
        report = await service.update_report(
            report_id,
            scope_organization_id,
            **data,
        )
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        return translate_service_exception(exc)


@router.delete(
    "/{report_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete expense report",
    description="Delete an expense report by its identifier.",
)
async def delete_report(
    report_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> MessageResponse:
    try:
        await service.delete_report(report_id, scope_organization_id)
        return MessageResponse(message="Expense report deleted successfully")
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/{report_id}/submit",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit expense report",
    description="Submit a draft expense report for processing.",
)
async def submit_report(
    report_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        report = await service.submit_report(report_id, scope_organization_id)
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        return translate_service_exception(exc)
