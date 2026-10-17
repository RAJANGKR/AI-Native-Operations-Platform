import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_member_service,
    get_scope_organization_id,
    require_admin,
    translate_service_exception,
)
from app.enums.role import Role
from app.models.member import Member
from app.schemas.common import MessageResponse
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.services.member_service import MemberService

router = APIRouter(prefix="/members", tags=["Members"])


@router.get(
    "/",
    response_model=list[MemberResponse],
    status_code=status.HTTP_200_OK,
    summary="List all members",
    description="Return all members in the caller's organization.",
)
async def list_members(
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> list[MemberResponse]:
    try:
        members = await service.get_members_by_organization(scope_organization_id)
        return [MemberResponse.model_validate(m) for m in members]
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/pending",
    response_model=list[MemberResponse],
    status_code=status.HTTP_200_OK,
    summary="List pending member registrations",
    description="Return all student registrations pending Treasurer approval.",
)
async def list_pending_members(
    current_user: Member = Depends(require_admin),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> list[MemberResponse]:
    try:
        pending = await service.get_pending_members(scope_organization_id)
        return [MemberResponse.model_validate(m) for m in pending]
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/{member_id}/approve",
    response_model=MemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Approve member registration",
    description="Approve student account registration enabling login authorization.",
)
async def approve_member(
    member_id: UUID,
    current_user: Member = Depends(require_admin),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        member = await service.approve_member(member_id, scope_organization_id)
        return MemberResponse.model_validate(member)
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/{member_id}/reject",
    response_model=MemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Reject member registration",
    description="Reject pending student account registration.",
)
async def reject_member(
    member_id: UUID,
    current_user: Member = Depends(require_admin),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        member = await service.reject_member(member_id, scope_organization_id)
        return MemberResponse.model_validate(member)
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create member",
    description="Create a new member resource. Superadmins may target any "
    "organization; every other role is confined to their own organization.",
)
async def create_member(
    payload: MemberCreate,
    current_user: Member = Depends(require_admin),
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        data = payload.model_dump()
        if data.get("role") == Role.SUPERADMIN.value:
            # Platform-level accounts must never belong to a club, or
            # deleting that club would delete the account with it.
            data["organization_id"] = None
        elif current_user.role != Role.SUPERADMIN:
            data["organization_id"] = current_user.organization_id
        member = await service.create_member(**data)
        return MemberResponse.model_validate(member)
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{member_id}",
    response_model=MemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Get member",
    description="Fetch a single member by its identifier.",
)
async def get_member(
    member_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        member = await service.get_member(member_id, scope_organization_id)
        if member is None:
            raise ValueError("Member not found")
        return MemberResponse.model_validate(member)
    except Exception as exc:
        return translate_service_exception(exc)


@router.patch(
    "/{member_id}",
    response_model=MemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Update member",
    description="Partially update a member by its identifier.",
)
async def update_member(
    member_id: UUID,
    payload: MemberUpdate,
    current_user: Member = Depends(require_admin),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        data = payload.model_dump(exclude_unset=True)
        if current_user.role != Role.SUPERADMIN:
            data.pop("organization_id", None)
        member = await service.update_member(
            member_id,
            scope_organization_id,
            **data,
        )
        return MemberResponse.model_validate(member)
    except Exception as exc:
        return translate_service_exception(exc)


@router.delete(
    "/{member_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete member",
    description="Delete a member by its identifier.",
)
async def delete_member(
    member_id: UUID,
    current_user: Member = Depends(require_admin),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: MemberService = Depends(get_member_service),
) -> MessageResponse:
    try:
        await service.delete_member(member_id, scope_organization_id)
        return MessageResponse(message="Member deleted successfully")
    except Exception as exc:
        return translate_service_exception(exc)
