"""
PixelSearch -- CLIP Encoder Module
Handles image and text embedding generation using OpenAI CLIP (ViT-B/32).
Automatically uses GPU if available, otherwise falls back to CPU.
"""

import os
import sys
import torch
import clip
import numpy as np
from PIL import Image
from typing import List, Tuple, Optional

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import DEVICE, CLIP_MODEL_NAME, CLIP_EMBEDDING_DIM, SUPPORTED_FORMATS, BATCH_SIZE


class CLIPEncoder:
    """
    Wraps OpenAI CLIP model for generating image and text embeddings.

    Usage:
        encoder = CLIPEncoder()
        img_embeddings = encoder.encode_images(["photo1.jpg", "photo2.jpg"])
        txt_embedding = encoder.encode_text("a dog playing in the park")
        results = encoder.search(txt_embedding, img_embeddings, top_k=5)
    """

    def __init__(self, model_name: str = None, device: torch.device = None):
        self.device = device or DEVICE
        self.model_name = model_name or CLIP_MODEL_NAME

        print(f"[CLIP] Loading model: {self.model_name}...")
        self.model, self.preprocess = clip.load(self.model_name, device=self.device)
        self.model.eval()
        print(f"[CLIP] Model loaded on {self.device}")

    def encode_image(self, image_path: str) -> Optional[np.ndarray]:
        """Generate embedding for a single image. Returns normalized 512-dim vector or None."""
        try:
            image = Image.open(image_path).convert("RGB")
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                embedding = self.model.encode_image(image_tensor)

            # L2 normalize for cosine similarity
            embedding = embedding / embedding.norm(dim=-1, keepdim=True)
            return embedding.cpu().numpy().flatten()

        except Exception as e:
            print(f"[WARN] Failed to encode {os.path.basename(image_path)}: {e}")
            return None

    def encode_images(self, image_paths: List[str], batch_size: int = None) -> Tuple[np.ndarray, List[str]]:
        """
        Generate embeddings for multiple images in batches.

        Returns:
            Tuple of (embeddings array [N x 512], list of successfully encoded paths)
        """
        batch_size = batch_size or BATCH_SIZE
        all_embeddings = []
        valid_paths = []

        total = len(image_paths)
        print(f"\n[CLIP] Encoding {total} images...")

        for i in range(0, total, batch_size):
            batch_paths = image_paths[i:i + batch_size]
            batch_images = []
            batch_valid_paths = []

            for path in batch_paths:
                try:
                    image = Image.open(path).convert("RGB")
                    image_tensor = self.preprocess(image)
                    batch_images.append(image_tensor)
                    batch_valid_paths.append(path)
                except Exception as e:
                    print(f"[WARN] Skipping {os.path.basename(path)}: {e}")

            if not batch_images:
                continue

            batch_tensor = torch.stack(batch_images).to(self.device)

            with torch.no_grad():
                embeddings = self.model.encode_image(batch_tensor)

            embeddings = embeddings / embeddings.norm(dim=-1, keepdim=True)
            all_embeddings.append(embeddings.cpu().numpy())
            valid_paths.extend(batch_valid_paths)

            processed = min(i + batch_size, total)
            print(f"   [{processed}/{total}] images processed")

        print(f"[CLIP] Successfully encoded {len(valid_paths)}/{total} images")

        if all_embeddings:
            return np.vstack(all_embeddings), valid_paths
        else:
            return np.array([]), []

    def encode_text(self, query: str) -> np.ndarray:
        """Generate normalized embedding for a text query. Returns 512-dim vector."""
        text_tokens = clip.tokenize([query]).to(self.device)

        with torch.no_grad():
            text_embedding = self.model.encode_text(text_tokens)

        text_embedding = text_embedding / text_embedding.norm(dim=-1, keepdim=True)
        return text_embedding.cpu().numpy().flatten()

    @staticmethod
    def cosine_similarity(query_embedding: np.ndarray, image_embeddings: np.ndarray) -> np.ndarray:
        """Compute cosine similarity (dot product on L2-normalized vectors)."""
        return np.dot(image_embeddings, query_embedding)

    def search(
        self,
        query: str,
        image_embeddings: np.ndarray,
        image_paths: List[str],
        top_k: int = 5
    ) -> List[dict]:
        """
        Search images by natural language query.

        Returns:
            List of dicts with 'path', 'filename', 'score', 'rank'
        """
        query_embedding = self.encode_text(query)
        similarities = self.cosine_similarity(query_embedding, image_embeddings)
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for rank, idx in enumerate(top_indices, 1):
            results.append({
                "rank": rank,
                "path": image_paths[idx],
                "filename": os.path.basename(image_paths[idx]),
                "score": float(similarities[idx]),
            })

        return results


def get_image_files(directory: str) -> List[str]:
    """Recursively scan a directory for supported image files."""
    image_files = []
    for root, _, files in os.walk(directory):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in SUPPORTED_FORMATS:
                image_files.append(os.path.join(root, f))
    image_files.sort()
    return image_files
