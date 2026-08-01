from fastapi import APIRouter
from app.utils.responses import success_response

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("/")
async def health_check():
    return success_response(
    message="Health check successful",
    data={
        "status": "healthy",
        "service": "backend",
    },
)