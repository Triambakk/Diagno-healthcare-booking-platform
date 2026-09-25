"""
seed_production.py — Seed initial centers and scan types for DIAGNO.
Safe, idempotent data initialization for demo and portfolio deployments.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parent
load_dotenv(project_root / ".env", override=True)
sys.path.insert(0, str(project_root))

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from bookings.models import DiagnosticCenter, ScanType

def seed():
    print("Seeding DIAGNO Production Database...")

    # 1. Seed Diagnostic Centers
    centers = [
        {
            "name": "City Central Diagnostics",
            "address": "100 Medical Center Blvd, Suite 200",
            "city": "Metropolis",
            "contact_number": "+1 (555) 012-3456",
        },
        {
            "name": "Precision Imaging & MRI Institute",
            "address": "450 Radiance Way",
            "city": "Gotham",
            "contact_number": "+1 (555) 019-8877",
        },
        {
            "name": "Advanced Clinical Scan Center",
            "address": "720 Health Park Ave",
            "city": "Star City",
            "contact_number": "+1 (555) 014-9900",
        },
        {
            "name": "MetroWest Diagnostic Imaging",
            "address": "180 Valley Parkway",
            "city": "Coast City",
            "contact_number": "+1 (555) 018-2233",
        },
    ]

    for c in centers:
        obj, created = DiagnosticCenter.objects.get_or_create(
            name=c["name"],
            defaults={
                "address": c["address"],
                "city": c["city"],
                "contact_number": c["contact_number"],
            },
        )
        print(f"  [Center] {obj.name} ({'Created' if created else 'Already exists'})")

    # 2. Seed Scan Types & Modalities
    scans = [
        {
            "name": "Brain MRI (with/without Contrast)",
            "description": "High-resolution 3T magnetic resonance imaging for neuro-vascular and brain tissue evaluation.",
            "duration_minutes": 45,
            "price": "450.00",
        },
        {
            "name": "High-Resolution Chest CT Scan",
            "description": "Low-dose multi-slice computed tomography examination of the pulmonary parenchyma and thoracic cavity.",
            "duration_minutes": 30,
            "price": "320.00",
        },
        {
            "name": "Comprehensive Abdominal Ultrasound",
            "description": "Real-time diagnostic sonography evaluating the liver, gallbladder, kidneys, spleen, and pancreas.",
            "duration_minutes": 30,
            "price": "180.00",
        },
        {
            "name": "Digital Lumbar Spine X-Ray",
            "description": "Dual-view high-clarity radiographic imaging of the lumbar and sacral spine alignment.",
            "duration_minutes": 15,
            "price": "95.00",
        },
        {
            "name": "Whole Body PET-CT Oncology Scan",
            "description": "Positron emission tomography coupled with computed tomography for metabolic tumor staging.",
            "duration_minutes": 60,
            "price": "850.00",
        },
    ]

    for s in scans:
        obj, created = ScanType.objects.get_or_create(
            name=s["name"],
            defaults={
                "description": s["description"],
                "duration_minutes": s["duration_minutes"],
                "price": s["price"],
            },
        )
        print(f"  [Scan] {obj.name} ({'Created' if created else 'Already exists'})")

    print("\nDatabase seeding completed successfully!")

if __name__ == "__main__":
    seed()
