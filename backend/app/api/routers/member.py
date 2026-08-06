from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_member_service, translate_service_exception
from app.schemas.common import MessageResponse
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.services.member_service import MemberService

router = APIRouter(prefix="/members", tags=["Members"])


@router.post(
    "/",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create member",
    description="Create a new member resource.",
)
async def create_member(
    payload: MemberCreate,
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        member = await service.create_member(**payload.model_dump())
        return MemberResponse.model_validate(member)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{member_id}",
    response_model=MemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Get member",
    description="Fetch a single member by its identifier.",
)
async def get_member(
    member_id: UUID,
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        member = await service.get_member(member_id)
        if member is None:
            raise ValueError("Member not found")
        return MemberResponse.model_validate(member)
    except Exception as exc:
        translate_service_exception(exc)


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
    service: MemberService = Depends(get_member_service),
) -> MemberResponse:
    try:
        member = await service.update_member(
            member_id,
            **payload.model_dump(exclude_unset=True),
        )
        return MemberResponse.model_validate(member)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{member_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete member",
    description="Delete a member by its identifier.",
)
async def delete_member(
    member_id: UUID,
    service: MemberService = Depends(get_member_service),
) -> MessageResponse:
    try:
        await service.delete_member(member_id)
        return MessageResponse(message="Member deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)
