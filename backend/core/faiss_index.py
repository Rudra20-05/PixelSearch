"""
PixelSearch -- FAISS Index Module
Handles high-speed vector similarity search using FAISS.
"""

import os
import faiss
import numpy as np

class FAISSIndex:
    """
    Wrapper for FAISS vector database.
    We use IndexFlatIP (Inner Product) since our CLIP embeddings are L2 normalized,
    which makes Inner Product mathematically equivalent to Cosine Similarity.
    """

    def __init__(self, dimension: int = 512):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)

    def build_index(self, embeddings: np.ndarray):
        """
        Build a FAISS index from a numpy array of embeddings.
        Automatically L2-normalizes the vectors before adding them.
        """
        if embeddings is None or embeddings.size == 0:
            print("[WARN] Received empty embeddings array.")
            return

        # Ensure embeddings are float32 (required by FAISS)
        embeddings = embeddings.astype('float32')

        # FAISS normalization is done in-place
        faiss.normalize_L2(embeddings)

        self.index.reset()
        self.index.add(embeddings)
        print(f"[FAISS] Built index with {self.index.ntotal} vectors.")

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> tuple[np.ndarray, np.ndarray]:
        """
        Search the index for the top K closest matches to the query.
        
        Args:
            query_embedding: 1D numpy array of shape (dimension,)
            top_k: Number of results to return
            
        Returns:
            Tuple of (distances, indices)
        """
        if self.index.ntotal == 0:
            print("[FAISS] Warning: Searching an empty index.")
            return np.array([]), np.array([])

        query_embedding = query_embedding.astype('float32').reshape(1, -1)
        faiss.normalize_L2(query_embedding)

        # distances are cosine similarity scores
        distances, indices = self.index.search(query_embedding, top_k)
        
        # Flatten the results since we only have one query
        return distances[0], indices[0]

    def save_index(self, path: str):
        """Save the FAISS index to disk."""
        faiss.write_index(self.index, path)
        print(f"[FAISS] Saved index to {path}")

    def load_index(self, path: str):
        """Load a FAISS index from disk."""
        if not os.path.exists(path):
            print(f"[FAISS] Error: Index file not found at {path}")
            return False
            
        self.index = faiss.read_index(path)
        print(f"[FAISS] Loaded index from {path} ({self.index.ntotal} vectors)")
        return True

    @property
    def current_count(self) -> int:
        """Get the number of vectors currently in the index."""
        return self.index.ntotal
