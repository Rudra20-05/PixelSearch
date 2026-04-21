"""
PixelSearch -- CLI Search Script (Segment 2)
Search images using natural language with CLIP and FAISS.

Usage:
    python backend/search.py
    python backend/search.py --build
    python backend/search.py --image-dir path/to/images
"""

import os
import sys
import time
import json
import argparse
import numpy as np

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import IMAGE_DIR, TOP_K, FAISS_INDEX_PATH
from backend.core.clip_encoder import CLIPEncoder, get_image_files
from backend.core.faiss_index import FAISSIndex


# Define path mapping file
PATHS_FILE = FAISS_INDEX_PATH.replace('.bin', '_paths.json')

def print_banner():
    print("""
================================================================
    ____  _          _ ____                      _
   |  _ \\(_)_  _____| / ___|  ___  __ _ _ __ ___| |__
   | |_) | \\ \\/ / _ \\ \\___ \\ / _ \\/ _` | '__/ __| '_ \\
   |  __/| |>  <  __/ |___) |  __/ (_| | | | (__| | | |
   |_|   |_/_/\\_\\___|_|____/ \\___|\\__,_|_|  \\___|_| |_|

   AI-Powered Semantic Photo Search
   Segment 2: FAISS Accelerated Search
================================================================
    """)


def print_results(distances: np.ndarray, indices: np.ndarray, paths: list, query: str):
    print(f"\n{'=' * 60}")
    print(f"  QUERY: \"{query}\"")
    print(f"  Top {len(indices)} Results:")
    print(f"{'=' * 60}")

    for rank, (score, idx) in enumerate(zip(distances, indices), 1):
        if idx < 0 or idx >= len(paths):
            continue # Invalid index fallback
        
        path = paths[idx]
        filename = os.path.basename(path)
        bar_len = int(score * 30)
        score_bar = "#" * bar_len + "." * (30 - bar_len)
        
        print(f"\n  #{rank}  Score: {score:.4f}  [{score_bar}]")
        print(f"      File: {filename}")
        print(f"      Path: {path}")

    print(f"\n{'=' * 60}")


def main():
    parser = argparse.ArgumentParser(description="PixelSearch -- Semantic Image Search")
    parser.add_argument("--image-dir", type=str, default=IMAGE_DIR,
                        help=f"Directory containing images (default: {IMAGE_DIR})")
    parser.add_argument("--top-k", type=int, default=TOP_K,
                        help=f"Number of results to return (default: {TOP_K})")
    parser.add_argument("--build", action="store_true",
                        help="Force rebuild of the FAISS index")
    args = parser.parse_args()

    print_banner()

    encoder = CLIPEncoder()
    faiss_db = FAISSIndex(dimension=512) # ViT-B/32 has 512-dim
    valid_paths = []

    # Check if we should load existing index or build a new one
    if not args.build and os.path.exists(FAISS_INDEX_PATH) and os.path.exists(PATHS_FILE):
        print("\n[INFO] Loading existing FAISS index...")
        load_start = time.time()
        faiss_db.load_index(FAISS_INDEX_PATH)
        with open(PATHS_FILE, 'r') as f:
            valid_paths = json.load(f)
        print(f"[TIME] Loading took: {time.time() - load_start:.2f}s")
        if faiss_db.current_count != len(valid_paths):
            print("[WARN] Index size mismatch with paths. Consider running with --build")
    else:
        # Build index from scratch
        print(f"\n[SCAN] Looking for images in: {args.image_dir}")
        image_paths = get_image_files(args.image_dir)

        if not image_paths:
            print(f"\n[ERROR] No images found in '{args.image_dir}'")
            return

        print(f"   Found {len(image_paths)} images\n")

        print("\n[INDEX] Generating image embeddings...")
        start_time = time.time()
        image_embeddings, valid_paths = encoder.encode_images(image_paths)
        embed_time = time.time() - start_time

        if len(valid_paths) == 0:
            print("\n[ERROR] No images could be encoded. Check files for corruption.")
            return

        print(f"[TIME] Embedding time: {embed_time:.2f}s ({len(valid_paths)} images)")
        
        # Build and save FAISS index
        print("\n[FAISS] Building vector index...")
        faiss_db.build_index(image_embeddings)
        faiss_db.save_index(FAISS_INDEX_PATH)
        with open(PATHS_FILE, 'w') as f:
            json.dump(valid_paths, f)

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

        print_results(distances, indices, valid_paths, query)
        print(f"  Search time: {search_time * 1000:.1f}ms")


if __name__ == "__main__":
    main()
