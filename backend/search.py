"""
PixelSearch -- CLI Search Script (Segment 3)
Search images using natural language, FAISS, and SQLite.

Usage:
    python backend/search.py
    python backend/search.py --top-k 10
"""

import os
import sys
import time
import argparse
import numpy as np

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import TOP_K, FAISS_INDEX_PATH
from backend.core.clip_encoder import CLIPEncoder
from backend.core.faiss_index import FAISSIndex
from backend.core.database import Database

def print_banner():
    print("""
================================================================
    ____  _          _ ____                      _
   |  _ \\(_)_  _____| / ___|  ___  __ _ _ __ ___| |__
   | |_) | \\ \\/ / _ \\ \\___ \\ / _ \\/ _` | '__/ __| '_ \\
   |  __/| |>  <  __/ |___) |  __/ (_| | | | (__| | | |
   |_|   |_/_/\\_\\___|_|____/ \\___|\\__,_|_|  \\___|_| |_|

   AI-Powered Semantic Photo Search
   Segment 3: Database-Driven Search
================================================================
    """)

def print_results(distances: np.ndarray, indices: np.ndarray, db: Database, query: str):
    print(f"\n{'=' * 60}")
    print(f"  QUERY: \"{query}\"")
    print(f"  Top {len(indices)} Results:")
    print(f"{'=' * 60}")

    for rank, (score, faiss_id) in enumerate(zip(distances, indices), 1):
        if faiss_id < 0:
            continue
        
        # Look up image data by FAISS index
        img_data = db.get_image_by_faiss_id(int(faiss_id))
        if not img_data:
            print(f"\n  #{rank}  [Missing in DB for ID {faiss_id}]")
            continue
            
        path = img_data['filepath']
        filename = img_data['filename']
        bar_len = int(score * 30)
        score_bar = "#" * bar_len + "." * (30 - bar_len)
        
        print(f"\n  #{rank}  Score: {score:.4f}  [{score_bar}]")
        print(f"      File: {filename}")
        print(f"      Path: {path}")

    print(f"\n{'=' * 60}")


def main():
    parser = argparse.ArgumentParser(description="PixelSearch -- Semantic Image Search")
    parser.add_argument("--top-k", type=int, default=TOP_K,
                        help=f"Number of results to return (default: {TOP_K})")
    args = parser.parse_args()

    print_banner()

    encoder = CLIPEncoder()
    faiss_db = FAISSIndex(dimension=512)
    db = Database()

    # Require existing index (Indexing happens via index.py now)
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
    print(f"\n{'=' * 60}")
    print(f"  READY! Type a description to search {faiss_db.current_count} images.")
    print(f"  Type 'quit' or 'exit' to stop.")
    print(f"{'=' * 60}")

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
        query_emb = encoder.encode_text(query)
        distances, indices = faiss_db.search(query_emb, top_k=args.top_k)
        search_time = time.time() - search_start

        print_results(distances, indices, db, query)
        print(f"  Search time: {search_time * 1000:.1f}ms")

if __name__ == "__main__":
    main()
