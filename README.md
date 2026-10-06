# DIAGNO

Diagnostic Appointment Booking Platform

--

## Overview

**DIAGNO** is a full-stack web application designed for discovering diagnostic imaging facilities, exploring clinical scans, and managing patient appointments with atomic double-booking prevention.

> **Portfolio Project:** DIAGNO is a personal software engineering portfolio project demonstrating robust Django REST Framework backend design, PostgreSQL relational modeling, JWT authentication, and a clean, responsive React + TypeScript frontend with an editorial design aesthetic.

---

## Live Deployment

- **Web Application (Frontend):** [https://diagno-web-eta.vercel.app](https://diagno-web-eta.vercel.app)
- **REST API (Backend):** [https://diagno-api.vercel.app](https://diagno-api.vercel.app)
- **Database:** Hosted Serverless PostgreSQL on Neon (with connection pooling)
- **Hosting Platform:** Vercel (Edge Network + Serverless Python WSGI Runtime)

---

## Features

### Patient Experience
- **User Registration & Login:** Patient account creation and secure JWT token-based authentication.
- **Diagnostic Centers Directory:** Public browsing of certified diagnostic imaging centers with city-level filtering.
- **Scan & Procedure Catalogue:** Public exploration of diagnostic scan modalities (MRI, CT, Ultrasound, X-Ray) with durations and pricing.
- **Multi-Step Booking Flow:** Structured 5-step reservation wizard (`Center` &rarr; `Test` &rarr; `Date` &rarr; `Time` &rarr; `Confirm`).
- **Advance Booking Validation:** Enforces minimum 24-hour advance scheduling to prevent past or same-day walk-in scheduling conflicts.
- **Atomic Double-Booking Protection:** Backend serialization and database constraints guarantee no two patients can reserve the same facility slot concurrently.
- **Cancellation & Slot Rebooking:** Instant appointment cancellation that immediately frees the vacated time slot for other patients.
- **Pending Booking Session Recovery:** Unauthenticated users can configure their booking and have their state seamlessly restored after logging in.
- **Patient Dashboard:** Real-time appointment timeline, upcoming booking highlights, status badges (`BOOKED`, `COMPLETED`, `CANCELLED`), and cancellation controls.

### Staff Administration
- **Role-Based Access Control:** Strict permission guards distinguishing standard patient accounts from facility staff.
- **Diagnostic Center Management:** Staff CRUD interface for adding, updating, and removing diagnostic facilities.
- **Scan Modality Management:** Staff CRUD interface for configuring test names, descriptions, durations, and pricing.
- **Network Schedule Oversight:** System-wide appointment monitoring across all registered patients and centers.
- **Django Admin Integration:** Searchable administrative lookup by patient username, patient email, facility name, city, and scan type.

---

## Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** (Build tool & development server)
- **Tailwind CSS** (Editorial warm linen and charcoal design system)
- **React Router v6** (Client-side routing with `ProtectedRoute` guards)
- **Axios** (Centralized HTTP client with JWT request interceptors)
- **Lucide React** (Icons)

### Backend
- **Python 3.11+**
- **Django 5.2** & **Django REST Framework 3.15**
- **PostgreSQL** (`psycopg2-binary`)
- **JWT Authentication** (`djangorestframework-simplejwt`)
- **python-dotenv** (Environment variable management)

### Testing
- **pytest** & **pytest-django** (Automated backend test suite)

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│          React + TypeScript Frontend (Vite)            │
│  - Editorial UI / Design System                        │
│  - Centralized Axios Client + JWT Storage              │
│  - Protected Routes & Pending Booking Recovery         │
└───────────────────────────┬────────────────────────────┘
                            │
                   REST API (HTTP / JSON)
                            │
┌───────────────────────────▼────────────────────────────┐
│              Django REST Framework (DRF)               │
│  - JWT Authentication Middleware                       │
│  - ViewSets & Serializer Validations                   │
│  - Role-Based Permissions (IsStaffOrReadOnly, IsOwner) │
└───────────────────────────┬────────────────────────────┘
                            │
                   psycopg2-binary
                            │
┌───────────────────────────▼────────────────────────────┐
│                  PostgreSQL Database                   │
│  - Tables: auth_user, centers, scan_types, appointments│
│  - UniqueConstraint: (center, date, start_time, BOOKED)│
└────────────────────────────────────────────────────────┘
```

### Authentication Flow
1. Patient submits credentials to `POST /api/auth/login/`.
2. Backend authenticates and returns short-lived `access` and `refresh` JWT tokens.
3. Frontend stores tokens in `localStorage` and attaches `Authorization: Bearer <token>` to all protected API calls.

### Appointment Flow
1. Patient selects a Center, Scan Type, Date (tomorrow or later), and Time Slot.
2. `POST /api/appointments/` verifies date validity and checks for conflicting active `BOOKED` slots.
3. Upon booking, status is set to `BOOKED`.
4. If cancelled (`PATCH /api/appointments/{id}/cancel/`), status changes to `CANCELLED`, freeing the slot for rebooking.

---

## Project Structure

```
DIAGNO/
├── bookings/                   # Django backend application
│   ├── admin.py                # Django Admin registrations & search fields
│   ├── models.py               # DiagnosticCenter, ScanType, Appointment
│   ├── serializers.py          # DRF serializers & cross-field validations
│   ├── views.py                # Authentication views & ModelViewSets
│   ├── permissions.py          # IsStaffOrReadOnly & IsOwnerOrStaff guards
│   ├── urls.py                 # API router and endpoint definitions
│   └── tests/                  # Automated pytest suite (30 test cases)
│       ├── test_auth.py        # Registration, login, token protection tests
│       ├── test_centers.py     # Centers & Scans CRUD & permission tests
│       └── test_appointments.py# Double-booking, cancellation, date tests
│
├── config/                     # Django project configuration
│   ├── settings.py             # PostgreSQL database & JWT settings
│   ├── test_settings.py        # In-memory test settings
│   ├── urls.py                 # Root URL configuration
│   └── wsgi.py
│
├── frontend/                   # React + TypeScript single-page application
│   ├── src/
│   │   ├── api/                # Centralized Axios services (auth, centers, scans, appointments)
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Button, Input, Modal)
│   │   ├── context/            # AuthContext (session state) & ToastContext
│   │   ├── pages/              # Landing, Login, Register, Booking, Dashboards, Staff CRUD
│   │   ├── types/              # TypeScript interfaces and domain types
│   │   ├── App.tsx             # Route declarations & route guards
│   │   └── main.tsx            # Application entry point
│   ├── tailwind.config.js      # Palette, fonts, and styling tokens
│   └── vite.config.ts          # Vite proxy forwarding /api to port 8000
│
├── .env.example                # Environment configuration template
├── .gitignore                  # Git ignore rules (secrets, dependencies, build files)
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
└── pytest.ini                  # Pytest configuration
```

---

## API Overview

### Authentication

| Method | Endpoint | Authentication | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register/` | Public | Register a new patient user account |
| `POST` | `/api/auth/login/` | Public | Authenticate user and receive JWT access & refresh tokens |
| `POST` | `/api/auth/token/refresh/` | Public | Refresh expired JWT access token using refresh token |

### Diagnostic Centers

| Method | Endpoint | Authentication | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/centers/` | Public | List all active diagnostic imaging centers |
| `GET` | `/api/centers/{id}/` | Public | Retrieve details of a specific center |
| `POST` | `/api/centers/` | Staff Only | Create a new diagnostic center |
| `PUT/PATCH` | `/api/centers/{id}/` | Staff Only | Update diagnostic center details |
| `DELETE` | `/api/centers/{id}/` | Staff Only | Remove a diagnostic center |

### Scan Types & Modalities

| Method | Endpoint | Authentication | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/scans/` | Public | List all available scan modalities and pricing |
| `GET` | `/api/scans/{id}/` | Public | Retrieve details of a specific scan type |
| `POST` | `/api/scans/` | Staff Only | Create a new diagnostic scan type |
| `PUT/PATCH` | `/api/scans/{id}/` | Staff Only | Update scan type description, duration, or price |
| `DELETE` | `/api/scans/{id}/` | Staff Only | Remove a scan modality |

### Appointments

| Method | Endpoint | Authentication | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/appointments/` | Authenticated | List appointments (Patients see own; Staff sees all) |
| `POST` | `/api/appointments/` | Authenticated | Reserve a new appointment slot |
| `GET` | `/api/appointments/{id}/` | Authenticated | Retrieve specific appointment details |
| `PATCH` | `/api/appointments/{id}/cancel/` | Authenticated | Cancel a booked appointment and free slot |

---

## Database Schema & Models

### 1. `DiagnosticCenter`
- `name` (CharField): Facility commercial name
- `address` (TextField): Physical address
- `city` (CharField): Facility operating municipality
- `contact_number` (CharField): Facility telephone line
- `created_at` (DateTimeField): Record creation timestamp

### 2. `ScanType`
- `name` (CharField): Procedure name (e.g. Brain MRI, Chest CT)
- `description` (TextField): Clinical description
- `duration_minutes` (PositiveIntegerField): Scan duration
- `price` (DecimalField): Procedure fee
- `created_at` (DateTimeField): Record creation timestamp

### 3. `Appointment`
- `patient` (ForeignKey &rarr; `User`): Appointment owner
- `diagnostic_center` (ForeignKey &rarr; `DiagnosticCenter`): Facility location
- `scan_type` (ForeignKey &rarr; `ScanType`): Booked diagnostic procedure
- `appointment_date` (DateField): Appointment calendar date ($\ge \text{tomorrow}$)
- `start_time` (TimeField): Reserved slot time
- `status` (CharField): `BOOKED`, `COMPLETED`, `CANCELLED`
- **Unique Constraint:** `(diagnostic_center, appointment_date, start_time)` for active `BOOKED` appointments.

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL 14+ running on `localhost:5432`

---

### 1. Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd diagno

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials:
# DATABASE_NAME=diagnostic_booking
# DATABASE_USER=postgres
# DATABASE_PASSWORD=your_postgres_password
# SECRET_KEY=your_secret_key

# Run database migrations
python manage.py migrate

# (Optional) Seed sample centers and scan types
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from bookings.models import DiagnosticCenter, ScanType; DiagnosticCenter.objects.get_or_create(name='City Central Diagnostics', defaults={'address': '100 Medical Center Dr', 'city': 'Metropolis', 'contact_number': '555-0100'}); ScanType.objects.get_or_create(name='Brain MRI', defaults={'description': 'High-resolution neuro-imaging scan', 'duration_minutes': 45, 'price': 450.00}); print('Database seeded!')"

# Run automated test suite
python -m pytest bookings/tests/ -v

# Start Django Development Server on port 8000
python manage.py runserver 127.0.0.1:8000
```

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server on port 5173
npm run dev

# (Optional) Run TypeScript check and production build
npm run build
```

Open `http://localhost:5173` in your browser to explore the DIAGNO platform.
