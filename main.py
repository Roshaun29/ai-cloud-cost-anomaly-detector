from contextlib import asynccontextmanager

from fastapi import FastAPI

from config import get_settings
from database import get_database, ping_database
from routes.anomaly import router as anomaly_router
from routes.auth import router as auth_router
from routes.cloud import router as cloud_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ping_database()
    db = get_database()
    await db.users.create_index("email", unique=True)
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.app_debug,
    lifespan=lifespan,
)
app.include_router(auth_router)
app.include_router(cloud_router)
app.include_router(anomaly_router)


@app.get("/health", tags=["Health"])
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
