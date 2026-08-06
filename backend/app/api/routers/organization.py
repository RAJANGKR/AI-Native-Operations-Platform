from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_organization_service,
    translate_service_exception,
)
from app.schemas.common import MessageResponse
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.organization_service import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post(
    "/",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create organization",
    description="Create a new organization resource.",
)
async def create_organization(
    payload: OrganizationCreate,
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationResponse:
    try:
        organization = await service.create_organization(**payload.model_dump())
        return OrganizationResponse.model_validate(organization)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get organization",
    description="Fetch a single organization by its identifier.",
)
async def get_organization(
    organization_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationResponse:
    try:
        organization = await service.get_organization(organization_id)
        if organization is None:
            raise ValueError("Organization not found")
        return OrganizationResponse.model_validate(organization)
    except Exception as exc:
        translate_service_exception(exc)


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
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationResponse:
    try:
        organization = await service.update_organization(
            organization_id,
            **payload.model_dump(exclude_unset=True),
        )
        return OrganizationResponse.model_validate(organization)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{organization_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete organization",
    description="Delete an organization by its identifier.",
)
async def delete_organization(
    organization_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
) -> MessageResponse:
    try:
        await service.delete_organization(organization_id)
        return MessageResponse(message="Organization deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)
