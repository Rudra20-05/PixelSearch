"""
PixelSearch -- FastAPI Application Backend (Segment 5)
Entry point for the REST API. Loads models at startup and provides routes.
"""

import os
import sys
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load .env file first — must happen before config or router imports read os.getenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import IMAGE_DIR, FAISS_INDEX_PATH
from backend.core.clip_encoder import CLIPEncoder
from backend.core.faiss_index import FAISSIndex
from backend.core.database import Database
from backend.core.hybrid_search import HybridSearch
from backend.routers.search_router import router as search_router
from backend.routers.edit_router import router as edit_router

# Use lifespan context manager to load heavy objects during startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n[STARTUP] Loading PixelSearch backend models...")
    
    # Init DB
    db = Database()
    
    # Init and load FAISS
    faiss_db = FAISSIndex(dimension=512)
    if os.path.exists(FAISS_INDEX_PATH):
        faiss_db.load_index(FAISS_INDEX_PATH)
    else:
        print("[WARN] FAISS Index not found. Re-run index.py manually.")
    
    # Init CLIP
    encoder = CLIPEncoder()
    
    # Init Hybrid Search
    hybrid = HybridSearch(db)
    
    # Make them globally accessible via app.state
    app.state.db = db
    app.state.faiss_db = faiss_db
    app.state.encoder = encoder
    app.state.hybrid = hybrid
    
    print("[STARTUP] Backend API ready.")
    yield
    print("\n[SHUTDOWN] Cleaning up...")

# Initialize FastAPI App
app = FastAPI(title="PixelSearch API", lifespan=lifespan)

# Allow CORS so the frontend can hit these routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route mounting
app.include_router(search_router, prefix="/api")
app.include_router(edit_router, prefix="/api")

# Mount Static Files (serve raw images for the UI)
os.makedirs(IMAGE_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")
# Also mount at /api/images so the frontend URL pattern works correctly
app.mount("/api/images", StaticFiles(directory=IMAGE_DIR), name="api_images")

@app.get("/")
def read_root():
    return {"message": "PixelSearch API is running. Hit /api/stats to verify."}

if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT
    uvicorn.run("app:app", host=API_HOST, port=API_PORT, reload=True)
