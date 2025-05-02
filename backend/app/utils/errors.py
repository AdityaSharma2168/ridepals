"""
Standardized error handling for API endpoints.
"""
from fastapi import HTTPException, status
from typing import Optional, Dict, Any

class APIError(HTTPException):
    """
    Base class for API errors. Extends FastAPI's HTTPException.
    """
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class NotFoundError(APIError):
    """
    Resource not found error.
    """
    def __init__(
        self,
        detail: str = "Resource not found",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "NOT_FOUND",
    ):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class BadRequestError(APIError):
    """
    Bad request error.
    """
    def __init__(
        self,
        detail: str = "Bad request",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "BAD_REQUEST",
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class UnauthorizedError(APIError):
    """
    Unauthorized error.
    """
    def __init__(
        self,
        detail: str = "Unauthorized",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "UNAUTHORIZED",
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class ForbiddenError(APIError):
    """
    Forbidden error.
    """
    def __init__(
        self,
        detail: str = "Forbidden",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "FORBIDDEN",
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class ConflictError(APIError):
    """
    Conflict error.
    """
    def __init__(
        self,
        detail: str = "Conflict",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "CONFLICT",
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            headers=headers,
            error_code=error_code,
        )


class ServerError(APIError):
    """
    Internal server error.
    """
    def __init__(
        self,
        detail: str = "Internal server error",
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = "SERVER_ERROR",
    ):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            headers=headers,
            error_code=error_code,
        ) 