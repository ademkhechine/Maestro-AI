# Maestro AI 🎵
### Intelligent Music Theory & Practice Platform

Maestro AI is a premium, interactive educational platform designed for learning and practicing music theory, with a special emphasis on **Arabic music theory (Maqamat & Ajnas)**. It features microtonal audio playback, specialized visualizers for traditional instruments (Oud, Violin, Qanun, and Piano), and an AI-powered music coaching feedback system.

---

## 🚀 Quick Start (Local Development)

The project is pre-configured with a local database, cache, and a one-click startup script for Windows.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running)
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.10+)

### One-Click Launch (Windows)
Double-click or run the startup script in the root directory:
```powershell
.\run-local.bat
```
This script automatically:
1. Spins up PostgreSQL and Redis containers.
2. Activates the Python virtual environment and starts the FastAPI backend.
3. Starts the Vite-React dev server for the frontend.

---

## 🛠️ Technology Stack

### Backend
* **Framework:** FastAPI (Python)
* **Database:** PostgreSQL (with asyncpg)
* **Cache & Session Management:** Redis
* **Authentication:** JWT (JSON Web Tokens) with custom password hashing
* **Task Queue & Performance:** Async database access with SQLAlchemy

### Frontend
* **Build System & Framework:** Vite + React (TypeScript)
* **Audio Synthesis:** Tone.js (with custom microtonal/quarter-tone playback support)
* **Styling:** Custom CSS & TailwindCSS (curated premium dark theme)
* **State Management:** Zustand

---

## 📂 Project Structure

```text
maestro-ai/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # API Route endpoints (auth, feedback, etc.)
│   │   ├── core/             # Configuration & DB connection setup
│   │   └── models/           # SQLAlchemy DB Models (users, sessions, pieces)
│   ├── main.py               # Entry point
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Local Virtual Environment
│
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # UI Components (Instrument visualizers: Oud, Qanun, etc.)
│   │   ├── layouts/          # Layout containers (Auth, Dashboard)
│   │   ├── pages/            # Page Views (Dashboard, Practice, Maqamat, Library)
│   │   ├── store/            # Zustand global state stores (auth, practice)
│   │   └── utils/            # Pitch-detection & sheet music parsers
│   └── package.json          # Node dependencies
│
├── docker-compose.yml        # Multi-container config (Postgres & Redis)
├── run-local.bat             # Windows startup script
└── README.md                 # Project documentation
```

---

## 🔗 Access Links

Once the application is running:
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API Documentation (Swagger UI):** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
* **Alternative API Documentation (Redoc):** [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)
