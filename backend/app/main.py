import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text, inspect

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.auth import ensure_initial_owner
from app.routes import orders, owner, settings as settings_routes, auth
from app.services.storage import cleanup_expired_files


# Create missing database tables without deleting existing data.
Base.metadata.create_all(bind=engine)


# Safely add columns that may be missing from existing databases.
def ensure_column(table_name: str, column_name: str, column_type: str):
    inspector = inspect(engine)

    if not inspector.has_table(table_name):
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(table_name)
    }

    if column_name not in existing_columns:
        with engine.begin() as conn:
            conn.execute(
                text(
                    f"ALTER TABLE {table_name} "
                    f"ADD COLUMN {column_name} {column_type}"
                )
            )


# Maintain compatibility with existing databases.
ensure_column("orders", "payment_status", "VARCHAR(30) DEFAULT 'unpaid'")

# Security-answer hashes for owner password recovery.
ensure_column("owner_users", "security_color_hash", "VARCHAR(255)")
ensure_column("owner_users", "security_animal_hash", "VARCHAR(255)")
ensure_column("owner_users", "security_person_hash", "VARCHAR(255)")


# Seed the initial owner if no owner exists.
with SessionLocal() as db:
    ensure_initial_owner(db)
    cleanup_expired_files(db)


app = FastAPI(
    title="Smart Xerox API",
    description=(
        "Mobile-first QR Code Printing Web Application Backend "
        "for Epson EcoTank L3250"
    ),
    version="1.0.0",
)


# CORS configuration.
origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

if not origins or "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers.
app.include_router(orders.router)
app.include_router(owner.router)
app.include_router(settings_routes.router)
app.include_router(auth.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for service monitoring."""
    return {
        "status": "healthy",
        "service": "Smart Xerox API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "shop": settings.SHOP_NAME,
    }


# Serve frontend files if the backend package includes a frontend build.
FRONTEND_DIST = (
    Path(__file__).resolve().parent.parent.parent
    / "frontend"
    / "dist"
)

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=assets_dir),
            name="assets",
        )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API routes or API documentation.
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Not Found")

        file_path = FRONTEND_DIST / full_path

        if file_path.is_file():
            return FileResponse(file_path)

        return FileResponse(FRONTEND_DIST / "index.html")
