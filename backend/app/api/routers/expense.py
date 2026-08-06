from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_expense_service, translate_service_exception
from app.schemas.common import MessageResponse
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post(
    "/",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create expense",
    description="Create a new expense resource.",
)
async def create_expense(
    payload: ExpenseCreate,
    service: ExpenseService = Depends(get_expense_service),
) -> ExpenseResponse:
    try:
        expense = await service.create_expense(**payload.model_dump())
        return ExpenseResponse.model_validate(expense)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/report/{report_id}",
    response_model=list[ExpenseResponse],
    status_code=status.HTTP_200_OK,
    summary="List expenses for report",
    description="Return all expenses belonging to a specific expense report.",
)
async def get_expenses_for_report(
    report_id: UUID,
    service: ExpenseService = Depends(get_expense_service),
) -> list[ExpenseResponse]:
    try:
        expenses = await service.get_expenses_for_report(report_id)
        return [ExpenseResponse.model_validate(expense) for expense in expenses]
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get expense",
    description="Fetch a single expense by its identifier.",
)
async def get_expense(
    expense_id: UUID,
    service: ExpenseService = Depends(get_expense_service),
) -> ExpenseResponse:
    try:
        expense = await service.get_expense(expense_id)
        if expense is None:
            raise ValueError("Expense not found")
        return ExpenseResponse.model_validate(expense)
    except Exception as exc:
        translate_service_exception(exc)


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
    service: ExpenseService = Depends(get_expense_service),
) -> ExpenseResponse:
    try:
        expense = await service.update_expense(
            expense_id,
            **payload.model_dump(exclude_unset=True),
        )
        return ExpenseResponse.model_validate(expense)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{expense_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete expense",
    description="Delete an expense by its identifier.",
)
async def delete_expense(
    expense_id: UUID,
    service: ExpenseService = Depends(get_expense_service),
) -> MessageResponse:
    try:
        await service.delete_expense(expense_id)
        return MessageResponse(message="Expense deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)
