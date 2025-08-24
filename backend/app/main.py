from fastapi import FastAPI

from app.core.config import settings
from app.routers import auth  # <-- import your router

app = FastAPI(
    title="Personal Finance Dashboard API",
    version="0.1.0",
    debug=settings.debug,
)

# register routers
app.include_router(auth.router)


@app.get("/")
def test():
    return {
        "status": "ok",
        "environment": settings.environment,
    }
