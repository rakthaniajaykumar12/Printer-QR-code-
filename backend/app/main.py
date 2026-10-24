import os
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.auth import ensure_initial_owner
from app.routes import orders, owner, settings as settings_routes, auth
from app.services.storage import cleanup_expired_files

# Create DB tables
Base.metadata.create_all(bind=engine)

# Ensure payment_status column exists in existing DBs
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(30) DEFAULT 'unpaid'"))
        conn.commit()
except Exception:
    pass  # Column already exists

# Seed initial owner user if needed
with SessionLocal() as db:
    ensure_initial_owner(db)
    # Perform startup retention cleanup
    cleanup_expired_files(db)

app = FastAPI(
    title="Smart Xerox API",
    description="Mobile-first QR Code Printing Web Application Backend for Epson EcoTank L3250",
    version="1.0.0"
)

# CORS configuration
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
if not origins or "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(orders.router)
app.include_router(owner.router)
app.include_router(settings_routes.router)
app.include_router(auth.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for container uptime and service monitoring."""
    return {
        "status": "healthy",
        "service": "Smart Xerox API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "shop": settings.SHOP_NAME
    }


# Frontend SPA static files serving (for production deployment or single-server mode)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't catch /api routes or docs
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
