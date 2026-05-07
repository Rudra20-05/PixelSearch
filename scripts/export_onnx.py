"""
PixelSearch Phase 2 -- Segment 7
Export CLIP ViT-B/32 vision encoder to ONNX format for Android ONNX Runtime.

What this exports:
  - The IMAGE encoder only (vision transformer)
  - Input: preprocessed image tensor [1, 3, 224, 224]
  - Output: L2-normalized embedding vector [1, 512]

The TEXT encoder stays on the laptop (indexing only happens on PC).
On Android, the app will:
  1. Preprocess a phone photo → [1, 3, 224, 224] tensor
  2. Run it through this ONNX model → 512-dim embedding
  3. Search against a pre-built SQLite embedding database
"""

import os
import sys
import torch
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)).replace("scripts", ""))
from config import MODELS_DIR

# ──────────────────────────────────────────────
# Load CLIP via open_clip
# ──────────────────────────────────────────────
print("[EXPORT] Loading CLIP ViT-B/32 model...")
try:
    import open_clip
    model, _, preprocess = open_clip.create_model_and_transforms("ViT-B-32", pretrained="laion2b_s34b_b79k")
    model.eval()
    visual_encoder = model.visual
    print("[EXPORT] Model loaded (OpenCLIP)")
except Exception as e:
    print(f"[ERROR] Failed to load OpenCLIP: {e}")
    sys.exit(1)

# ──────────────────────────────────────────────
# Wrap the visual encoder so it outputs normalized embeddings
# ──────────────────────────────────────────────
class NormalizedVisualEncoder(torch.nn.Module):
    """Wraps CLIP visual encoder + L2 normalization into a single ONNX-exportable module."""
    def __init__(self, visual):
        super().__init__()
        self.visual = visual

    def forward(self, image):
        features = self.visual(image)
        # L2 normalize so cosine similarity = dot product
        norm = features.norm(dim=-1, keepdim=True).clamp(min=1e-6)
        return features / norm

wrapped = NormalizedVisualEncoder(visual_encoder)
wrapped.eval()

# ──────────────────────────────────────────────
# Export to ONNX
# ──────────────────────────────────────────────
dummy_input = torch.zeros(1, 3, 224, 224)  # Standard CLIP input resolution
output_path = os.path.join(MODELS_DIR, "clip_vision.onnx")

print(f"[EXPORT] Exporting to ONNX: {output_path}")
print("         Input shape:  (1, 3, 224, 224)")
print("         Output shape: (1, 512)")

with torch.no_grad():
    torch.onnx.export(
        wrapped,
        dummy_input,
        output_path,
        input_names=["image"],
        output_names=["embedding"],
        dynamic_axes={
            "image":     {0: "batch_size"},
            "embedding": {0: "batch_size"},
        },
        opset_version=17,
        do_constant_folding=True,
        export_params=True,
    )

print(f"[EXPORT] Saved: {output_path}")
size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"[EXPORT] File size: {size_mb:.1f} MB")

# ──────────────────────────────────────────────
# Validate the exported model with onnxruntime
# ──────────────────────────────────────────────
print("\n[VALIDATE] Running inference test with onnxruntime...")
import onnxruntime as ort
import onnx

# Check model validity
onnx_model = onnx.load(output_path)
onnx.checker.check_model(onnx_model)
print("[VALIDATE] ONNX model structure: OK")

# Run a test inference
session = ort.InferenceSession(output_path, providers=["CPUExecutionProvider"])
dummy_np = np.zeros((1, 3, 224, 224), dtype=np.float32)
outputs = session.run(["embedding"], {"image": dummy_np})
embedding = outputs[0]

print(f"[VALIDATE] Output shape:  {embedding.shape}")
print(f"[VALIDATE] Output dtype:  {embedding.dtype}")
norm = np.linalg.norm(embedding[0])
print(f"[VALIDATE] L2 norm: {norm:.6f} (should be ~1.0)")

# Compare ONNX output vs PyTorch output
with torch.no_grad():
    pt_out = wrapped(dummy_input).numpy()
max_diff = np.abs(embedding - pt_out).max()
print(f"[VALIDATE] Max diff PyTorch vs ONNX: {max_diff:.2e} (should be < 1e-4)")

if max_diff < 1e-3 and abs(norm - 1.0) < 0.01:
    print("\n[SUCCESS] CLIP vision encoder exported and validated successfully!")
    print(f"          Ready for Android: {output_path}")
else:
    print("\n[WARN] Outputs differ more than expected - check the model.")
