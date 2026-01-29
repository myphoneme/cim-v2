from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db, SessionLocal
from .models.user import User
from .models.location import Location
from .utils.security import get_password_hash
from .config import get_settings
from .routers import (
    auth_router,
    equipment_router,
    chat_router,
    attachments_router,
    manuals_router,
    locations_router,
    device_items_router,
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


def seed_locations():
    """Seed default locations."""
    db = SessionLocal()
    try:
        location_count = db.query(Location).count()
        if location_count == 0:
            locations = [
                Location(
                    name="Pune Data Center",
                    code="PUN-DC",
                    type="DC",
                    address="Pune, Maharashtra",
                    is_primary=True,
                    is_active=True
                ),
                Location(
                    name="Pune Branch",
                    code="PUN-BR",
                    type="BR",
                    address="Pune, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Mumbai Branch",
                    code="MUM-BR",
                    type="BR",
                    address="Mumbai, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Thane Branch",
                    code="THA-BR",
                    type="BR",
                    address="Thane, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Amravati Branch",
                    code="AMR-BR",
                    type="BR",
                    address="Amravati, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Sambhaji Nagar Branch",
                    code="AUR-BR",
                    type="BR",
                    address="Sambhaji Nagar, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Chandrapur Branch",
                    code="CHND-BR",
                    type="BR",
                    address="Chandrapur, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Ratnagiri Branch",
                    code="RAT-BR",
                    type="BR",
                    address="Ratnagiri, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Nashik Branch",
                    code="NSK-BR",
                    type="BR",
                    address="Nashik, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Nanded Branch",
                    code="NAD-BR",
                    type="BR",
                    address="Nanded, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Nagpur Branch",
                    code="NAG-BR",
                    type="BR",
                    address="Nagpur, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Kolhapur Branch",
                    code="KOL-BR",
                    type="BR",
                    address="Kolhapur, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="Dhule Branch",
                    code="DHU-BR",
                    type="BR",
                    address="Dhule, Maharashtra",
                    is_primary=False,
                    is_active=True
                ),
                Location(
                    name="DR Site",
                    code="DR-SITE",
                    type="DR",
                    address="Disaster Recovery Site",
                    is_primary=False,
                    is_active=True
                ),
            ]
            for loc in locations:
                db.add(loc)
            db.commit()
            print(f"Created {len(locations)} default locations")
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


def seed_device_items():
    """Seed sample device items."""
    from .models.device_item import DeviceItem
    from .models.location import Location

    db = SessionLocal()
    try:
        # Resolve location references up front so they are available for idempotent inserts
        pune_dc = db.query(Location).filter(Location.code == "PUN-DC").first()
        pune_br = db.query(Location).filter(Location.code == "PUN-BR").first()
        mumbai_br = db.query(Location).filter(Location.code == "MUM-BR").first()
        thane_br = db.query(Location).filter(Location.code == "THA-BR").first()
        amravati_br = db.query(Location).filter(Location.code == "AMR-BR").first()
        sambhaji_br = db.query(Location).filter(Location.code == "AUR-BR").first()
        chandrapur_br = db.query(Location).filter(Location.code == "CHND-BR").first()
        ratnagiri_br = db.query(Location).filter(Location.code == "RAT-BR").first()
        nashik_br = db.query(Location).filter(Location.code == "NSK-BR").first()
        nanded_br = db.query(Location).filter(Location.code == "NAD-BR").first()
        nagpur_br = db.query(Location).filter(Location.code == "NAG-BR").first()
        kolhapur_br = db.query(Location).filter(Location.code == "KOL-BR").first()
        dhule_br = db.query(Location).filter(Location.code == "DHU-BR").first()

        # Create branch locations if missing (existing DBs may lack new branches)
        if not ratnagiri_br:
            ratnagiri_br = Location(
                name="Ratnagiri Branch",
                code="RAT-BR",
                type="BR",
                address="Ratnagiri, Maharashtra",
                is_primary=False,
                is_active=True
            )
            db.add(ratnagiri_br)
            db.commit()
            db.refresh(ratnagiri_br)
        ratnagiri_br_id = ratnagiri_br.id if ratnagiri_br else None

        if not nashik_br:
            nashik_br = Location(
                name="Nashik Branch",
                code="NSK-BR",
                type="BR",
                address="Nashik, Maharashtra",
                is_primary=False,
                is_active=True
            )
            db.add(nashik_br)
            db.commit()
            db.refresh(nashik_br)
        nashik_br_id = nashik_br.id if nashik_br else None

        if not nanded_br:
            nanded_br = Location(
                name="Nanded Branch",
                code="NAD-BR",
                type="BR",
                address="Nanded, Maharashtra",
                is_primary=False,
                is_active=True
            )
            db.add(nanded_br)
            db.commit()
            db.refresh(nanded_br)
        nanded_br_id = nanded_br.id if nanded_br else None

        if not nagpur_br:
            nagpur_br = Location(
                name="Nagpur Branch",
                code="NAG-BR",
                type="BR",
                address="Nagpur, Maharashtra",
                is_primary=False,
                is_active=True
            )
            db.add(nagpur_br)
            db.commit()
            db.refresh(nagpur_br)
        nagpur_br_id = nagpur_br.id if nagpur_br else None

        if not kolhapur_br:
            kolhapur_br = Location(
                name="Kolhapur Branch",
                code="KOL-BR",
                type="BR",
                address="Kolhapur, Maharashtra",
                is_primary=False,
                is_active=True
            )
            db.add(kolhapur_br)
            db.commit()
            db.refresh(kolhapur_br)
        kolhapur_br_id = kolhapur_br.id if kolhapur_br else None

        if not dhule_br:
            dhule_br = Location(
                name="Dhule Branch",
                code="DHU-BR",
                type="BR",
                address="Dhule, Maharashtra",
                is_primary=False,
                is_active=True
            )
            db.add(dhule_br)
            db.commit()
            db.refresh(dhule_br)
        dhule_br_id = dhule_br.id if dhule_br else None

        pune_dc_id = pune_dc.id if pune_dc else None
        pune_br_id = pune_br.id if pune_br else None
        mumbai_br_id = mumbai_br.id if mumbai_br else None
        thane_br_id = thane_br.id if thane_br else None
        amravati_br_id = amravati_br.id if amravati_br else None
        sambhaji_br_id = sambhaji_br.id if sambhaji_br else None
        chandrapur_br_id = chandrapur_br.id if chandrapur_br else None
        ratnagiri_br_id = ratnagiri_br.id if ratnagiri_br else None
        nashik_br_id = nashik_br.id if nashik_br else None
        nanded_br_id = nanded_br.id if nanded_br else None
        nagpur_br_id = nagpur_br.id if nagpur_br else None
        kolhapur_br_id = kolhapur_br.id if kolhapur_br else None
        dhule_br_id = dhule_br.id if dhule_br else None

        device_count = db.query(DeviceItem).count()
        if device_count == 0:
            # DC Network Devices
            dc_network_devices = [
                DeviceItem(
                    device_name="Core Router 1",
                    hostname="FSL-DC-PUN-COR-RTR-01",
                    ip_address="10.0.11.11",
                    model="iEdge 1000",
                    version="InfinityOS 1.4-rolling-202301270808",
                    category="Network",
                    username="infinity",
                    password="@Infi@Labs",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Core Router 2",
                    hostname="FSL-DC-PUN-COR-RTR-02",
                    ip_address="10.0.11.12",
                    model="iEdge 1000",
                    version="InfinityOS 1.4-rolling-202301270808",
                    category="Network",
                    username="infinity",
                    password="@Infi@Labs",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Internet Router 1-TCL",
                    hostname="FSL-DC-PUN-INT-RTR-01",
                    ip_address="10.0.11.13",
                    model="iEdge 1000",
                    version="InfinityOS 1.4-rolling-202301270808",
                    category="Network",
                    username="infinity",
                    password="@Infi@Labs",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Internet Router 2-JIO",
                    hostname="FSL-DC-PUN-INT-RTR-02",
                    ip_address="10.0.11.14",
                    model="iEdge 1000",
                    version="InfinityOS 1.4-rolling-202301270808",
                    category="Network",
                    username="infinity",
                    password="@Infi@Labs",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="DMZ Switch 1",
                    hostname="FSL-DC-PUN-DMZ-SW01",
                    ip_address="10.0.11.21",
                    model="C93180YC-FX3H-Nexus 9000",
                    version="10.4(4)",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="DMZ Switch 2",
                    hostname="FSL-DC-PUN-DMZ-SW02",
                    ip_address="10.0.11.22",
                    model="C93180YC-FX3H-Nexus 9000",
                    version="10.4(4)",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="OOB Switch 1",
                    hostname="FSL-DC-PUN-OOB-R1-SW01",
                    ip_address="10.0.11.19",
                    model="C9200L-48T",
                    version="17.12.04",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="OOB Switch 2",
                    hostname="FSL-DC-PUN-OOB-R2-SW01",
                    ip_address="10.0.11.20",
                    model="C9200L-48T",
                    version="17.12.04",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="WAN Switch 1",
                    hostname="FSL-DC-PUN-WAN-SW01",
                    ip_address="10.0.11.25",
                    model="C9200L-24T",
                    version="17.12.04",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="WAN Switch 2",
                    hostname="FSL-DC-PUN-WAN-SW02",
                    ip_address="10.0.11.26",
                    model="C9200L-24T",
                    version="17.12.04",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Leaf Switch 1",
                    hostname="FSL-DC-PUN-SLF-SW01",
                    ip_address="10.0.11.17",
                    model="C93180YC-FX3H-Nexus 9000",
                    version="10.4(4)",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Leaf Switch 2",
                    hostname="FSL-DC-PUN-SLF-SW02",
                    ip_address="10.0.11.18",
                    model="C93180YC-FX3H-Nexus 9000",
                    version="10.4(4)",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Spine Switch 1",
                    hostname="FSL-DC-PUN-SPN-SW01",
                    ip_address="10.0.11.15",
                    model="C93180YC-FX3H-Nexus 9000",
                    version="10.4(4)",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Spine Switch 2",
                    hostname="FSL-DC-PUN-SPN-SW02",
                    ip_address="10.0.11.16",
                    model="C93180YC-FX3H-Nexus 9000",
                    version="10.4(4)",
                    category="Network",
                    username="netadmin",
                    password="Rf$l@2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
            ]

            # DC Security Devices
            dc_security_devices = [
                DeviceItem(
                    device_name="Web Application Firewall 1",
                    hostname="FSL-DC-PUN-AVX-WAF-01",
                    ip_address="10.0.11.53",
                    model="Array AVX 7900",
                    version="AVX Rel.AVX.2.7.2.9",
                    category="Security",
                    username="array",
                    password="admin",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Web Application Firewall 2",
                    hostname="FSL-DC-PUN-AVX-WAF-02",
                    ip_address="10.0.11.54",
                    model="Array AVX 7900",
                    version="AVX Rel.AVX.2.7.2.10",
                    category="Security",
                    username="array",
                    password="admin",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Primary Firewall",
                    hostname="FSL-DC-PUN-PRI-FW-01",
                    ip_address="10.0.11.35",
                    model="FortiGate 1001F",
                    version="v7.2.8",
                    category="Security",
                    username="admin",
                    password="ASdf#12$",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="Secondary Firewall",
                    hostname="FSL-DC-PUN-SEC-FW-02",
                    ip_address="10.0.11.36",
                    model="FortiGate 1001F",
                    version="v7.2.8",
                    category="Security",
                    username="admin",
                    password="ASdf#12$",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="FortiManager 1",
                    hostname="FSL-DC-PUN-FGT-MGR-01",
                    ip_address="10.0.11.39",
                    model="FMG-200F",
                    version="v7.2.7",
                    category="Security",
                    username="admin",
                    password="ENcr#12$",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="FortiManager 2",
                    hostname="FSL-DC-PUN-FGT-MGR-02",
                    ip_address="10.0.11.40",
                    model="FMG-200F",
                    version="v7.2.7",
                    category="Security",
                    username="admin",
                    password="",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="FortiAnalyzer 1",
                    hostname="FSL-DC-PUN-FGT-ANZ-01",
                    ip_address="10.0.11.41",
                    model="FAZ-300G",
                    version="v7.2.7",
                    category="Security",
                    username="admin",
                    password="ENcr#12$",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="FortiAnalyzer 2",
                    hostname="FSL-DC-PUN-FGT-ANZ-02",
                    ip_address="10.0.11.42",
                    model="FAZ-300G",
                    version="v7.2.7",
                    category="Security",
                    username="admin",
                    password="",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="FortiToken 1",
                    hostname="FSL-DC-PUN-PRI-FAC",
                    ip_address="10.0.11.43",
                    model="FortiAuthenticator 300F",
                    version="v6.2.0, build5118",
                    category="Security",
                    username="admin",
                    password="FSL@DC2024",
                    location_id=pune_dc_id,
                    status="Active"
                ),
                DeviceItem(
                    device_name="FortiToken 2",
                    hostname="FSL-DC-PUN-SEC-FAC",
                    ip_address="10.0.11.44",
                    model="FortiAuthenticator 300F",
                    version="v6.2.0, build5118",
                    category="Security",
                    username="admin",
                    password="",
                    location_id=pune_dc_id,
                    status="Active"
                ),
            ]

            # Pune DC Compute/Servers
            dc_compute_devices = [
                DeviceItem(device_name="Server Node CLS-01-1", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.23", serial_number="957JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-2", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.24", serial_number="B57JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-3", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.25", serial_number="G57JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-4", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.26", serial_number="C57JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-5", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.27", serial_number="857JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-6", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.28", serial_number="757JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-7", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.29", serial_number="D57JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-01-8", hostname="FSL-PUN-DC-CLS-01", ip_address="10.0.6.30", serial_number="F57JL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-02-1", hostname="FSL-PUN-DC-CLS-02", ip_address="10.0.6.31", serial_number="GYYHL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-02-2", hostname="FSL-PUN-DC-CLS-02", ip_address="10.0.6.32", serial_number="HYYHL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-02-3", hostname="FSL-PUN-DC-CLS-02", ip_address="10.0.6.33", serial_number="JYYHL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-02-4", hostname="FSL-PUN-DC-CLS-02", ip_address="10.0.6.34", serial_number="CYYHL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-02-5", hostname="FSL-PUN-DC-CLS-02", ip_address="10.0.6.35", serial_number="DYYHL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-02-6", hostname="FSL-PUN-DC-CLS-02", ip_address="10.0.6.36", serial_number="FYYHL24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-03-1", hostname="FSL-PUN-DC-CLS-03", ip_address="10.0.6.39", serial_number="1Q8GY24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-03-2", hostname="FSL-PUN-DC-CLS-03", ip_address="10.0.6.40", serial_number="2Q8GY24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-03-3", hostname="FSL-PUN-DC-CLS-03", ip_address="10.0.6.41", serial_number="3Q8GY24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-03-4", hostname="FSL-PUN-DC-CLS-03", ip_address="10.0.6.42", serial_number="HP8GY24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
                DeviceItem(device_name="Server Node CLS-03-5", hostname="FSL-PUN-DC-CLS-03", ip_address="10.0.6.43", serial_number="JP8GY24", category="Compute", model="Dell PowerEdge MX750c", location_id=pune_dc_id, status="Active"),
            ]

            # Pune Branch Network Devices
            pune_branch_devices = [
                DeviceItem(device_name="Pune Primary Router", hostname="FSL-BR-PUN-COR-RTR-01", ip_address="10.2.85.11", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Secondary Router", hostname="FSL-BR-PUN-COR-RTR-02", ip_address="10.2.85.12", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Firewall 1", hostname="FSL-BR-PUN-FGT-FW-01", ip_address="10.2.85.1", category="Security", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Firewall 2", hostname="FSL-BR-PUN-FGT-FW-02", ip_address="", category="Security", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Agg Switch R1-01", hostname="FSL-BR-PUN-AGG-R1-SW-01", ip_address="10.2.85.13", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Agg Switch R2-01", hostname="FSL-BR-PUN-AGG-R2-SW-01", ip_address="10.2.85.14", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Agg Switch R1-02", hostname="FSL-BR-PUN-AGG-R1-SW-02", ip_address="10.2.85.37", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune Agg Switch R2-02", hostname="FSL-BR-PUN-AGG-R2-SW-02", ip_address="10.2.85.38", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R1 Switch 01", hostname="FSL-BR-PUN-GRD-B1R1-SW01", ip_address="10.2.85.15", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R1 Switch 02", hostname="FSL-BR-PUN-GRD-B1R1-SW02", ip_address="10.2.85.16", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R1 PoE Switch", hostname="FSL-BR-PUN-GRD-B1R1-POE-SW01", ip_address="10.2.85.29", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R2 Switch 01", hostname="FSL-BR-PUN-GRD-B1R2-SW01", ip_address="10.2.85.17", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R2 Switch 02", hostname="FSL-BR-PUN-GRD-B1R2-SW02", ip_address="10.2.85.18", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R2 PoE Switch", hostname="FSL-BR-PUN-GRD-B1R2-POE-SW01", ip_address="10.2.85.30", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R3 Switch 01", hostname="FSL-BR-PUN-GRD-B1R3-SW01", ip_address="10.2.85.19", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R3 Switch 02", hostname="FSL-BR-PUN-GRD-B1R3-SW02", ip_address="10.2.85.20", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B1R3 PoE Switch", hostname="FSL-BR-PUN-GRD-B1R3-POE-SW01", ip_address="10.2.85.31", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R1 Switch 01", hostname="FSL-BR-PUN-FRS-B1R1-SW01", ip_address="10.2.85.21", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R1 Switch 02", hostname="FSL-BR-PUN-FRS-B1R1-SW02", ip_address="10.2.85.22", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R1 PoE Switch", hostname="FSL-BR-PUN-FRS-B1R1-POE-SW01", ip_address="10.2.85.32", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R1 Switch 03", hostname="FSL-BR-PUN-FRS-B1R1-SW03", ip_address="10.2.85.23", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R2 Switch 01", hostname="FSL-BR-PUN-FRS-B1R2-SW01", ip_address="10.2.85.24", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R2 PoE Switch", hostname="FSL-BR-PUN-FRS-B1R2-POE-SW01", ip_address="10.2.85.33", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R2 Switch 02", hostname="FSL-BR-PUN-FRS-B1R2-SW02", ip_address="10.2.85.25", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R3 Switch 01", hostname="FSL-BR-PUN-FRS-B1R3-SW01", ip_address="10.2.85.26", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune FRS B1R3 PoE Switch", hostname="FSL-BR-PUN-FRS-B1R3-POE-SW01", ip_address="10.2.85.34", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune CBR B2R1 Switch 01", hostname="FSL-BR-PUN-CBR-B2R1-SW01", ip_address="10.2.85.27", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B2R1 PoE Switch", hostname="FSL-BR-PUN-GRD-B2R1-POE-SW01", ip_address="10.2.85.35", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B2R2 Switch 01", hostname="FSL-BR-PUN-GRD-B2R2-SW01", ip_address="10.2.85.28", category="Network", location_id=pune_br_id, status="Active"),
                DeviceItem(device_name="Pune GRD B2R2 PoE Switch", hostname="FSL-BR-PUN-GRD-B2R2-POE-SW01", ip_address="10.2.85.36", category="Network", location_id=pune_br_id, status="Active"),
            ]

            # Mumbai Branch Network Devices
            mumbai_branch_devices = [
                DeviceItem(device_name="Mumbai Primary Router", hostname="FSL-BR-MUM-COR-RTR-01", ip_address="10.2.21.11", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Secondary Router", hostname="FSL-BR-MUM-COR-RTR-02", ip_address="10.2.21.12", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Firewall 1", hostname="FSL-BR-MUM-FGT-FW-01", ip_address="10.2.21.1", category="Security", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Firewall 2", hostname="FSL-BR-MUM-FGT-FW-02", ip_address="", category="Security", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 01", hostname="FSL-BR-MUM-SW-01", ip_address="10.2.21.15", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 02", hostname="FSL-BR-MUM-SW-02", ip_address="10.2.21.16", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 03", hostname="FSL-BR-MUM-SW-03", ip_address="10.2.21.17", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 04", hostname="FSL-BR-MUM-SW-04", ip_address="10.2.21.18", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 05", hostname="FSL-BR-MUM-SW-05", ip_address="10.2.21.21", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 06", hostname="FSL-BR-MUM-SW-06", ip_address="10.2.21.22", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 07", hostname="FSL-BR-MUM-SW-07", ip_address="10.2.21.23", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 08", hostname="FSL-BR-MUM-SW-08", ip_address="10.2.21.24", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 09", hostname="FSL-BR-MUM-SW-09", ip_address="10.2.21.25", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 10", hostname="FSL-BR-MUM-SW-10", ip_address="10.2.21.26", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 11", hostname="FSL-BR-MUM-SW-11", ip_address="10.2.21.27", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 12", hostname="FSL-BR-MUM-SW-12", ip_address="10.2.21.28", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 13", hostname="FSL-BR-MUM-SW-13", ip_address="10.2.21.29", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 14", hostname="FSL-BR-MUM-SW-14", ip_address="10.2.21.30", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 15", hostname="FSL-BR-MUM-SW-15", ip_address="10.2.21.31", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 16", hostname="FSL-BR-MUM-SW-16", ip_address="10.2.21.32", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 17", hostname="FSL-BR-MUM-SW-17", ip_address="10.2.21.33", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 18", hostname="FSL-BR-MUM-SW-18", ip_address="10.2.21.34", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 19", hostname="FSL-BR-MUM-SW-19", ip_address="10.2.21.35", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 20", hostname="FSL-BR-MUM-SW-20", ip_address="10.2.21.36", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 21", hostname="FSL-BR-MUM-SW-21", ip_address="10.2.21.37", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 22", hostname="FSL-BR-MUM-SW-22", ip_address="10.2.21.38", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 23", hostname="FSL-BR-MUM-SW-23", ip_address="10.2.21.38", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 24", hostname="FSL-BR-MUM-SW-24", ip_address="10.2.21.39", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 25", hostname="FSL-BR-MUM-SW-25", ip_address="10.2.21.40", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai Switch 26", hostname="FSL-BR-MUM-SW-26", ip_address="10.2.21.41", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 01", hostname="FSL-BR-MUM-POE-SW-01", ip_address="10.2.21.42", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 02", hostname="FSL-BR-MUM-POE-SW-02", ip_address="10.2.21.43", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 03", hostname="FSL-BR-MUM-POE-SW-03", ip_address="10.2.21.44", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 04", hostname="FSL-BR-MUM-POE-SW-04", ip_address="10.2.21.45", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 05", hostname="FSL-BR-MUM-POE-SW-05", ip_address="10.2.21.46", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 06", hostname="FSL-BR-MUM-POE-SW-06", ip_address="10.2.21.47", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 07", hostname="FSL-BR-MUM-POE-SW-07", ip_address="10.2.21.48", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 08", hostname="FSL-BR-MUM-POE-SW-08", ip_address="10.2.21.49", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 09", hostname="FSL-BR-MUM-POE-SW-09", ip_address="10.2.21.50", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 10", hostname="FSL-BR-MUM-POE-SW-10", ip_address="10.2.21.51", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 11", hostname="FSL-BR-MUM-POE-SW-11", ip_address="10.2.21.52", category="Network", location_id=mumbai_br_id, status="Active"),
                DeviceItem(device_name="Mumbai PoE Switch 12", hostname="FSL-BR-MUM-POE-SW-12", ip_address="10.2.21.53", category="Network", location_id=mumbai_br_id, status="Active"),
            ]

            # Thane Branch Network Devices
            thane_branch_devices = [
                DeviceItem(device_name="Thane Primary Router", hostname="FSL-BR-THA-COR-RTR-01", ip_address="10.4.21.11", category="Network", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane Secondary Router", hostname="FSL-BR-THA-COR-RTR-02", ip_address="10.4.21.12", category="Network", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane Firewall 1", hostname="FSL-BR-THA-FGT-FW-01", ip_address="10.4.21.1", category="Security", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane Firewall 2", hostname="FSL-BR-THA-FGT-FW-02", ip_address="", category="Security", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane Agg Switch R1-01", hostname="FSL-BR-THA-AGG-R1-SW01", ip_address="10.4.21.15", category="Network", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane Agg Switch R2-01", hostname="FSL-BR-THA-AGG-R2-SW01", ip_address="10.4.21.16", category="Network", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane FRS Switch R1-01", hostname="FSL-BR-THA-FRS-R1-SW01", ip_address="10.4.21.17", category="Network", location_id=thane_br_id, status="Active"),
                DeviceItem(device_name="Thane FRS PoE Switch R1-01", hostname="FSL-BR-THA-FRS-R1-POE-SW01", ip_address="10.4.21.18", category="Network", location_id=thane_br_id, status="Active"),
            ]

            # Amravati Branch Network Devices
            amravati_branch_devices = [
                DeviceItem(device_name="Amravati Primary Router", hostname="FSL-BR-AMR-COR-RTR-01", ip_address="10.3.85.11", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Secondary Router", hostname="FSL-BR-AMR-COR-RTR-02", ip_address="10.3.85.12", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Firewall 1", hostname="FSL-BR-AMR-FGT-FW-01", ip_address="10.3.85.1", category="Security", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Firewall 2", hostname="FSL-BR-AMR-FGT-FW-02", ip_address="", category="Security", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Agg Switch R1-01", hostname="FSL-BR-AMR-AGG-R1-SW01", ip_address="10.3.85.15", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Agg Switch R2-01", hostname="FSL-BR-AMR-AGG-R2-SW01", ip_address="10.3.85.16", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Agg Switch R1-02", hostname="FSL-BR-AMR-AGG-R1-SW02", ip_address="10.3.85.17", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati Agg Switch R2-02", hostname="FSL-BR-AMR-AGG-R2-SW02", ip_address="10.3.85.18", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati GRD PoE Switch R1-01", hostname="FSL-BR-AMR-GRD-R1-SW01", ip_address="10.3.85.27", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati FRS Switch R1-01", hostname="FSL-BR-AMR-FRS-R1-SW01", ip_address="10.3.85.19", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati FRS Switch R1-02", hostname="FSL-BR-AMR-FRS-R1-SW02", ip_address="10.3.85.20", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati FRS PoE Switch R1-01", hostname="FSL-BR-AMR-FRS-R1-POE-SW01", ip_address="10.3.85.21", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati SEC Switch R1-01", hostname="FSL-BR-AMR-SEC-R1-SW01", ip_address="10.3.85.22", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati SEC Switch R1-02", hostname="FSL-BR-AMR-SEC-R1-SW02", ip_address="10.3.85.26", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati SEC PoE Switch R1-01", hostname="FSL-BR-AMR-SEC-R1-POE-SW01", ip_address="10.3.85.23", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati TRD Switch R1-01", hostname="FSL-BR-AMR-TRD-R1-SW01", ip_address="10.3.85.24", category="Network", location_id=amravati_br_id, status="Active"),
                DeviceItem(device_name="Amravati TRD PoE Switch R1-01", hostname="FSL-BR-AMR-TRD-R1-POE-SW01", ip_address="10.3.85.25", category="Network", location_id=amravati_br_id, status="Active"),
            ]

            # Sambhaji Nagar Branch Network Devices
            sambhaji_branch_devices = [
                DeviceItem(device_name="Sambhaji Nagar Primary Router", hostname="FSL-BR-AUR-COR-RTR-01", ip_address="10.3.21.11", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Secondary Router", hostname="FSL-BR-AUR-COR-RTR-02", ip_address="10.3.21.12", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Firewall 1", hostname="FSL-BR-AUR-FGT-FW-01", ip_address="10.3.21.1", category="Security", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Firewall 2", hostname="FSL-BR-AUR-FGT-FW-02", ip_address="", category="Security", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Agg Switch R1-01", hostname="FSL-BR-AUR-AGG-R1-SW01", ip_address="10.3.21.15", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Agg Switch R2-01", hostname="FSL-BR-AUR-AGG-R2-SW01", ip_address="10.3.21.16", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Agg Switch R1-02", hostname="FSL-BR-AUR-AGG-R1-SW02", ip_address="10.3.21.17", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar Agg Switch R2-02", hostname="FSL-BR-AUR-AGG-R2-SW02", ip_address="10.3.21.18", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar GRD Switch B1R1-01", hostname="FSL-BR-AUR-GRD-B1R1-SW01", ip_address="10.3.21.19", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar GRD Switch B1R1-02", hostname="FSL-BR-AUR-GRD-B1R1-SW02", ip_address="10.3.21.20", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar GRD PoE Switch B1R1-01", hostname="FSL-BR-AUR-GRD-B1R1-POE-SW01", ip_address="10.3.21.21", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar FRS Switch B1R1-01", hostname="FSL-BR-AUR-FRS-B1R1-SW01", ip_address="10.3.21.22", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar FRS Switch B1R1-02", hostname="FSL-BR-AUR-FRS-B1R1-SW02", ip_address="10.3.21.23", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar FRS PoE Switch B1R1-01", hostname="FSL-BR-AUR-FRS-B1R1-POE-SW01", ip_address="10.3.21.24", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar SEC Switch B1R1-01", hostname="FSL-BR-AUR-SEC-B1R1-SW01", ip_address="10.3.21.25", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar SEC PoE Switch B1R1-01", hostname="FSL-BR-AUR-SEC-B1R1-POE-SW01", ip_address="10.3.21.26", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar GRD Switch B2R1-01", hostname="FSL-BR-AUR-GRD-B2R1-SW01", ip_address="10.3.21.27", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar GRD PoE Switch B2R1-01", hostname="FSL-BR-AUR-GRD-B2R1-POE-SW01", ip_address="10.3.21.28", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar FRS Switch B2R1-01", hostname="FSL-BR-AUR-FRS-B2R1-SW01", ip_address="10.3.21.29", category="Network", location_id=sambhaji_br_id, status="Active"),
                DeviceItem(device_name="Sambhaji Nagar FRS PoE Switch B2R1-01", hostname="FSL-BR-AUR-FRS-B2R1-POE-SW01", ip_address="10.3.21.30", category="Network", location_id=sambhaji_br_id, status="Active"),
            ]

            # Chandrapur Branch Network Devices
            chandrapur_branch_devices = [
                DeviceItem(device_name="Chandrapur Primary Router", hostname="FSL-BR-CHND-COR-RTR-01", ip_address="10.4.213.11", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur Secondary Router", hostname="FSL-BR-CHND-COR-RTR-02", ip_address="10.4.213.12", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur Firewall 1", hostname="FSL-BR-CHND-FGT-FW-01", ip_address="10.4.213.1", category="Security", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur Firewall 2", hostname="FSL-BR-CHND-FGT-FW-02", ip_address="", category="Security", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur Agg Switch R1-01", hostname="FSL-BR-CHND-AGG-R1-SW01", ip_address="10.4.213.15", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur Agg Switch R2-01", hostname="FSL-BR-CHND-AGG-R2-SW01", ip_address="10.4.213.16", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur FRS Switch R1-01", hostname="FSL-BR-CHD-FRS-R1-SW01", ip_address="10.4.213.19", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur FRS PoE Switch R1-01", hostname="FSL-BR-CHD-FRS-R1-POE", ip_address="10.4.213.20", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur THD Switch R1-01", hostname="FSL-BR-CHD-THD-R1-SW01", ip_address="10.4.213.21", category="Network", location_id=chandrapur_br_id, status="Active"),
                DeviceItem(device_name="Chandrapur THD PoE Switch R1-01", hostname="FSL-BR-CHD-THD-R1-POE", ip_address="10.4.213.22", category="Network", location_id=chandrapur_br_id, status="Active"),
            ]

            # Ratnagiri Branch Network Devices
            ratnagiri_branch_devices = [
                DeviceItem(device_name="Ratnagiri Primary Router", hostname="FSL-BR-RAT-COR-RTR-01", ip_address="10.4.85.11", category="Network", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri Secondary Router", hostname="FSL-BR-RAT-COR-RTR-02", ip_address="10.4.85.12", category="Network", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri Firewall 1", hostname="FSL-BR-RAT-FGT-FW-01", ip_address="10.4.85.1", category="Security", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri Firewall 2", hostname="FSL-BR-RAT-FGT-FW-02", ip_address="", category="Security", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri Agg Switch R1-01", hostname="FSL-BR-RAT-AGG-R1-SW01", ip_address="10.4.85.15", category="Network", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri Agg Switch R2-01", hostname="FSL-BR-RAT-AGG-R2-SW01", ip_address="10.4.85.16", category="Network", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri FRS R1 Switch 01", hostname="FSL-BR-RAT-FRS-R1-SW01", ip_address="10.4.85.17", category="Network", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri FRS R1 PoE Switch 01", hostname="FSL-BR-RAT-FRS-R1-POE-SW01", ip_address="10.4.85.18", category="Network", location_id=ratnagiri_br_id, status="Active"),
                DeviceItem(device_name="Ratnagiri SEC R1 PoE Switch 01", hostname="FSL-BR-RAT-SEC-R1-POE-SW01", ip_address="10.4.85.19", category="Network", location_id=ratnagiri_br_id, status="Active"),
            ]

            # Nashik Branch Network Devices
            nashik_branch_devices = [
                DeviceItem(device_name="Nashik Primary Router", hostname="FSL-BR-NSK-COR-RTR-01", ip_address="10.2.213.11", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Secondary Router", hostname="FSL-BR-NSK-COR-RTR-02", ip_address="10.2.213.12", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Firewall 1", hostname="FSL-BR-NSK-FGT-FW-01", ip_address="10.2.213.1", category="Security", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Firewall 2", hostname="FSL-BR-NSK-FGT-FW-02", ip_address="", category="Security", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Agg Switch R1-01", hostname="FSL-BR-NSK-AGG-R1-SW01", ip_address="10.2.213.15", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Agg Switch R2-01", hostname="FSL-BR-NSK-AGG-R2-SW01", ip_address="10.2.213.16", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Agg Switch R1-02", hostname="FSL-BR-NSK-AGG-R1-SW02", ip_address="10.2.213.17", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik Agg Switch R2-02", hostname="FSL-BR-NSK-AGG-R2-SW02", ip_address="10.2.213.18", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik GRD R1 Switch 01", hostname="FSL-BR-NSK-GRD-R1-SW01", ip_address="10.2.213.19", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik GRD R1 Switch 02", hostname="FSL-BR-NSK-GRD-R1-SW02", ip_address="10.2.213.20", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik GRD R1 PoE Switch 01", hostname="FSL-BR-NSK-GRD-R1-POE-SW01", ip_address="10.2.213.21", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik GRD R2 Switch 01", hostname="FSL-BR-NSK-GRD-R2-SW01", ip_address="10.2.213.22", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik GRD R2 Switch 02", hostname="FSL-BR-NSK-GRD-R2-SW02", ip_address="10.2.213.23", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik GRD R2 PoE Switch 01", hostname="FSL-BR-NSK-GRD-R2-POE-SW01", ip_address="10.2.213.24", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik FRS R1 Switch 01", hostname="FSL-BR-NSK-FRS-R1-SW01", ip_address="10.2.213.25", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik FRS R1 Switch 02", hostname="FSL-BR-NSK-FRS-R1-SW02", ip_address="10.2.213.26", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik FRS R1 PoE Switch 01", hostname="FSL-BR-NSK-FRS-R1-POE-SW01", ip_address="10.2.213.27", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik FRS R2 Switch 01", hostname="FSL-BR-NSK-FRS-R2-SW01", ip_address="10.2.213.28", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik FRS R2 Switch 02", hostname="FSL-BR-NSK-FRS-R2-SW02", ip_address="10.2.213.29", category="Network", location_id=nashik_br_id, status="Active"),
                DeviceItem(device_name="Nashik FRS R2 PoE Switch 01", hostname="FSL-BR-NSK-FRS-R2-POE-SW01", ip_address="10.2.213.30", category="Network", location_id=nashik_br_id, status="Active"),
            ]

            # Nanded Branch Network Devices
            nanded_branch_devices = [
                DeviceItem(device_name="Nanded Primary Router", hostname="FSL-BR-NAD-COR-RTR-01", ip_address="10.3.149.11", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded Secondary Router", hostname="FSL-BR-NAD-COR-RTR-02", ip_address="10.3.149.12", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded Firewall 1", hostname="FSL-BR-NAD-FGT-FW-01", ip_address="10.3.149.1", category="Security", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded Firewall 2", hostname="FSL-BR-NAD-FGT-FW-02", ip_address="", category="Security", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded Agg Switch R1-01", hostname="FSL-BR-NAD-AGG-R1-SW01", ip_address="10.3.149.15", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded Agg Switch R2-01", hostname="FSL-BR-NAD-AGG-R2-SW01", ip_address="10.3.149.16", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC Switch R1-01", hostname="FSL-BR-NAD-SEC-R1-SW01", ip_address="10.3.149.17", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC Switch R1-02", hostname="FSL-BR-NAD-SEC-R1-SW02", ip_address="10.3.149.18", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC PoE Switch R1-01", hostname="FSL-BR-NAD-SEC-R1-POE-SW01", ip_address="10.3.149.19", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC Switch R2-01", hostname="FSL-BR-NAD-SEC-R2-SW01", ip_address="10.3.149.20", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC PoE Switch R2-01", hostname="FSL-BR-NAD-SEC-R2-POE-SW01", ip_address="10.3.149.21", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC Switch R3-01", hostname="FSL-BR-NAD-SEC-R3-SW01", ip_address="10.3.149.22", category="Network", location_id=nanded_br_id, status="Active"),
                DeviceItem(device_name="Nanded SEC PoE Switch R3-01", hostname="FSL-BR-NAD-SEC-R3-POE-SW01", ip_address="10.3.149.23", category="Network", location_id=nanded_br_id, status="Active"),
            ]

            # Nagpur Branch Network Devices
            nagpur_branch_devices = [
                DeviceItem(device_name="Nagpur Primary Router", hostname="FSL-BR-NAG-COR-RTR-01", ip_address="10.2.149.11", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Secondary Router", hostname="FSL-BR-NAG-COR-RTR-02", ip_address="10.2.149.12", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Firewall 1", hostname="FSL-BR-NAG-FGT-FW-01", ip_address="10.2.149.1", category="Security", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Firewall 2", hostname="FSL-BR-NAG-FGT-FW-02", ip_address="", category="Security", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Agg Switch R1-01", hostname="FSL-BR-NAG-AGG-R1-SW01", ip_address="10.2.149.15", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Agg Switch R2-01", hostname="FSL-BR-NAG-AGG-R2-SW01", ip_address="10.2.149.16", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Agg Switch R1-02", hostname="FSL-BR-NAG-AGG-R1-SW02", ip_address="10.2.149.17", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur Agg Switch R2-02", hostname="FSL-BR-NAG-AGG-R2-SW02", ip_address="10.2.149.18", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur GRD R1 Switch 01", hostname="FSL-BR-NAG-GRD-R1-SW01", ip_address="10.2.149.19", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur GRD R1 PoE Switch 01", hostname="FSL-BR-NAG-GRD-R1-POE-SW01", ip_address="10.2.149.20", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur GRD R2 Switch 01", hostname="FSL-BR-NAG-GRD-R2-SW01", ip_address="10.2.149.21", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur GRD R2 Switch 02", hostname="FSL-BR-NAG-GRD-R2-SW02", ip_address="10.2.149.22", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur GRD R2 PoE Switch 01", hostname="FSL-BR-NAG-GRD-R2-POE-SW01", ip_address="10.2.149.23", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur FST R1 Switch 01", hostname="FSL-BR-NAG-FST-R1-SW01", ip_address="10.2.149.24", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur FST R1 Switch 02", hostname="FSL-BR-NAG-FST-R1-SW02", ip_address="10.2.149.25", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur FST R1 PoE Switch 01", hostname="FSL-BR-NAG-FST-R1-POE-SW01", ip_address="10.2.149.26", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur FST R2 Switch 01", hostname="FSL-BR-NGP-FST-R2-SW01", ip_address="10.2.149.27", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur FST R2 Switch 02", hostname="FSL-BR-NGP-FST-R2-SW02", ip_address="10.2.149.28", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur FST R2 PoE Switch 01", hostname="FSL-BR-NAG-FST-R2-POE-SW01", ip_address="10.2.149.29", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur SEC R1 Switch 01", hostname="FSL-BR-NAG-SEC-R1-SW01", ip_address="10.2.149.30", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur SEC R1 Switch 02", hostname="FSL-BR-NAG-SEC-R1-SW02", ip_address="10.2.149.31", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur SEC R1 Switch 03", hostname="FSL-BR-NAG-SEC-R1-SW03", ip_address="10.2.149.32", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur SEC R1 PoE Switch 01", hostname="FSL-BR-NAG-SEC-R1-POE-SW01", ip_address="10.2.149.33", category="Network", location_id=nagpur_br_id, status="Active"),
                DeviceItem(device_name="Nagpur SEC Server PoE Switch 01", hostname="FSL-BR-NAG-SEC-SER-POE-SW01", ip_address="10.2.149.34", category="Network", location_id=nagpur_br_id, status="Active"),
            ]

            # Kolhapur Branch Network Devices
            kolhapur_branch_devices = [
                DeviceItem(device_name="Kolhapur Primary Router", hostname="FSL-BR-KOL-COR-RTR-01", ip_address="10.3.213.11", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Secondary Router", hostname="FSL-BR-KOL-COR-RTR-02", ip_address="10.3.213.12", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Firewall 1", hostname="FSL-BR-KOL-FGT-FW-01", ip_address="10.3.213.1", category="Security", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Firewall 2", hostname="FSL-BR-KOL-FGT-FW-02", ip_address="", category="Security", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Agg Switch R1-01", hostname="FSL-BR-KOL-AGG-R1-SW01", ip_address="10.3.213.15", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Agg Switch R2-01", hostname="FSL-BR-KOL-AGG-R2-SW01", ip_address="10.3.213.16", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Agg Switch R1-02", hostname="FSL-BR-KOL-AGG-R1-SW02", ip_address="10.3.213.17", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Agg Switch R2-02", hostname="FSL-BR-KOL-AGG-R2-SW02", ip_address="10.3.213.18", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur FST R1 Switch 01", hostname="FSL-BR-KOL-FST-R1-SW01", ip_address="10.3.213.19", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur FST R1 PoE Switch 01", hostname="FSL-BR-KOL-FST-R1-POE-SW01", ip_address="10.3.213.20", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur FST R1 PoE Switch 02", hostname="FSL-BR-KOL-FST-R1-POE-SW02", ip_address="10.3.213.21", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur SEC R1 Switch 01", hostname="FSL-BR-KOL-SEC-R1-SW01", ip_address="10.3.213.22", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur SEC R1 PoE Switch 01", hostname="FSL-BR-KOL-SEC-R1-POE-SW01", ip_address="10.3.213.23", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur TRD R1 Switch 01", hostname="FSL-BR-KOL-TRD-R1-SW01", ip_address="10.3.213.24", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur TRD R1 PoE Switch 01", hostname="FSL-BR-KOL-TRD-R1-POE-SW01", ip_address="10.3.213.25", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Fourth R1 Switch 01", hostname="FSL-BR-KOL-FOUTH-R1-SW01", ip_address="10.3.213.26", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Fourth R1 Switch 02", hostname="FSL-BR-KOL-FOUTH-R1-SW02", ip_address="10.3.213.29", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Fourth R1 PoE Switch 01", hostname="FSL-BR-KOL-FOUTH-R1-POE-SW01", ip_address="10.3.213.27", category="Network", location_id=kolhapur_br_id, status="Active"),
                DeviceItem(device_name="Kolhapur Fourth R1 PoE Switch 02", hostname="FSL-BR-KOL-FOUTH-R1-POE-SW02", ip_address="10.3.213.28", category="Network", location_id=kolhapur_br_id, status="Active"),
            ]

            # Dhule Branch Network Devices
            dhule_branch_devices = [
                DeviceItem(device_name="Dhule Primary Router", hostname="FSL-BR-DHU-COR-RTR-01", ip_address="10.5.21.11", category="Network", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule Secondary Router", hostname="FSL-BR-DHU-COR-RTR-02", ip_address="10.5.21.12", category="Network", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule Firewall 1", hostname="FSL-BR-DHU-FGT-FW-01", ip_address="10.5.21.1", category="Security", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule Firewall 2", hostname="FSL-BR-DHU-FGT-FW-02", ip_address="", category="Security", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule Agg Switch R1-01", hostname="FSL-BR-DHU-AGG-R1-SW01", ip_address="10.5.21.15", category="Network", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule Agg Switch R2-01", hostname="FSL-BR-DHU-AGG-R2-SW01", ip_address="10.5.21.16", category="Network", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule GRD R1 Switch 01", hostname="FSL-BR-DHU-GRD-R1-SW01", ip_address="10.5.21.17", category="Network", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule GRD R1 PoE Switch 01", hostname="FSL-BR-DHU-GRD-R1-POE-SW01", ip_address="10.5.21.18", category="Network", location_id=dhule_br_id, status="Active"),
                DeviceItem(device_name="Dhule GRD R1 PoE Switch 02", hostname="FSL-BR-DHU-GRD-R1-POE-SW02", ip_address="10.5.21.19", category="Network", location_id=dhule_br_id, status="Active"),
            ]

            # Add all devices
            all_devices = (
                dc_network_devices
                + dc_security_devices
                + dc_compute_devices
                + pune_branch_devices
                + mumbai_branch_devices
                + thane_branch_devices
                + amravati_branch_devices
                + sambhaji_branch_devices
                + chandrapur_branch_devices
                + ratnagiri_branch_devices
                + nashik_branch_devices
                + nanded_branch_devices
                + nagpur_branch_devices
                + kolhapur_branch_devices
                + dhule_branch_devices
            )
            for device in all_devices:
                db.add(device)
            db.commit()
            print(f"Created {len(all_devices)} sample device items")

        # Ensure Ratnagiri devices exist even if DB was already seeded
        if ratnagiri_br_id:
            ratnagiri_devices = [
                {"device_name": "Ratnagiri Primary Router", "hostname": "FSL-BR-RAT-COR-RTR-01", "ip_address": "10.4.85.11", "category": "Network", "status": "Active"},
                {"device_name": "Ratnagiri Secondary Router", "hostname": "FSL-BR-RAT-COR-RTR-02", "ip_address": "10.4.85.12", "category": "Network", "status": "Active"},
                {"device_name": "Ratnagiri Firewall 1", "hostname": "FSL-BR-RAT-FGT-FW-01", "ip_address": "10.4.85.1", "category": "Security", "status": "Active"},
                {"device_name": "Ratnagiri Firewall 2", "hostname": "FSL-BR-RAT-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Ratnagiri Agg Switch R1-01", "hostname": "FSL-BR-RAT-AGG-R1-SW01", "ip_address": "10.4.85.15", "category": "Network", "status": "Active"},
                {"device_name": "Ratnagiri Agg Switch R2-01", "hostname": "FSL-BR-RAT-AGG-R2-SW01", "ip_address": "10.4.85.16", "category": "Network", "status": "Active"},
                {"device_name": "Ratnagiri FRS R1 Switch 01", "hostname": "FSL-BR-RAT-FRS-R1-SW01", "ip_address": "10.4.85.17", "category": "Network", "status": "Active"},
                {"device_name": "Ratnagiri FRS R1 PoE Switch 01", "hostname": "FSL-BR-RAT-FRS-R1-POE-SW01", "ip_address": "10.4.85.18", "category": "Network", "status": "Active"},
                {"device_name": "Ratnagiri SEC R1 PoE Switch 01", "hostname": "FSL-BR-RAT-SEC-R1-POE-SW01", "ip_address": "10.4.85.19", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in ratnagiri_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=ratnagiri_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Ratnagiri device items")

        # Ensure Nashik devices exist
        if nashik_br_id:
            nashik_devices = [
                {"device_name": "Nashik Primary Router", "hostname": "FSL-BR-NSK-COR-RTR-01", "ip_address": "10.2.213.11", "category": "Network", "status": "Active"},
                {"device_name": "Nashik Secondary Router", "hostname": "FSL-BR-NSK-COR-RTR-02", "ip_address": "10.2.213.12", "category": "Network", "status": "Active"},
                {"device_name": "Nashik Firewall 1", "hostname": "FSL-BR-NSK-FGT-FW-01", "ip_address": "10.2.213.1", "category": "Security", "status": "Active"},
                {"device_name": "Nashik Firewall 2", "hostname": "FSL-BR-NSK-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Nashik Agg Switch R1-01", "hostname": "FSL-BR-NSK-AGG-R1-SW01", "ip_address": "10.2.213.15", "category": "Network", "status": "Active"},
                {"device_name": "Nashik Agg Switch R2-01", "hostname": "FSL-BR-NSK-AGG-R2-SW01", "ip_address": "10.2.213.16", "category": "Network", "status": "Active"},
                {"device_name": "Nashik Agg Switch R1-02", "hostname": "FSL-BR-NSK-AGG-R1-SW02", "ip_address": "10.2.213.17", "category": "Network", "status": "Active"},
                {"device_name": "Nashik Agg Switch R2-02", "hostname": "FSL-BR-NSK-AGG-R2-SW02", "ip_address": "10.2.213.18", "category": "Network", "status": "Active"},
                {"device_name": "Nashik GRD R1 Switch 01", "hostname": "FSL-BR-NSK-GRD-R1-SW01", "ip_address": "10.2.213.19", "category": "Network", "status": "Active"},
                {"device_name": "Nashik GRD R1 Switch 02", "hostname": "FSL-BR-NSK-GRD-R1-SW02", "ip_address": "10.2.213.20", "category": "Network", "status": "Active"},
                {"device_name": "Nashik GRD R1 PoE Switch 01", "hostname": "FSL-BR-NSK-GRD-R1-POE-SW01", "ip_address": "10.2.213.21", "category": "Network", "status": "Active"},
                {"device_name": "Nashik GRD R2 Switch 01", "hostname": "FSL-BR-NSK-GRD-R2-SW01", "ip_address": "10.2.213.22", "category": "Network", "status": "Active"},
                {"device_name": "Nashik GRD R2 Switch 02", "hostname": "FSL-BR-NSK-GRD-R2-SW02", "ip_address": "10.2.213.23", "category": "Network", "status": "Active"},
                {"device_name": "Nashik GRD R2 PoE Switch 01", "hostname": "FSL-BR-NSK-GRD-R2-POE-SW01", "ip_address": "10.2.213.24", "category": "Network", "status": "Active"},
                {"device_name": "Nashik FRS R1 Switch 01", "hostname": "FSL-BR-NSK-FRS-R1-SW01", "ip_address": "10.2.213.25", "category": "Network", "status": "Active"},
                {"device_name": "Nashik FRS R1 Switch 02", "hostname": "FSL-BR-NSK-FRS-R1-SW02", "ip_address": "10.2.213.26", "category": "Network", "status": "Active"},
                {"device_name": "Nashik FRS R1 PoE Switch 01", "hostname": "FSL-BR-NSK-FRS-R1-POE-SW01", "ip_address": "10.2.213.27", "category": "Network", "status": "Active"},
                {"device_name": "Nashik FRS R2 Switch 01", "hostname": "FSL-BR-NSK-FRS-R2-SW01", "ip_address": "10.2.213.28", "category": "Network", "status": "Active"},
                {"device_name": "Nashik FRS R2 Switch 02", "hostname": "FSL-BR-NSK-FRS-R2-SW02", "ip_address": "10.2.213.29", "category": "Network", "status": "Active"},
                {"device_name": "Nashik FRS R2 PoE Switch 01", "hostname": "FSL-BR-NSK-FRS-R2-POE-SW01", "ip_address": "10.2.213.30", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in nashik_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=nashik_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Nashik device items")

        # Ensure Nanded devices exist
        if nanded_br_id:
            nanded_devices = [
                {"device_name": "Nanded Primary Router", "hostname": "FSL-BR-NAD-COR-RTR-01", "ip_address": "10.3.149.11", "category": "Network", "status": "Active"},
                {"device_name": "Nanded Secondary Router", "hostname": "FSL-BR-NAD-COR-RTR-02", "ip_address": "10.3.149.12", "category": "Network", "status": "Active"},
                {"device_name": "Nanded Firewall 1", "hostname": "FSL-BR-NAD-FGT-FW-01", "ip_address": "10.3.149.1", "category": "Security", "status": "Active"},
                {"device_name": "Nanded Firewall 2", "hostname": "FSL-BR-NAD-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Nanded Agg Switch R1-01", "hostname": "FSL-BR-NAD-AGG-R1-SW01", "ip_address": "10.3.149.15", "category": "Network", "status": "Active"},
                {"device_name": "Nanded Agg Switch R2-01", "hostname": "FSL-BR-NAD-AGG-R2-SW01", "ip_address": "10.3.149.16", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC Switch R1-01", "hostname": "FSL-BR-NAD-SEC-R1-SW01", "ip_address": "10.3.149.17", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC Switch R1-02", "hostname": "FSL-BR-NAD-SEC-R1-SW02", "ip_address": "10.3.149.18", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC PoE Switch R1-01", "hostname": "FSL-BR-NAD-SEC-R1-POE-SW01", "ip_address": "10.3.149.19", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC Switch R2-01", "hostname": "FSL-BR-NAD-SEC-R2-SW01", "ip_address": "10.3.149.20", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC PoE Switch R2-01", "hostname": "FSL-BR-NAD-SEC-R2-POE-SW01", "ip_address": "10.3.149.21", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC Switch R3-01", "hostname": "FSL-BR-NAD-SEC-R3-SW01", "ip_address": "10.3.149.22", "category": "Network", "status": "Active"},
                {"device_name": "Nanded SEC PoE Switch R3-01", "hostname": "FSL-BR-NAD-SEC-R3-POE-SW01", "ip_address": "10.3.149.23", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in nanded_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=nanded_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Nanded device items")

        # Ensure Nagpur devices exist
        if nagpur_br_id:
            nagpur_devices = [
                {"device_name": "Nagpur Primary Router", "hostname": "FSL-BR-NAG-COR-RTR-01", "ip_address": "10.2.149.11", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur Secondary Router", "hostname": "FSL-BR-NAG-COR-RTR-02", "ip_address": "10.2.149.12", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur Firewall 1", "hostname": "FSL-BR-NAG-FGT-FW-01", "ip_address": "10.2.149.1", "category": "Security", "status": "Active"},
                {"device_name": "Nagpur Firewall 2", "hostname": "FSL-BR-NAG-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Nagpur Agg Switch R1-01", "hostname": "FSL-BR-NAG-AGG-R1-SW01", "ip_address": "10.2.149.15", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur Agg Switch R2-01", "hostname": "FSL-BR-NAG-AGG-R2-SW01", "ip_address": "10.2.149.16", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur Agg Switch R1-02", "hostname": "FSL-BR-NAG-AGG-R1-SW02", "ip_address": "10.2.149.17", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur Agg Switch R2-02", "hostname": "FSL-BR-NAG-AGG-R2-SW02", "ip_address": "10.2.149.18", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur GRD R1 Switch 01", "hostname": "FSL-BR-NAG-GRD-R1-SW01", "ip_address": "10.2.149.19", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur GRD R1 PoE Switch 01", "hostname": "FSL-BR-NAG-GRD-R1-POE-SW01", "ip_address": "10.2.149.20", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur GRD R2 Switch 01", "hostname": "FSL-BR-NAG-GRD-R2-SW01", "ip_address": "10.2.149.21", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur GRD R2 Switch 02", "hostname": "FSL-BR-NAG-GRD-R2-SW02", "ip_address": "10.2.149.22", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur GRD R2 PoE Switch 01", "hostname": "FSL-BR-NAG-GRD-R2-POE-SW01", "ip_address": "10.2.149.23", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur FST R1 Switch 01", "hostname": "FSL-BR-NAG-FST-R1-SW01", "ip_address": "10.2.149.24", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur FST R1 Switch 02", "hostname": "FSL-BR-NAG-FST-R1-SW02", "ip_address": "10.2.149.25", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur FST R1 PoE Switch 01", "hostname": "FSL-BR-NAG-FST-R1-POE-SW01", "ip_address": "10.2.149.26", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur FST R2 Switch 01", "hostname": "FSL-BR-NGP-FST-R2-SW01", "ip_address": "10.2.149.27", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur FST R2 Switch 02", "hostname": "FSL-BR-NGP-FST-R2-SW02", "ip_address": "10.2.149.28", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur FST R2 PoE Switch 01", "hostname": "FSL-BR-NAG-FST-R2-POE-SW01", "ip_address": "10.2.149.29", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur SEC R1 Switch 01", "hostname": "FSL-BR-NAG-SEC-R1-SW01", "ip_address": "10.2.149.30", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur SEC R1 Switch 02", "hostname": "FSL-BR-NAG-SEC-R1-SW02", "ip_address": "10.2.149.31", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur SEC R1 Switch 03", "hostname": "FSL-BR-NAG-SEC-R1-SW03", "ip_address": "10.2.149.32", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur SEC R1 PoE Switch 01", "hostname": "FSL-BR-NAG-SEC-R1-POE-SW01", "ip_address": "10.2.149.33", "category": "Network", "status": "Active"},
                {"device_name": "Nagpur SEC Server PoE Switch 01", "hostname": "FSL-BR-NAG-SEC-SER-POE-SW01", "ip_address": "10.2.149.34", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in nagpur_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=nagpur_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Nagpur device items")

        # Ensure Kolhapur devices exist
        if kolhapur_br_id:
            kolhapur_devices = [
                {"device_name": "Kolhapur Primary Router", "hostname": "FSL-BR-KOL-COR-RTR-01", "ip_address": "10.3.213.11", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Secondary Router", "hostname": "FSL-BR-KOL-COR-RTR-02", "ip_address": "10.3.213.12", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Firewall 1", "hostname": "FSL-BR-KOL-FGT-FW-01", "ip_address": "10.3.213.1", "category": "Security", "status": "Active"},
                {"device_name": "Kolhapur Firewall 2", "hostname": "FSL-BR-KOL-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Kolhapur Agg Switch R1-01", "hostname": "FSL-BR-KOL-AGG-R1-SW01", "ip_address": "10.3.213.15", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Agg Switch R2-01", "hostname": "FSL-BR-KOL-AGG-R2-SW01", "ip_address": "10.3.213.16", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Agg Switch R1-02", "hostname": "FSL-BR-KOL-AGG-R1-SW02", "ip_address": "10.3.213.17", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Agg Switch R2-02", "hostname": "FSL-BR-KOL-AGG-R2-SW02", "ip_address": "10.3.213.18", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur FST R1 Switch 01", "hostname": "FSL-BR-KOL-FST-R1-SW01", "ip_address": "10.3.213.19", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur FST R1 PoE Switch 01", "hostname": "FSL-BR-KOL-FST-R1-POE-SW01", "ip_address": "10.3.213.20", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur FST R1 PoE Switch 02", "hostname": "FSL-BR-KOL-FST-R1-POE-SW02", "ip_address": "10.3.213.21", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur SEC R1 Switch 01", "hostname": "FSL-BR-KOL-SEC-R1-SW01", "ip_address": "10.3.213.22", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur SEC R1 PoE Switch 01", "hostname": "FSL-BR-KOL-SEC-R1-POE-SW01", "ip_address": "10.3.213.23", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur TRD R1 Switch 01", "hostname": "FSL-BR-KOL-TRD-R1-SW01", "ip_address": "10.3.213.24", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur TRD R1 PoE Switch 01", "hostname": "FSL-BR-KOL-TRD-R1-POE-SW01", "ip_address": "10.3.213.25", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Fourth R1 Switch 01", "hostname": "FSL-BR-KOL-FOUTH-R1-SW01", "ip_address": "10.3.213.26", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Fourth R1 Switch 02", "hostname": "FSL-BR-KOL-FOUTH-R1-SW02", "ip_address": "10.3.213.29", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Fourth R1 PoE Switch 01", "hostname": "FSL-BR-KOL-FOUTH-R1-POE-SW01", "ip_address": "10.3.213.27", "category": "Network", "status": "Active"},
                {"device_name": "Kolhapur Fourth R1 PoE Switch 02", "hostname": "FSL-BR-KOL-FOUTH-R1-POE-SW02", "ip_address": "10.3.213.28", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in kolhapur_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=kolhapur_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Kolhapur device items")

        # Ensure Dhule devices exist
        if dhule_br_id:
            dhule_devices = [
                {"device_name": "Dhule Primary Router", "hostname": "FSL-BR-DHU-COR-RTR-01", "ip_address": "10.5.21.11", "category": "Network", "status": "Active"},
                {"device_name": "Dhule Secondary Router", "hostname": "FSL-BR-DHU-COR-RTR-02", "ip_address": "10.5.21.12", "category": "Network", "status": "Active"},
                {"device_name": "Dhule Firewall 1", "hostname": "FSL-BR-DHU-FGT-FW-01", "ip_address": "10.5.21.1", "category": "Security", "status": "Active"},
                {"device_name": "Dhule Firewall 2", "hostname": "FSL-BR-DHU-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Dhule Agg Switch R1-01", "hostname": "FSL-BR-DHU-AGG-R1-SW01", "ip_address": "10.5.21.15", "category": "Network", "status": "Active"},
                {"device_name": "Dhule Agg Switch R2-01", "hostname": "FSL-BR-DHU-AGG-R2-SW01", "ip_address": "10.5.21.16", "category": "Network", "status": "Active"},
                {"device_name": "Dhule GRD R1 Switch 01", "hostname": "FSL-BR-DHU-GRD-R1-SW01", "ip_address": "10.5.21.17", "category": "Network", "status": "Active"},
                {"device_name": "Dhule GRD R1 PoE Switch 01", "hostname": "FSL-BR-DHU-GRD-R1-POE-SW01", "ip_address": "10.5.21.18", "category": "Network", "status": "Active"},
                {"device_name": "Dhule GRD R1 PoE Switch 02", "hostname": "FSL-BR-DHU-GRD-R1-POE-SW02", "ip_address": "10.5.21.19", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in dhule_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=dhule_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Dhule device items")

        # Ensure Chandrapur devices exist
        if chandrapur_br_id:
            chandrapur_devices = [
                {"device_name": "Chandrapur Primary Router", "hostname": "FSL-BR-CHND-COR-RTR-01", "ip_address": "10.4.213.11", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur Secondary Router", "hostname": "FSL-BR-CHND-COR-RTR-02", "ip_address": "10.4.213.12", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur Firewall 1", "hostname": "FSL-BR-CHND-FGT-FW-01", "ip_address": "10.4.213.1", "category": "Security", "status": "Active"},
                {"device_name": "Chandrapur Firewall 2", "hostname": "FSL-BR-CHND-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Chandrapur Agg Switch R1-01", "hostname": "FSL-BR-CHND-AGG-R1-SW01", "ip_address": "10.4.213.15", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur Agg Switch R2-01", "hostname": "FSL-BR-CHND-AGG-R2-SW01", "ip_address": "10.4.213.16", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur FRS Switch R1-01", "hostname": "FSL-BR-CHD-FRS-R1-SW01", "ip_address": "10.4.213.19", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur FRS PoE Switch R1-01", "hostname": "FSL-BR-CHD-FRS-R1-POE", "ip_address": "10.4.213.20", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur THD Switch R1-01", "hostname": "FSL-BR-CHD-THD-R1-SW01", "ip_address": "10.4.213.21", "category": "Network", "status": "Active"},
                {"device_name": "Chandrapur THD PoE Switch R1-01", "hostname": "FSL-BR-CHD-THD-R1-POE", "ip_address": "10.4.213.22", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in chandrapur_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=chandrapur_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Chandrapur device items")

        # Ensure Sambhaji Nagar devices exist
        if sambhaji_br_id:
            sambhaji_devices = [
                {"device_name": "Sambhaji Nagar Primary Router", "hostname": "FSL-BR-AUR-COR-RTR-01", "ip_address": "10.3.21.11", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar Secondary Router", "hostname": "FSL-BR-AUR-COR-RTR-02", "ip_address": "10.3.21.12", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar Firewall 1", "hostname": "FSL-BR-AUR-FGT-FW-01", "ip_address": "10.3.21.1", "category": "Security", "status": "Active"},
                {"device_name": "Sambhaji Nagar Firewall 2", "hostname": "FSL-BR-AUR-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Sambhaji Nagar Agg Switch R1-01", "hostname": "FSL-BR-AUR-AGG-R1-SW01", "ip_address": "10.3.21.15", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar Agg Switch R2-01", "hostname": "FSL-BR-AUR-AGG-R2-SW01", "ip_address": "10.3.21.16", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar Agg Switch R1-02", "hostname": "FSL-BR-AUR-AGG-R1-SW02", "ip_address": "10.3.21.17", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar Agg Switch R2-02", "hostname": "FSL-BR-AUR-AGG-R2-SW02", "ip_address": "10.3.21.18", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar GRD Switch B1R1-01", "hostname": "FSL-BR-AUR-GRD-B1R1-SW01", "ip_address": "10.3.21.19", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar GRD Switch B1R1-02", "hostname": "FSL-BR-AUR-GRD-B1R1-SW02", "ip_address": "10.3.21.20", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar GRD PoE Switch B1R1-01", "hostname": "FSL-BR-AUR-GRD-B1R1-POE-SW01", "ip_address": "10.3.21.21", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar FRS Switch B1R1-01", "hostname": "FSL-BR-AUR-FRS-B1R1-SW01", "ip_address": "10.3.21.22", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar FRS Switch B1R1-02", "hostname": "FSL-BR-AUR-FRS-B1R1-SW02", "ip_address": "10.3.21.23", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar FRS PoE Switch B1R1-01", "hostname": "FSL-BR-AUR-FRS-B1R1-POE-SW01", "ip_address": "10.3.21.24", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar SEC Switch B1R1-01", "hostname": "FSL-BR-AUR-SEC-B1R1-SW01", "ip_address": "10.3.21.25", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar SEC PoE Switch B1R1-01", "hostname": "FSL-BR-AUR-SEC-B1R1-POE-SW01", "ip_address": "10.3.21.26", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar GRD Switch B2R1-01", "hostname": "FSL-BR-AUR-GRD-B2R1-SW01", "ip_address": "10.3.21.27", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar GRD PoE Switch B2R1-01", "hostname": "FSL-BR-AUR-GRD-B2R1-POE-SW01", "ip_address": "10.3.21.28", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar FRS Switch B2R1-01", "hostname": "FSL-BR-AUR-FRS-B2R1-SW01", "ip_address": "10.3.21.29", "category": "Network", "status": "Active"},
                {"device_name": "Sambhaji Nagar FRS PoE Switch B2R1-01", "hostname": "FSL-BR-AUR-FRS-B2R1-POE-SW01", "ip_address": "10.3.21.30", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in sambhaji_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=sambhaji_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Sambhaji Nagar device items")

        # Ensure Amravati devices exist
        if amravati_br_id:
            amravati_devices = [
                {"device_name": "Amravati Primary Router", "hostname": "FSL-BR-AMR-COR-RTR-01", "ip_address": "10.3.85.11", "category": "Network", "status": "Active"},
                {"device_name": "Amravati Secondary Router", "hostname": "FSL-BR-AMR-COR-RTR-02", "ip_address": "10.3.85.12", "category": "Network", "status": "Active"},
                {"device_name": "Amravati Firewall 1", "hostname": "FSL-BR-AMR-FGT-FW-01", "ip_address": "10.3.85.1", "category": "Security", "status": "Active"},
                {"device_name": "Amravati Firewall 2", "hostname": "FSL-BR-AMR-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Amravati Agg Switch R1-01", "hostname": "FSL-BR-AMR-AGG-R1-SW01", "ip_address": "10.3.85.15", "category": "Network", "status": "Active"},
                {"device_name": "Amravati Agg Switch R2-01", "hostname": "FSL-BR-AMR-AGG-R2-SW01", "ip_address": "10.3.85.16", "category": "Network", "status": "Active"},
                {"device_name": "Amravati Agg Switch R1-02", "hostname": "FSL-BR-AMR-AGG-R1-SW02", "ip_address": "10.3.85.17", "category": "Network", "status": "Active"},
                {"device_name": "Amravati Agg Switch R2-02", "hostname": "FSL-BR-AMR-AGG-R2-SW02", "ip_address": "10.3.85.18", "category": "Network", "status": "Active"},
                {"device_name": "Amravati GRD PoE Switch R1-01", "hostname": "FSL-BR-AMR-GRD-R1-SW01", "ip_address": "10.3.85.27", "category": "Network", "status": "Active"},
                {"device_name": "Amravati FRS Switch R1-01", "hostname": "FSL-BR-AMR-FRS-R1-SW01", "ip_address": "10.3.85.19", "category": "Network", "status": "Active"},
                {"device_name": "Amravati FRS Switch R1-02", "hostname": "FSL-BR-AMR-FRS-R1-SW02", "ip_address": "10.3.85.20", "category": "Network", "status": "Active"},
                {"device_name": "Amravati FRS PoE Switch R1-01", "hostname": "FSL-BR-AMR-FRS-R1-POE-SW01", "ip_address": "10.3.85.21", "category": "Network", "status": "Active"},
                {"device_name": "Amravati SEC Switch R1-01", "hostname": "FSL-BR-AMR-SEC-R1-SW01", "ip_address": "10.3.85.22", "category": "Network", "status": "Active"},
                {"device_name": "Amravati SEC Switch R1-02", "hostname": "FSL-BR-AMR-SEC-R1-SW02", "ip_address": "10.3.85.26", "category": "Network", "status": "Active"},
                {"device_name": "Amravati SEC PoE Switch R1-01", "hostname": "FSL-BR-AMR-SEC-R1-POE-SW01", "ip_address": "10.3.85.23", "category": "Network", "status": "Active"},
                {"device_name": "Amravati TRD Switch R1-01", "hostname": "FSL-BR-AMR-TRD-R1-SW01", "ip_address": "10.3.85.24", "category": "Network", "status": "Active"},
                {"device_name": "Amravati TRD PoE Switch R1-01", "hostname": "FSL-BR-AMR-TRD-R1-POE-SW01", "ip_address": "10.3.85.25", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in amravati_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=amravati_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Amravati device items")

        # Ensure Thane devices exist
        if thane_br_id:
            thane_devices = [
                {"device_name": "Thane Primary Router", "hostname": "FSL-BR-THA-COR-RTR-01", "ip_address": "10.4.21.11", "category": "Network", "status": "Active"},
                {"device_name": "Thane Secondary Router", "hostname": "FSL-BR-THA-COR-RTR-02", "ip_address": "10.4.21.12", "category": "Network", "status": "Active"},
                {"device_name": "Thane Firewall 1", "hostname": "FSL-BR-THA-FGT-FW-01", "ip_address": "10.4.21.1", "category": "Security", "status": "Active"},
                {"device_name": "Thane Firewall 2", "hostname": "FSL-BR-THA-FGT-FW-02", "ip_address": "", "category": "Security", "status": "Active"},
                {"device_name": "Thane Agg Switch R1-01", "hostname": "FSL-BR-THA-AGG-R1-SW01", "ip_address": "10.4.21.15", "category": "Network", "status": "Active"},
                {"device_name": "Thane Agg Switch R2-01", "hostname": "FSL-BR-THA-AGG-R2-SW01", "ip_address": "10.4.21.16", "category": "Network", "status": "Active"},
                {"device_name": "Thane FRS Switch R1-01", "hostname": "FSL-BR-THA-FRS-R1-SW01", "ip_address": "10.4.21.17", "category": "Network", "status": "Active"},
                {"device_name": "Thane FRS PoE Switch R1-01", "hostname": "FSL-BR-THA-FRS-R1-POE-SW01", "ip_address": "10.4.21.18", "category": "Network", "status": "Active"},
            ]
            added = 0
            for dev in thane_devices:
                exists = db.query(DeviceItem).filter(DeviceItem.hostname == dev["hostname"]).first()
                if not exists:
                    db.add(DeviceItem(location_id=thane_br_id, **dev))
                    added += 1
            if added:
                db.commit()
                print(f"Added {added} Thane device items")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    seed_admin_user()
    seed_locations()
    seed_sample_equipment()
    seed_device_items()
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
# CORS middleware (force permissive in dev/local)
cors_origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=".*",
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
app.include_router(locations_router, prefix="/api")
app.include_router(device_items_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CIMS API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
