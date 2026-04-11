# Architecture

## Overview

ATKLHub is a **three-tier, loosely coupled content platform** containerised with Docker Compose. Each layer has a single responsibility and communicates via HTTP/REST.

```
┌───────────────────────────────────────────────────────────┐
│                    Browser / Client                        │
└────────────────────────┬──────────────────────────────────┘
                         │ HTTP  (port 3000)
┌────────────────────────▼──────────────────────────────────┐
│          Frontend  —  React + Vite + Nginx                 │
│  Serves static SPA; proxies /api/* to the BFF              │
└────────────────────────┬──────────────────────────────────┘
                         │ HTTP  (port 8000)
┌────────────────────────▼──────────────────────────────────┐
│        Middle Tier (BFF)  —  Python FastAPI                │
│  Route gateway, auth-header forwarding, error mapping      │
└────────────────────────┬──────────────────────────────────┘
                         │ HTTP  (port 8080)
┌────────────────────────▼──────────────────────────────────┐
│      Data Service  —  .NET 8 ASP.NET Core Web API          │
│  Business logic, EF Core ORM, JWT validation               │
└────────────────────────┬──────────────────────────────────┘
                         │ PostgreSQL protocol  (port 5432)
┌────────────────────────▼──────────────────────────────────┐
│          PostgreSQL 15  —  Persistent volume               │
└───────────────────────────────────────────────────────────┘
```

## Service Responsibilities

### Frontend (`/frontend`)

| Attribute | Detail |
|---|---|
| Tech | React 18, Vite 5, vanilla CSS |
| Serving | Nginx alpine container |
| Port | 3000 (host) → 80 (container) |
| Auth | Stores JWT in `localStorage`; passes `Authorization: Bearer <token>` header |
| Routing | React Router v6 — SPA with client-side navigation |

### Middle Tier / BFF (`/middle-tier`)

| Attribute | Detail |
|---|---|
| Tech | Python 3.11, FastAPI, httpx |
| Port | 8000 |
| Role | Backend-For-Frontend gateway; translates and forwards all `/api/*` calls |
| Auth | Transparently forwards the `Authorization` header to the Data Service |

### Data Service (`/data-service`)

| Attribute | Detail |
|---|---|
| Tech | .NET 8, ASP.NET Core Web API, Entity Framework Core, BCrypt.Net |
| Port | 8080 |
| Auth | Validates JWT tokens (Google OIDC + locally signed) |
| DB | PostgreSQL via Npgsql driver |

### Database

| Attribute | Detail |
|---|---|
| Engine | PostgreSQL 15 Alpine |
| Port | 5432 |
| Persistence | Named Docker volume `postgres_data` |
| Credentials | Configured via `docker-compose.yml` environment variables |

## Request Flow — Create Article

```
React (CreateArticle.jsx)
  → POST /api/articles  { title, content, status, ... }
    ↓ Authorization: Bearer <jwt>
  Python BFF (main.py → _forward)
    → POST http://data-service:8080/api/articles
      ↓ JWT validated by ASP.NET middleware
      ↓ Author resolved from token claims → DB lookup
      ↓ Article saved to PostgreSQL
    ← 201 Created { article }
  ← 201 Created { article }
React navigates to /dashboard
```

## Docker Compose Services

```yaml
services:
  postgres        # Persistent database
  data-service    # .NET API  — depends on postgres
  bff             # Python BFF — depends on data-service
  frontend        # Nginx SPA  — depends on bff
```

All services use `restart: always` for resilience.
