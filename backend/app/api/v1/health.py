from fastapi import APIRouter
from app.utils.responses import success_response
from fastapi import HTTPException

from app.core.config import settings

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)

@router.get("/error")
async def test_error():
    raise HTTPException(
        status_code=404,
        detail="Health endpoint not found",
    )

@router.get("/")
async def health_check():
    return success_response(
        message="Health check successful",
        data={
            "status": "healthy",
            "service": "backend",
            "database": bool(settings.database_url),
            "supabase": {
                "url_configured": bool(settings.supabase_url),
                "key_configured": bool(settings.supabase_key),
            },
        },
    )