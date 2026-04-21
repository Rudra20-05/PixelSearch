"""
PixelSearch -- Indexing Pipeline (Segment 3)
Scans image directories, generates CLIP embeddings, updates FAISS and SQLite.
"""

import os
import sys
import time
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import IMAGE_DIR, FAISS_INDEX_PATH
from backend.core.clip_encoder import CLIPEncoder, get_image_files
from backend.core.faiss_index import FAISSIndex
from backend.core.database import Database

def print_banner():
    print("""
================================================================
   PixelSearch Pipeline: Image Indexing (Segment 3)
================================================================
    """)

def main():
    parser = argparse.ArgumentParser(description="PixelSearch -- Indexing Pipeline")
    parser.add_argument("--image-dir", type=str, default=IMAGE_DIR,
                        help=f"Directory to scan for new images (default: {IMAGE_DIR})")
    parser.add_argument("--clear", action="store_true",
                        help="Clear existing index and database before running")
    args = parser.parse_args()

    print_banner()

    db = Database()
    faiss_db = FAISSIndex(dimension=512)
    encoder = CLIPEncoder()

    # Clear everything if requested
    if args.clear:
        print("[INIT] Clearing existing database and FAISS index...")
        db.clear()
        if os.path.exists(FAISS_INDEX_PATH):
            os.remove(FAISS_INDEX_PATH)
        # remove path mapping from Segment 2 if it exists
        paths_file = FAISS_INDEX_PATH.replace('.bin', '_paths.json')
        if os.path.exists(paths_file):
            os.remove(paths_file)

    # 1. Load existing FAISS index (if any)
    if os.path.exists(FAISS_INDEX_PATH):
        print(f"[FAISS] Loading existing index from {FAISS_INDEX_PATH}...")
        faiss_db.load_index(FAISS_INDEX_PATH)
    
    # 2. Find images
    print(f"\n[SCAN] Looking for images in: {args.image_dir}")
    all_image_paths = get_image_files(args.image_dir)
    
    if not all_image_paths:
        print(f"[ERROR] No images found in '{args.image_dir}'")
        return

    # 3. Filter out already indexed images
    indexed_paths = db.get_all_indexed_paths()
    new_image_paths = [p for p in all_image_paths if p not in indexed_paths]

    print(f"[INFO] Total images found: {len(all_image_paths)}")
    print(f"[INFO] Already indexed:    {len(indexed_paths)}")
    print(f"[INFO] New images to process: {len(new_image_paths)}\n")

    if not new_image_paths:
        print("[SUCCESS] All images are already indexed. Database is up to date!")
        return

    # 4. Generate Embeddings for NEW images
    process_start = time.time()
    embeddings, valid_paths = encoder.encode_images(new_image_paths)

    if len(valid_paths) == 0:
        print("[WARN] No valid images could be processed from the new batch.")
        return

    # 5. Add to FAISS and SQLite
    start_faiss_id = faiss_db.current_count
    
    print("\n[FAISS] Adding valid embeddings to vector index...")
    faiss_db.build_index(embeddings)
    
    # Update SQLite mapping based on the FAISS insert order
    print("[DB] Updating SQLite with metadata...")
    for idx, path in enumerate(valid_paths):
        faiss_id = start_faiss_id + idx
        filename = os.path.basename(path)
        db.add_image(faiss_id, filename, path)

    # Save FAISS
    faiss_db.save_index(FAISS_INDEX_PATH)

    total_time = time.time() - process_start
    print("\n================================================================")
    print(f"  [SUCCESS] Indexing Complete!")
    print(f"  Processed {len(valid_paths)} images in {total_time:.2f} seconds.")
    print(f"  Vector Index now contains {faiss_db.current_count} items.")
    print("================================================================")


if __name__ == "__main__":
    main()
