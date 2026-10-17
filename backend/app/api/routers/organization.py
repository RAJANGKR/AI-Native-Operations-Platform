from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_current_user,
    get_organization_service,
    require_admin,
    translate_service_exception,
)
from app.enums.role import Role
from app.models.member import Member
from app.schemas.common import MessageResponse
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.organization_service import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.get(
    "/",
    response_model=list[OrganizationResponse],
    status_code=status.HTTP_200_OK,
    summary="List the caller's organization",
    description="Return the organization the caller belongs to.",
)
async def list_organizations(
    current_user: Member = Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
) -> list[OrganizationResponse]:
    try:
        if current_user.role == Role.SUPERADMIN:
            orgs = await service.get_all_organizations()
            return [OrganizationResponse.model_validate(o) for o in orgs]
        organization = await service.get_organization(current_user.organization_id)
        if organization is None:
            return []
        return [OrganizationResponse.model_validate(organization)]
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create organization",
    description="Create a new organization resource.",
)
async def create_organization(
    payload: OrganizationCreate,
    current_user: Member = Depends(require_admin),
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationResponse:
    try:
        organization = await service.create_organization(**payload.model_dump())
        return OrganizationResponse.model_validate(organization)
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get organization",
    description="Fetch a single organization by its identifier.",
)
async def get_organization(
    organization_id: UUID,
    current_user: Member = Depends(get_current_user),
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationResponse:
    try:
        if current_user.role != Role.SUPERADMIN and organization_id != current_user.organization_id:
            raise ValueError("Organization not found")
        organization = await service.get_organization(organization_id)
        if organization is None:
            raise ValueError("Organization not found")
        return OrganizationResponse.model_validate(organization)
    except Exception as exc:
        return translate_service_exception(exc)


@router.patch(
    "/{organization_id}",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Update organization",
    description="Partially update an organization by its identifier.",
)
async def update_organization(
    organization_id: UUID,
    payload: OrganizationUpdate,
    current_user: Member = Depends(require_admin),
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationResponse:
    try:
        if current_user.role != Role.SUPERADMIN and organization_id != current_user.organization_id:
            raise ValueError("Organization not found")
        organization = await service.update_organization(
            organization_id,
            **payload.model_dump(exclude_unset=True),
        )
        return OrganizationResponse.model_validate(organization)
    except Exception as exc:
        return translate_service_exception(exc)


@router.delete(
    "/{organization_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete organization",
    description="Delete an organization by its identifier.",
)
async def delete_organization(
    organization_id: UUID,
    current_user: Member = Depends(require_admin),
    service: OrganizationService = Depends(get_organization_service),
) -> MessageResponse:
    try:
        if current_user.role != Role.SUPERADMIN and organization_id != current_user.organization_id:
            raise ValueError("Organization not found")
        await service.delete_organization(organization_id)
        return MessageResponse(message="Organization deleted successfully")
    except Exception as exc:
        return translate_service_exception(exc)
