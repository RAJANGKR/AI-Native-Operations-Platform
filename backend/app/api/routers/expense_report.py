from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_expense_report_service,
    translate_service_exception,
)
from app.schemas.common import MessageResponse
from app.schemas.expense_report import (
    ExpenseReportCreate,
    ExpenseReportResponse,
    ExpenseReportUpdate,
)
from app.services.expense_report_service import ExpenseReportService

router = APIRouter(prefix="/expense-reports", tags=["Expense Reports"])


@router.get(
    "/",
    response_model=list[ExpenseReportResponse],
    status_code=status.HTTP_200_OK,
    summary="List all expense reports",
    description="Return all expense reports.",
)
async def get_reports(
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> list[ExpenseReportResponse]:
    try:
        reports = await service.get_all_reports()
        return [ExpenseReportResponse.model_validate(r) for r in reports]
    except Exception as exc:
        translate_service_exception(exc)


@router.post(
    "/",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create expense report",
    description="Create a new expense report resource.",
)
async def create_report(
    payload: ExpenseReportCreate,
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        report = await service.create_report(**payload.model_dump())
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{report_id}",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get expense report",
    description="Fetch a single expense report by its identifier.",
)
async def get_report(
    report_id: UUID,
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        report = await service.get_report(report_id)
        if report is None:
            raise ValueError("Expense report not found")
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        translate_service_exception(exc)


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
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        report = await service.update_report(
            report_id,
            **payload.model_dump(exclude_unset=True),
        )
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{report_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete expense report",
    description="Delete an expense report by its identifier.",
)
async def delete_report(
    report_id: UUID,
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> MessageResponse:
    try:
        await service.delete_report(report_id)
        return MessageResponse(message="Expense report deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)


@router.post(
    "/{report_id}/submit",
    response_model=ExpenseReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit expense report",
    description="Submit a draft expense report for processing.",
)
async def submit_report(
    report_id: UUID,
    service: ExpenseReportService = Depends(get_expense_report_service),
) -> ExpenseReportResponse:
    try:
        report = await service.submit_report(report_id)
        return ExpenseReportResponse.model_validate(report)
    except Exception as exc:
        translate_service_exception(exc)
