"""
PixelSearch -- Search API Router (Segment 5)
Handles REST calls for indexing and searching.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import os
import time

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    top_k: int = 15

class IndexCommand(BaseModel):
    image_dir: str

@router.post("/search")
async def search_images(query_data: SearchQuery, request: Request):
    """
    Perform a hybrid semantic + object tag search.
    """
    app_state = request.app.state
    
    # 1. Encode Text Query
    start_time = time.time()
    query_emb = app_state.encoder.encode_text(query_data.query)
    
    # 2. Vector Search Candidates
    candidates_k = min(query_data.top_k * 3, app_state.faiss_db.current_count)
    if candidates_k == 0:
        return {"results": [], "time_ms": 0, "message": "Index is empty."}
        
    distances, indices = app_state.faiss_db.search(query_emb, top_k=candidates_k)
    
    # 3. Hybrid Re-Rank
    results = app_state.hybrid.rank_results(query_data.query, distances, indices)
    
    search_time = (time.time() - start_time) * 1000
    
    return {
        "results": results[:query_data.top_k],
        "time_ms": round(search_time, 1)
    }

@router.get("/stats")
async def get_stats(request: Request):
    """Return database and index stats."""
    return {
        "total_images": request.app.state.faiss_db.current_count,
        "clip_model": request.app.state.encoder.model_name
    }

class TextEncodeRequest(BaseModel):
    text: str

@router.post("/encode-text")
async def encode_text(req: TextEncodeRequest, request: Request):
    """
    Encode a text query into a 512-dim CLIP embedding.
    Used by the mobile app: text is sent here, embedding returned,
    then the phone does cosine search against local embeddings.
    Only the text query travels over the network — images stay on-device.
    """
    embedding = request.app.state.encoder.encode_text(req.text)
    return {"embedding": embedding.tolist(), "dim": len(embedding)}
