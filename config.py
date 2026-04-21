"""
PixelSearch — Central Configuration
Auto-detects GPU/CPU and sets all project-wide constants.
"""

import os
import sys
import io
import torch

# ──────────────────────────────────────────────
# Fix Windows console encoding for Unicode
# ──────────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

# ──────────────────────────────────────────────
# Device Configuration (auto-detect GPU/CPU)
# ──────────────────────────────────────────────
def get_device():
    """Auto-detect best available device: CUDA GPU > CPU"""
    if torch.cuda.is_available():
        device = torch.device("cuda")
        gpu_name = torch.cuda.get_device_name(0)
        print(f"[GPU] Using GPU: {gpu_name}")
    else:
        device = torch.device("cpu")
        print("[CPU] No GPU found -- using CPU (slower but works fine)")
    return device

DEVICE = get_device()

# ──────────────────────────────────────────────
# Project Paths
# ──────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
IMAGE_DIR = os.path.join(DATA_DIR, "images")
DB_PATH = os.path.join(DATA_DIR, "pixelsearch.db")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index.bin")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

# ──────────────────────────────────────────────
# CLIP Model Configuration
# ──────────────────────────────────────────────
CLIP_MODEL_NAME = "ViT-B/32"          # Good balance of speed & accuracy
CLIP_EMBEDDING_DIM = 512               # ViT-B/32 output dimension

# ──────────────────────────────────────────────
# Search Configuration
# ──────────────────────────────────────────────
TOP_K = 5                              # Default number of results to return
BATCH_SIZE = 32                        # Images to process at once during indexing

# ──────────────────────────────────────────────
# Supported Image Formats
# ──────────────────────────────────────────────
SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".gif"}

# ──────────────────────────────────────────────
# YOLOv8 Configuration (Segment 4)
# ──────────────────────────────────────────────
YOLO_MODEL_NAME = "yolov8n.pt"         # Nano model — fast on CPU
YOLO_CONFIDENCE_THRESHOLD = 0.3        # Minimum detection confidence

# ──────────────────────────────────────────────
# Hybrid Search Weights (Segment 4)
# ──────────────────────────────────────────────
CLIP_WEIGHT = 0.7                      # Weight for CLIP similarity score
TAG_WEIGHT = 0.3                       # Weight for YOLO tag matching score

# ──────────────────────────────────────────────
# FastAPI Configuration (Segment 5)
# ──────────────────────────────────────────────
API_HOST = "0.0.0.0"
API_PORT = 8000

# ──────────────────────────────────────────────
# Ensure directories exist
# ──────────────────────────────────────────────
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
