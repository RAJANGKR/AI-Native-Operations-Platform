from typing import Any


def success_response(
    message: str,
    data: Any = None,
):
    return {
        "success": True,
        "message": message,
        "data": data,
        "errors": [],
    }


def error_response(
    message: str,
    errors: list | None = None,
    data: Any = None,
):
    return {
        "success": False,
        "message": message,
        "data": data,
        "errors": errors or [],
    }