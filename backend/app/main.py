from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(
    title="Personal Finance Dashboard API",
    version="0.1.0",
    debug=settings.debug,
)


@app.get("/")
def test():
    return {
        "status": "ok",
        "environment": settings.environment,
    }
