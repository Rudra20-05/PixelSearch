"""
PixelSearch -- CLI Search Script (Segment 1)
Search images using natural language with CLIP.

Usage:
    python backend/search.py
    python backend/search.py --image-dir path/to/images
    python backend/search.py --top-k 10
"""

import os
import sys
import time
import argparse

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import IMAGE_DIR, TOP_K
from backend.core.clip_encoder import CLIPEncoder, get_image_files


def print_banner():
    print("""
================================================================
    ____  _          _ ____                      _
   |  _ \\(_)_  _____| / ___|  ___  __ _ _ __ ___| |__
   | |_) | \\ \\/ / _ \\ \\___ \\ / _ \\/ _` | '__/ __| '_ \\
   |  __/| |>  <  __/ |___) |  __/ (_| | | | (__| | | |
   |_|   |_/_/\\_\\___|_|____/ \\___|\\__,_|_|  \\___|_| |_|

   AI-Powered Semantic Photo Search
   Segment 1: Basic CLIP Search
================================================================
    """)


def print_results(results: list, query: str):
    print(f"\n{'=' * 60}")
    print(f"  QUERY: \"{query}\"")
    print(f"  Top {len(results)} Results:")
    print(f"{'=' * 60}")

    for r in results:
        bar_len = int(r['score'] * 30)
        score_bar = "#" * bar_len + "." * (30 - bar_len)
        print(f"\n  #{r['rank']}  Score: {r['score']:.4f}  [{score_bar}]")
        print(f"      File: {r['filename']}")
        print(f"      Path: {r['path']}")

    print(f"\n{'=' * 60}")


def main():
    parser = argparse.ArgumentParser(description="PixelSearch -- Semantic Image Search")
    parser.add_argument("--image-dir", type=str, default=IMAGE_DIR,
                        help=f"Directory containing images (default: {IMAGE_DIR})")
    parser.add_argument("--top-k", type=int, default=TOP_K,
                        help=f"Number of results to return (default: {TOP_K})")
    args = parser.parse_args()

    print_banner()

    # Step 1: Find images
    print(f"[SCAN] Looking for images in: {args.image_dir}")
    image_paths = get_image_files(args.image_dir)

    if not image_paths:
        print(f"\n[ERROR] No images found in '{args.image_dir}'")
        print(f"   Add images (jpg, png, webp, etc.) to this folder and try again.")
        return

    print(f"   Found {len(image_paths)} images\n")

    # Step 2: Initialize CLIP
    encoder = CLIPEncoder()

    # Step 3: Generate embeddings
    print("\n[INDEX] Generating image embeddings...")
    start_time = time.time()
    image_embeddings, valid_paths = encoder.encode_images(image_paths)
    embed_time = time.time() - start_time

    if len(valid_paths) == 0:
        print("\n[ERROR] No images could be encoded. Check files for corruption.")
        return

    print(f"[TIME] Embedding time: {embed_time:.2f}s ({len(valid_paths)} images)")
    print(f"[INFO] Embedding shape: {image_embeddings.shape}")

    # Step 4: Interactive search loop
    print(f"\n{'=' * 60}")
    print(f"  READY! Type a description to search your images.")
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
        results = encoder.search(query, image_embeddings, valid_paths, top_k=args.top_k)
        search_time = time.time() - search_start

        print_results(results, query)
        print(f"  Search time: {search_time * 1000:.1f}ms")


if __name__ == "__main__":
    main()
