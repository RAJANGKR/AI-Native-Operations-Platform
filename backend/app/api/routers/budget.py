from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_budget_service,
    require_admin,
    require_treasurer,
    translate_service_exception,
)
from app.models.member import Member
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate
from app.schemas.common import MessageResponse
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.post(
    "/",
    response_model=BudgetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create budget",
    description="Create a new budget resource.",
)
async def create_budget(
    payload: BudgetCreate,
    service: BudgetService = Depends(get_budget_service),
    current_user: Member = Depends(require_treasurer),
) -> BudgetResponse:
    try:
        budget = await service.create_budget(**payload.model_dump())
        return BudgetResponse.model_validate(budget)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{budget_id}",
    response_model=BudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Get budget",
    description="Fetch a single budget by its identifier.",
)
async def get_budget(
    budget_id: UUID,
    service: BudgetService = Depends(get_budget_service),
) -> BudgetResponse:
    try:
        budget = await service.get_budget(budget_id)
        if budget is None:
            raise ValueError("Budget not found")
        return BudgetResponse.model_validate(budget)
    except Exception as exc:
        translate_service_exception(exc)


@router.patch(
    "/{budget_id}",
    response_model=BudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Update budget",
    description="Partially update a budget by its identifier.",
)
async def update_budget(
    budget_id: UUID,
    payload: BudgetUpdate,
    service: BudgetService = Depends(get_budget_service),
    current_user: Member = Depends(require_treasurer),
) -> BudgetResponse:
    try:
        budget = await service.update_budget(
            budget_id,
            **payload.model_dump(exclude_unset=True),
        )
        return BudgetResponse.model_validate(budget)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{budget_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete budget",
    description="Delete a budget by its identifier.",
)
async def delete_budget(
    budget_id: UUID,
    service: BudgetService = Depends(get_budget_service),
    current_user: Member = Depends(require_admin),
) -> MessageResponse:
    try:
        await service.delete_budget(budget_id)
        return MessageResponse(message="Budget deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)
