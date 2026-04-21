"""
PixelSearch -- YOLOv8 Detector Module (Segment 4)
Handles object detection to extract semantic tags from images.
"""

import os
import sys
from ultralytics import YOLO

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import YOLO_MODEL_NAME, YOLO_CONFIDENCE_THRESHOLD, DEVICE

class YOLODetector:
    def __init__(self, model_name: str = YOLO_MODEL_NAME):
        """Initialize the YOLOv8 model."""
        self.model_name = model_name
        self.device = 'cuda' if DEVICE.type == 'cuda' else 'cpu'
        
        print(f"[YOLO] Loading model: {self.model_name} on {self.device}...")
        # Ultralytics will auto-download yolov8n.pt if it doesn't exist
        self.model = YOLO(self.model_name)

    def detect(self, image_path: str, conf_threshold: float = None) -> list:
        """
        Run object detection on an image.
        Returns a list of dictionaries with 'tag' and 'confidence'.
        """
        # Suppress ultralytics print statements
        conf = conf_threshold if conf_threshold is not None else YOLO_CONFIDENCE_THRESHOLD
        
        try:
            results = self.model(image_path, conf=conf, verbose=False, device=self.device)
            detections = []
            
            # results is a list with one item per image
            for r in results:
                # Iterate over detected boxes
                for box in r.boxes:
                    cls_id = int(box.cls[0].item())
                    confidence = float(box.conf[0].item())
                    label = self.model.names[cls_id]
                    
                    detections.append({
                        "tag": label,
                        "confidence": confidence
                    })
            
            # Deduplicate tags, keeping highest confidence
            deduped = {}
            for d in detections:
                tag = d['tag']
                if tag not in deduped or deduped[tag] < d['confidence']:
                    deduped[tag] = d['confidence']
                    
            return [{"tag": k, "confidence": v} for k, v in deduped.items()]
            
        except Exception as e:
            print(f"[WARN] YOLO detection failed for {os.path.basename(image_path)}: {e}")
            return []

    def get_labels(self, image_path: str) -> list[str]:
        """Convenience method to just get the list of tag names."""
        detections = self.detect(image_path)
        return [d['tag'] for d in detections]
