"""Compatibility entry point for local Uvicorn usage.

Both `uvicorn main:app` and `uvicorn app.main:app` are supported.
"""
from app.main import app

__all__ = ["app"]
