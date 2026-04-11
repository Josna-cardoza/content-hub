# Development Guide

## Prerequisites

| Tool | Version | Required |
|---|---|---|
| Docker Desktop | Latest | ✅ Required |
| Docker Compose | v2+ | ✅ Required |
| Node.js | 20+ | Optional (for local frontend dev) |
| Python | 3.11+ | Optional (for local BFF dev) |
| .NET SDK | 8.0 | Optional (for local data-service dev) |

---

## Quick Start (Docker — Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd atklhub

# 2. Place your Google OAuth credentials
# Copy your downloaded google-auth.json to:
# data-service/google-auth.json

# 3. Build and start all services
docker-compose up -d --build

# 4. Open in browser
# http://localhost:3000
```

### Service URLs

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:3000 |
| BFF (FastAPI) | http://localhost:8000 |
| Data Service (.NET) | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

---

## Rebuilding After Code Changes

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild a specific service (faster)
docker-compose up -d --build data-service
docker-compose up -d --build bff
docker-compose up -d --build frontend
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f data-service
docker-compose logs -f bff
docker-compose logs -f frontend
```

## Stopping Services

```bash
# Stop (preserves data)
docker-compose down

# Stop and wipe database (destructive!)
docker-compose down -v
```

---

## Project Structure

```
atklhub/
├── docs/                    ← You are here
├── feature-tests/           ← Integration test suite (pytest)
├── frontend/                ← React + Vite SPA
│   ├── src/
│   │   ├── components/      ← Reusable UI components
│   │   ├── pages/           ← Page-level route components
│   │   ├── App.jsx          ← Root component + router
│   │   └── index.css        ← Global styles + design tokens
│   └── Dockerfile
├── middle-tier/             ← Python FastAPI BFF
│   ├── main.py              ← All routes and forwarding logic
│   ├── requirements.txt
│   └── Dockerfile
├── data-service/            ← .NET 8 ASP.NET Core API
│   ├── Controllers/         ← HTTP endpoints
│   ├── Data/                ← EF Core contexts
│   ├── Models/              ← Entity classes
│   ├── Program.cs           ← App bootstrap + auth config + seeding
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Environment Configuration

### docker-compose.yml (key env vars)

```yaml
data-service:
  environment:
    - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;...
    - GOOGLE_CLIENT_ID=<your-google-client-id>
    # Optional — defaults to a dev key if not set:
    - JWT_SECRET=<your-strong-secret>
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable **Google Identity API**
3. Create **OAuth 2.0 Client ID** credentials (Web application)
4. Add `http://localhost:3000` to authorised JavaScript origins
5. Download the credentials JSON → place at `data-service/google-auth.json`
6. Set `GOOGLE_CLIENT_ID` in `docker-compose.yml`

---

## Local Development (Without Docker)

### Frontend
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

### BFF (Middle Tier)
```bash
cd middle-tier
pip install -r requirements.txt
DOTNET_API_URL=http://localhost:8080 uvicorn main:app --reload --port 8000
```

### Data Service
```bash
cd data-service
# Set connection string in appsettings.Development.json or env
dotnet run
```

---

## Seeded Data

On first boot the database is automatically populated with:
- **1 Admin user** (email: `admin@atklhub.com`)
- **3 sample articles** (Published) across different topics

To reset and reseed:
1. Temporarily uncomment `context.Database.EnsureDeleted();` in `Program.cs`
2. Rebuild the data-service container
3. Re-comment the line and rebuild again to restore persistence

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run the feature test suite: see [testing.md](./testing.md)
4. Submit a Pull Request against `main`

### Code Style
- **Frontend**: Functional React components, no class components
- **BFF**: All routes use the `_forward()` helper; keep handlers thin
- **Data Service**: Controller actions should be slim; business logic belongs in services (future refactor)
