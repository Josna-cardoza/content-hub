from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="ATKLHub BFF API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOTNET_API_URL = os.getenv("DOTNET_API_URL", "http://localhost:8080")


@app.get("/health")
def health_check():
    return {"status": "ok", "layer": "python-bff"}


async def _forward(method: str, url: str, request: Request, data=None):
    """Generic forwarder that passes auth headers and returns upstream response."""
    auth_header = request.headers.get("Authorization")
    headers = {"Authorization": auth_header} if auth_header else {}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.request(method, url, json=data, headers=headers)
    # Forward the status code and body back to the caller
    try:
        body = resp.json()
    except Exception:
        body = {"message": resp.text or "Empty response"}
    return JSONResponse(status_code=resp.status_code, content=body)


# ── Articles ──────────────────────────────────────────────────────────────────

@app.get("/api/articles")
async def get_articles(request: Request):
    return await _forward("GET", f"{DOTNET_API_URL}/api/articles", request)


@app.get("/api/articles/my-content")
async def get_my_articles(request: Request):
    return await _forward("GET", f"{DOTNET_API_URL}/api/articles/my-content", request)


@app.get("/api/articles/{article_id}")
async def get_article(article_id: int, request: Request):
    return await _forward("GET", f"{DOTNET_API_URL}/api/articles/{article_id}", request)


@app.post("/api/articles")
async def create_article(request: Request):
    data = await request.json()
    return await _forward("POST", f"{DOTNET_API_URL}/api/articles", request, data)


@app.put("/api/articles/{article_id}")
async def update_article(article_id: int, request: Request):
    data = await request.json()
    return await _forward("PUT", f"{DOTNET_API_URL}/api/articles/{article_id}", request, data)


@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: int, request: Request):
    return await _forward("DELETE", f"{DOTNET_API_URL}/api/articles/{article_id}", request)


# ── Comments ──────────────────────────────────────────────────────────────────

@app.get("/api/comments/article/{article_id}")
async def get_comments(article_id: int, request: Request):
    return await _forward("GET", f"{DOTNET_API_URL}/api/comments/article/{article_id}", request)


@app.post("/api/comments")
async def create_comment(request: Request):
    data = await request.json()
    return await _forward("POST", f"{DOTNET_API_URL}/api/comments", request, data)


# ── Users ─────────────────────────────────────────────────────────────────────

@app.get("/api/users/profile")
async def get_profile(request: Request):
    return await _forward("GET", f"{DOTNET_API_URL}/api/users/profile", request)


@app.put("/api/users/profile")
async def update_profile(request: Request):
    data = await request.json()
    return await _forward("PUT", f"{DOTNET_API_URL}/api/users/profile", request, data)


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register")
async def register(request: Request):
    data = await request.json()
    return await _forward("POST", f"{DOTNET_API_URL}/api/auth/register", request, data)


@app.post("/api/auth/login")
async def login(request: Request):
    data = await request.json()
    return await _forward("POST", f"{DOTNET_API_URL}/api/auth/login", request, data)
