"""
PixelSearch -- CLI Search Script (Segment 4)
Search images using natural language (CLIP) + Object matching (YOLO).

Usage:
    python backend/search.py
    python backend/search.py --top-k 10
"""

import os
import sys
import time
import argparse
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import TOP_K, FAISS_INDEX_PATH
from backend.core.clip_encoder import CLIPEncoder
from backend.core.faiss_index import FAISSIndex
from backend.core.database import Database
from backend.core.hybrid_search import HybridSearch

def print_banner():
    print("""
================================================================
    ____  _          _ ____                      _
   |  _ \\(_)_  _____| / ___|  ___  __ _ _ __ ___| |__
   | |_) | \\ \\/ / _ \\ \\___ \\ / _ \\/ _` | '__/ __| '_ \\
   |  __/| |>  <  __/ |___) |  __/ (_| | | | (__| | | |
   |_|   |_/_/\\_\\___|_|____/ \\___|\\__,_|_|  \\___|_| |_|

   AI-Powered Semantic Photo Search
   Segment 4: Hybrid Search (CLIP + YOLOv8)
================================================================
    """)

def print_results(results: list, query: str):
    print(f"\n{'=' * 70}")
    print(f"  QUERY: \"{query}\"")
    print(f"  Top {len(results)} Results:")
    print(f"{'=' * 70}")

    for r in results:
        path = r['filepath']
        filename = r['filename']
        clip_score = r['clip_score']
        tag_score = r['tag_score']
        final = r['final_score']
        tags_str = ", ".join(r['tags'][:5]) + ("..." if len(r['tags']) > 5 else "")
        
        bar_len = int(final * 30)
        score_bar = "#" * bar_len + "." * (30 - bar_len)
        
        print(f"\n  #{r['rank']}  Final: {final:.3f}  [{score_bar}]")
        print(f"      Scores: CLIP={clip_score:.3f} | Tags={tag_score:.3f}")
        print(f"      File:   {filename}")
        print(f"      Tags:   {tags_str}")

    print(f"\n{'=' * 70}")


def main():
    parser = argparse.ArgumentParser(description="PixelSearch -- Hybrid Search")
    parser.add_argument("--top-k", type=int, default=TOP_K,
                        help=f"Number of results to return (default: {TOP_K})")
    args = parser.parse_args()

    print_banner()

    encoder = CLIPEncoder()
    faiss_db = FAISSIndex(dimension=512)
    db = Database()
    hybrid = HybridSearch(db)

    if not os.path.exists(FAISS_INDEX_PATH):
        print("\n[ERROR] FAISS index not found. Please run 'python backend/index.py' first.")
        return

    print("\n[INFO] Loading Database and FAISS Index...")
    load_start = time.time()
    faiss_db.load_index(FAISS_INDEX_PATH)
    print(f"[TIME] Loading took: {time.time() - load_start:.2f}s")
    
    indexed_paths = db.get_all_indexed_paths()
    if faiss_db.current_count != len(indexed_paths):
        print("[WARN] Index size mismatch with database! Run 'python backend/index.py --clear'")

    # Interactive search loop
    print(f"\n{'=' * 70}")
    print(f"  READY! Type a description to search {faiss_db.current_count} images.")
    print(f"  Type 'quit' or 'exit' to stop.")
    print(f"{'=' * 70}")

    while True:
        try:
            query = input("\n>> Search: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nGoodbye!")
            break

        if not query:
            continue
        if query.lower() in ("quit", "exit", "q"):
            print("\nGoodbye!")
            break

        search_start = time.time()
        
        # 1. Semantic Search (CLIP -> FAISS)
        # Fetch more candidates to re-rank with YOLO
        query_emb = encoder.encode_text(query)
        candidates_k = min(args.top_k * 3, faiss_db.current_count)
        distances, indices = faiss_db.search(query_emb, top_k=candidates_k)
        
        # 2. Hybrid Re-ranking (YOLO)
        results = hybrid.rank_results(query, distances, indices)
        
        search_time = time.time() - search_start

        # Just take top_k after re-ranking
        print_results(results[:args.top_k], query)
        print(f"  Search time: {search_time * 1000:.1f}ms")

if __name__ == "__main__":
    main()
