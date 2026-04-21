"""
Download sample images for testing PixelSearch.
Uses free, diverse images from picsum.photos.
"""

import os
import sys
import io
import urllib.request
import time

# Fix Windows encoding
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Inline IMAGE_DIR to avoid importing config (which loads torch)
IMAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "images")

# Curated sample image URLs -- diverse scenes for testing semantic search
SAMPLE_IMAGES = {
    # Nature & Landscapes
    "mountain_landscape.jpg": "https://picsum.photos/id/29/800/600",
    "ocean_sunset.jpg": "https://picsum.photos/id/100/800/600",
    "forest_path.jpg": "https://picsum.photos/id/15/800/600",
    "desert_sand.jpg": "https://picsum.photos/id/247/800/600",
    "waterfall_nature.jpg": "https://picsum.photos/id/164/800/600",
    "lake_reflection.jpg": "https://picsum.photos/id/169/800/600",
    "flower_garden.jpg": "https://picsum.photos/id/106/800/600",
    "snowy_mountain.jpg": "https://picsum.photos/id/110/800/600",

    # Urban & Architecture
    "city_skyline.jpg": "https://picsum.photos/id/274/800/600",
    "old_building.jpg": "https://picsum.photos/id/122/800/600",
    "bridge_structure.jpg": "https://picsum.photos/id/177/800/600",
    "street_night.jpg": "https://picsum.photos/id/262/800/600",
    "modern_office.jpg": "https://picsum.photos/id/180/800/600",
    "church_cathedral.jpg": "https://picsum.photos/id/137/800/600",

    # People & Activities
    "person_reading.jpg": "https://picsum.photos/id/367/800/600",
    "people_group.jpg": "https://picsum.photos/id/329/800/600",
    "person_hiking.jpg": "https://picsum.photos/id/240/800/600",

    # Animals
    "dog_pet.jpg": "https://picsum.photos/id/237/800/600",
    "cat_sleeping.jpg": "https://picsum.photos/id/40/800/600",
    "birds_flying.jpg": "https://picsum.photos/id/210/800/600",

    # Objects & Food
    "coffee_cup.jpg": "https://picsum.photos/id/225/800/600",
    "laptop_desk.jpg": "https://picsum.photos/id/2/800/600",
    "old_books.jpg": "https://picsum.photos/id/24/800/600",
    "camera_photo.jpg": "https://picsum.photos/id/250/800/600",
    "food_plate.jpg": "https://picsum.photos/id/292/800/600",

    # Vehicles & Transport
    "car_road.jpg": "https://picsum.photos/id/133/800/600",
    "bicycle_street.jpg": "https://picsum.photos/id/146/800/600",
    "boat_water.jpg": "https://picsum.photos/id/119/800/600",
    "train_tracks.jpg": "https://picsum.photos/id/184/800/600",

    # Misc
    "colorful_abstract.jpg": "https://picsum.photos/id/197/800/600",
}


def download_images():
    os.makedirs(IMAGE_DIR, exist_ok=True)

    total = len(SAMPLE_IMAGES)
    downloaded = 0
    skipped = 0
    failed = 0

    print(f"[DOWNLOAD] Downloading {total} sample images to: {IMAGE_DIR}\n")

    for filename, url in SAMPLE_IMAGES.items():
        filepath = os.path.join(IMAGE_DIR, filename)

        if os.path.exists(filepath):
            print(f"   [SKIP] {filename} (already exists)")
            skipped += 1
            continue

        try:
            print(f"   [GET]  {filename}...", end=" ", flush=True)
            urllib.request.urlretrieve(url, filepath)
            size_kb = os.path.getsize(filepath) / 1024
            print(f"OK ({size_kb:.0f} KB)")
            downloaded += 1
            time.sleep(0.3)
        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1

    print(f"\n{'=' * 50}")
    print(f"  Downloaded: {downloaded}")
    print(f"  Skipped:    {skipped}")
    print(f"  Failed:     {failed}")
    print(f"  Total:      {downloaded + skipped} images ready")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    download_images()
