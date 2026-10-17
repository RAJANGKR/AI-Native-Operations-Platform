from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.logging import logger
from app.utils.responses import error_response


async def http_exception_handler(
    request: Request,
    exc: Exception,
):
    assert isinstance(exc, HTTPException)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            message=str(exc.detail),
        ),
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content=error_response(
            message="Internal server error",
        ),
    )


def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(
        HTTPException,
        http_exception_handler,
    )

    app.add_exception_handler(
        Exception,
        generic_exception_handler,
    )