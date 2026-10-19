import pytest
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

from app.api.dependencies import translate_service_exception


class _ResponseModel(BaseModel):
    value: int


def test_response_validation_failure_is_server_error_without_internal_details():
    with pytest.raises(ValidationError) as validation_error:
        _ResponseModel.model_validate({"value": "not-an-integer"})

    with pytest.raises(HTTPException) as translated:
        translate_service_exception(validation_error.value)

    assert translated.value.status_code == 500
    assert translated.value.detail == "The server could not serialize the response."
    assert "not-an-integer" not in translated.value.detail
