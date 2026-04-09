from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="ATKLHub BFF API", version="1.0.0")

# Allow CORS for React frontend
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

@app.get("/api/articles")
async def get_articles():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{DOTNET_API_URL}/api/articles")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Data service unavailable: {str(e)}")

@app.get("/api/articles/{article_id}")
async def get_article(article_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{DOTNET_API_URL}/api/articles/{article_id}")
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Article not found")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Data service unavailable: {str(e)}")

@app.post("/api/articles")
async def create_article(request: Request):
    data = await request.json()
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{DOTNET_API_URL}/api/articles", json=data)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Data service unavailable: {str(e)}")
