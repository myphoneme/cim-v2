from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db, SessionLocal
from .models.user import User
from .utils.security import get_password_hash
from .config import get_settings
from .routers import (
    auth_router,
    equipment_router,
    chat_router,
    attachments_router,
    manuals_router,
)

settings = get_settings()


def seed_admin_user():
    """Create default admin user if no users exist."""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            admin = User(
                email=settings.ADMIN_EMAIL,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                name="Admin",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"Created admin user: {settings.ADMIN_EMAIL}")
    finally:
        db.close()


def seed_sample_equipment():
    """Seed sample equipment data."""
    from .models.equipment import Equipment

    db = SessionLocal()
    try:
        equipment_count = db.query(Equipment).count()
        if equipment_count == 0:
            sample_equipment = [
                Equipment(
                    name="Server Load Balancer",
                    area="Network",
                    type="Load Balancer",
                    vendor="Array Networks",
                    model="AVX 7900",
                    quantity="2",
                    sop_status="Available",
                    email="support@arraynetworks.com",
                    phone="+1-866-MY-ARRAY",
                    web_support="https://support.arraynetworks.net",
                    license_applicable="Yes"
                ),
                Equipment(
                    name="Web Application Firewall",
                    area="Security",
                    type="WAF",
                    vendor="Array Networks",
                    model="AVX 7900",
                    quantity="2",
                    sop_status="Available",
                    email="support@arraynetworks.com",
                    phone="+1-866-MY-ARRAY",
                    web_support="https://support.arraynetworks.net",
                    license_applicable="Yes"
                ),
                Equipment(
                    name="Primary & Secondary Firewall",
                    area="Security",
                    type="Firewall",
                    vendor="FortiNet",
                    model="FortiGate-1001F",
                    quantity="2",
                    sop_status="Available",
                    email="support@fortinet.com",
                    phone="+1-408-235-7700",
                    web_support="https://support.fortinet.com",
                    license_applicable="Yes"
                ),
                Equipment(
                    name="POE Switch",
                    area="Network",
                    type="Switch",
                    vendor="Netgear",
                    model="GS724TPv3",
                    quantity="57",
                    sop_status="Available",
                    email="support@netgear.com",
                    web_support="https://www.netgear.com/support",
                    license_applicable="No"
                ),
                Equipment(
                    name="Blade Server",
                    area="Comput",
                    type="Server",
                    vendor="Dell",
                    model="PowerEdge MX750c",
                    quantity="19",
                    sop_status="Available",
                    email="support@dell.com",
                    web_support="https://www.dell.com/support",
                    license_applicable="Yes"
                ),
                Equipment(
                    name="Unified Storage",
                    area="Comput",
                    type="Storage",
                    vendor="NetApp",
                    model="FAS 8700",
                    quantity="17",
                    sop_status="Available",
                    email="support@netapp.com",
                    web_support="https://mysupport.netapp.com",
                    license_applicable="Yes"
                ),
                Equipment(
                    name="Server Virtualization",
                    area="Application",
                    type="Virtualization",
                    vendor="Broadcom",
                    model="ESXi 8.03e",
                    quantity="N/A",
                    sop_status="Available",
                    email="support@broadcom.com",
                    web_support="https://www.vmware.com/support",
                    license_applicable="Yes"
                ),
            ]
            for eq in sample_equipment:
                db.add(eq)
            db.commit()
            print(f"Created {len(sample_equipment)} sample equipment records")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    seed_admin_user()
    seed_sample_equipment()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="CIMS API",
    description="Data Center Infrastructure Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(equipment_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(attachments_router, prefix="/api")
app.include_router(manuals_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CIMS API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
