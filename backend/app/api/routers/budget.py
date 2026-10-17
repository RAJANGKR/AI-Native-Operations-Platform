import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_budget_service,
    get_scope_organization_id,
    require_admin,
    require_treasurer,
    translate_service_exception,
)
from app.enums.role import Role
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
    description="Create a new budget resource. Superadmins may target any "
    "organization; every other role is confined to their own organization.",
)
async def create_budget(
    payload: BudgetCreate,
    service: BudgetService = Depends(get_budget_service),
    current_user: Member = Depends(require_treasurer),
) -> BudgetResponse:
    try:
        data = payload.model_dump()
        target_org_id = data.pop("organization_id", None)
        if current_user.role != Role.SUPERADMIN or target_org_id is None:
            target_org_id = current_user.organization_id
        budget = await service.create_budget(target_org_id, **data)
        return BudgetResponse.model_validate(budget)
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{budget_id}",
    response_model=BudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Get budget",
    description="Fetch a single budget by its identifier.",
)
async def get_budget(
    budget_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: BudgetService = Depends(get_budget_service),
) -> BudgetResponse:
    try:
        budget = await service.get_budget(budget_id, scope_organization_id)
        if budget is None:
            raise ValueError("Budget not found")
        return BudgetResponse.model_validate(budget)
    except Exception as exc:
        return translate_service_exception(exc)


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
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
) -> BudgetResponse:
    try:
        data = payload.model_dump(exclude_unset=True)
        if current_user.role != Role.SUPERADMIN:
            data.pop("organization_id", None)
        budget = await service.update_budget(
            budget_id,
            scope_organization_id,
            **data,
        )
        return BudgetResponse.model_validate(budget)
    except Exception as exc:
        return translate_service_exception(exc)


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
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
) -> MessageResponse:
    try:
        await service.delete_budget(budget_id, scope_organization_id)
        return MessageResponse(message="Budget deleted successfully")
    except Exception as exc:
        return translate_service_exception(exc)
