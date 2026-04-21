"""
PixelSearch -- Hybrid Search Module (Segment 4)
Combines semantic similarity from CLIP/FAISS with exact object tag matches from YOLO.
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import CLIP_WEIGHT, TAG_WEIGHT
from backend.core.database import Database

class HybridSearch:
    def __init__(self, db: Database, clip_weight: float = CLIP_WEIGHT, tag_weight: float = TAG_WEIGHT):
        self.db = db
        # Normalize weights to sum to 1.0 just in case
        total = clip_weight + tag_weight
        self.clip_weight = clip_weight / total
        self.tag_weight = tag_weight / total

    def _compute_tag_score(self, query: str, image_tags: list) -> float:
        """
        Calculates how well the query matches the image's tags.
        Returns a score between 0.0 and 1.0.
        """
        if not image_tags:
            return 0.0
            
        query_words = set(query.lower().split())
        matched_tags = 0
        total_tag_conf = 0.0
        
        for item in image_tags:
            tag = item['tag'].lower()
            conf = item['confidence']
            
            # Simple keyword match: if tag name is in query or query words hit the tag
            if tag in query_words or any(w in tag for w in query_words):
                matched_tags += 1
                total_tag_conf += conf
                
        # Base the score on confidence of matched tags vs. total unique tags matched
        # Simple cap at 1.0
        if matched_tags == 0:
            return 0.0
            
        score = min(total_tag_conf / max(len(query_words), 1), 1.0)
        return score

    def rank_results(
        self, 
        query: str, 
        faiss_distances: np.ndarray, 
        faiss_indices: np.ndarray
    ) -> list:
        """
        Ranks search results by combining FAISS cosine distances and YOLO tag scores.
        
        Args:
            query: The original text query
            faiss_distances: Normalized float array of CLIP similarity scores
            faiss_indices: Int array of FAISS row IDs
            
        Returns:
            List of dicts containing combined rankings and metadata
        """
        results = []
        
        for clip_score, faiss_id in zip(faiss_distances, faiss_indices):
            if faiss_id < 0:
                continue
                
            img_data = self.db.get_image_by_faiss_id(int(faiss_id))
            if not img_data:
                continue
                
            image_id = img_data['id']
            tags = self.db.get_tags_for_image(image_id)
            
            # Get YOLO score
            tag_score = self._compute_tag_score(query, tags)
            
            # Combine scores
            final_score = (self.clip_weight * clip_score) + (self.tag_weight * tag_score)
            
            results.append({
                "faiss_id": int(faiss_id),
                "image_id": image_id,
                "filepath": img_data['filepath'],
                "filename": img_data['filename'],
                "clip_score": float(clip_score),
                "tag_score": float(tag_score),
                "final_score": float(final_score),
                "tags": [t['tag'] for t in tags]
            })
            
        # Re-sort results by the final hybrid score (descending)
        results.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Re-assign ranks
        for rank, r in enumerate(results, 1):
            r['rank'] = rank
            
        return results
