"""
PixelSearch -- AI Edit Router
Handles prompt-based image editing and AI video generation using external APIs.
NOTE: These features require internet access and send images to third-party services.
"""

import os
import sys
import base64
import httpx
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import IMAGE_DIR

router = APIRouter()

# ─── Request / Response Models ────────────────────────────────────────────────

class EditRequest(BaseModel):
    filename: str          # filename of the image already indexed
    prompt: str            # editing instruction, e.g. "add professional makeup"
    mode: str = "edit"     # "edit" | "video" | "enhance" | "style"
    consent: bool = False  # must be True or we reject the request

class EditResponse(BaseModel):
    mode: str
    result_url: str | None = None
    result_b64: str | None = None
    provider: str
    message: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _load_image_b64(filename: str) -> str:
    """Load an indexed image as a base64 string."""
    path = os.path.join(IMAGE_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Image not found: {filename}")
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def _get_api_key(env_var: str) -> str:
    key = os.getenv(env_var, "")
    if not key:
        raise HTTPException(
            status_code=503,
            detail=f"API key '{env_var}' is not configured. Set it as an environment variable."
        )
    return key


# ─── Edit Modes ───────────────────────────────────────────────────────────────

async def _edit_image_stability(filename: str, prompt: str) -> dict:
    """
    Prompt-based image editing using Stability AI (SDXL Inpaint / img2img).
    Requires env var: STABILITY_API_KEY
    """
    api_key = _get_api_key("STABILITY_API_KEY")
    img_b64 = _load_image_b64(filename)
    img_bytes = base64.b64decode(img_b64)

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.stability.ai/v2beta/stable-image/control/style",
            headers={"authorization": f"Bearer {api_key}", "accept": "image/*"},
            files={"image": (filename, img_bytes, "image/jpeg")},
            data={"prompt": prompt, "output_format": "jpeg", "fidelity": 0.5},
        )

    if response.status_code == 200:
        result_b64 = base64.b64encode(response.content).decode("utf-8")
        return {
            "result_b64": result_b64,
            "result_url": None,
            "provider": "Stability AI",
            "message": "Image edited successfully."
        }
    else:
        raise HTTPException(status_code=response.status_code,
                            detail=f"Stability AI error: {response.text}")


async def _generate_video_replicate(filename: str, prompt: str) -> dict:
    """
    AI video generation from an image using Replicate (Stable Video Diffusion).
    Requires env var: REPLICATE_API_TOKEN
    """
    api_key = _get_api_key("REPLICATE_API_TOKEN")
    img_b64 = _load_image_b64(filename)
    img_data_url = f"data:image/jpeg;base64,{img_b64}"

    payload = {
        "version": "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        "input": {
            "image": img_data_url,
            "motion_bucket_id": 127,
            "fps": 6,
            "augmentation_level": 0.02
        }
    }

    async with httpx.AsyncClient(timeout=300) as client:
        # Start the prediction
        resp = await client.post(
            "https://api.replicate.com/v1/predictions",
            headers={"Authorization": f"Token {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code,
                                detail=f"Replicate start error: {resp.text}")

        prediction = resp.json()
        poll_url = prediction.get("urls", {}).get("get")

        # Poll until done (max ~3 mins)
        for _ in range(60):
            import asyncio
            await asyncio.sleep(3)
            poll_resp = await client.get(
                poll_url,
                headers={"Authorization": f"Token {api_key}"}
            )
            poll_data = poll_resp.json()
            status = poll_data.get("status")
            if status == "succeeded":
                video_url = poll_data["output"]
                if isinstance(video_url, list):
                    video_url = video_url[0]
                return {
                    "result_url": video_url,
                    "result_b64": None,
                    "provider": "Replicate (Stable Video Diffusion)",
                    "message": "Video generated successfully."
                }
            elif status in ("failed", "canceled"):
                raise HTTPException(status_code=500,
                                    detail=f"Video generation failed: {poll_data.get('error')}")

    raise HTTPException(status_code=504, detail="Video generation timed out.")


async def _enhance_image_clarity(filename: str, prompt: str) -> dict:
    """
    AI image upscaling/enhancement using Stability AI Creative Upscale.
    Requires env var: STABILITY_API_KEY
    """
    api_key = _get_api_key("STABILITY_API_KEY")
    img_b64 = _load_image_b64(filename)
    img_bytes = base64.b64decode(img_b64)

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.stability.ai/v2beta/stable-image/upscale/creative",
            headers={"authorization": f"Bearer {api_key}", "accept": "image/*"},
            files={"image": (filename, img_bytes, "image/jpeg")},
            data={"prompt": prompt or "high quality, detailed, sharp", "output_format": "jpeg"},
        )

    if response.status_code == 200:
        result_b64 = base64.b64encode(response.content).decode("utf-8")
        return {
            "result_b64": result_b64,
            "result_url": None,
            "provider": "Stability AI Creative Upscale",
            "message": "Image enhanced successfully."
        }
    else:
        raise HTTPException(status_code=response.status_code,
                            detail=f"Stability AI error: {response.text}")


async def _style_transfer_replicate(filename: str, prompt: str) -> dict:
    """
    AI style transfer using Replicate (SDXL).
    Requires env var: REPLICATE_API_TOKEN
    """
    api_key = _get_api_key("REPLICATE_API_TOKEN")
    img_b64 = _load_image_b64(filename)
    img_data_url = f"data:image/jpeg;base64,{img_b64}"

    payload = {
        "version": "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
        "input": {
            "image": img_data_url,
            "prompt": prompt,
            "prompt_strength": 0.6,
            "num_inference_steps": 30
        }
    }

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            "https://api.replicate.com/v1/predictions",
            headers={"Authorization": f"Token {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code,
                                detail=f"Replicate error: {resp.text}")

        prediction = resp.json()
        poll_url = prediction.get("urls", {}).get("get")

        for _ in range(40):
            import asyncio
            await asyncio.sleep(3)
            poll_resp = await client.get(poll_url,
                                         headers={"Authorization": f"Token {api_key}"})
            poll_data = poll_resp.json()
            status = poll_data.get("status")
            if status == "succeeded":
                result_url = poll_data["output"]
                if isinstance(result_url, list):
                    result_url = result_url[0]
                return {
                    "result_url": result_url,
                    "result_b64": None,
                    "provider": "Replicate (SDXL)",
                    "message": "Style applied successfully."
                }
            elif status in ("failed", "canceled"):
                raise HTTPException(status_code=500,
                                    detail=f"Style transfer failed: {poll_data.get('error')}")

    raise HTTPException(status_code=504, detail="Style transfer timed out.")


async def _apply_makeup(filename: str, prompt: str) -> dict:
    """
    Makeup & beauty enhancement using Stability AI style control.
    Requires env var: STABILITY_API_KEY
    """
    api_key = _get_api_key("STABILITY_API_KEY")
    img_b64 = _load_image_b64(filename)
    img_bytes = base64.b64decode(img_b64)

    # Enrich the prompt with professional beauty photography language
    makeup_prompt = (
        f"professional beauty photography, {prompt}, "
        "flawless skin, soft studio lighting, high resolution portrait, sharp focus"
    )

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.stability.ai/v2beta/stable-image/control/style",
            headers={"authorization": f"Bearer {api_key}", "accept": "image/*"},
            files={"image": (filename, img_bytes, "image/jpeg")},
            data={"prompt": makeup_prompt, "output_format": "jpeg", "fidelity": 0.8},
        )

    if response.status_code == 200:
        result_b64 = base64.b64encode(response.content).decode("utf-8")
        return {
            "result_b64": result_b64,
            "result_url": None,
            "provider": "Stability AI",
            "message": "Makeup applied successfully."
        }
    else:
        raise HTTPException(status_code=response.status_code,
                            detail=f"Stability AI error: {response.text}")


# ─── Main Edit Endpoint ────────────────────────────────────────────────────────

@router.post("/edit", response_model=EditResponse)
async def edit_image(edit_data: EditRequest, request: Request):
    """
    Dispatches AI editing requests to appropriate external API.
    REQUIRES user consent (consent=True in request body).
    """
    if not edit_data.consent:
        raise HTTPException(
            status_code=403,
            detail="User consent is required. Set consent=true to proceed."
        )

    mode = edit_data.mode.lower()

    try:
        if mode == "edit":
            result = await _edit_image_stability(edit_data.filename, edit_data.prompt)
        elif mode == "enhance":
            result = await _enhance_image_clarity(edit_data.filename, edit_data.prompt)
        elif mode == "style":
            result = await _style_transfer_replicate(edit_data.filename, edit_data.prompt)
        elif mode == "video":
            result = await _generate_video_replicate(edit_data.filename, edit_data.prompt)
        elif mode == "makeup":
            result = await _apply_makeup(edit_data.filename, edit_data.prompt)
        else:
            raise HTTPException(status_code=400,
                                detail=f"Unknown mode '{mode}'. Valid: edit, enhance, style, video, makeup")
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return EditResponse(mode=mode, **result)


@router.get("/edit/modes")
async def list_edit_modes():
    """Return available AI editing modes and their descriptions."""
    return {
        "modes": [
            {
                "id": "edit",
                "label": "Edit with AI",
                "description": "Describe changes using natural language (e.g. 'add professional makeup')",
                "provider": "Stability AI",
                "output": "image",
                "icon": "✏️"
            },
            {
                "id": "enhance",
                "label": "Enhance & Upscale",
                "description": "AI-powered clarity enhancement and upscaling",
                "provider": "Stability AI",
                "output": "image",
                "icon": "✨"
            },
            {
                "id": "style",
                "label": "Apply Art Style",
                "description": "Transform photo into a painting, sketch, or other art style",
                "provider": "Replicate (SDXL)",
                "output": "image",
                "icon": "🎨"
            },
            {
                "id": "video",
                "label": "Animate to Video",
                "description": "Generate a short AI video/animation from your photo",
                "provider": "Replicate (Stable Video Diffusion)",
                "output": "video",
                "icon": "🎬"
            },
            {
                "id": "makeup",
                "label": "Makeup & Beauty",
                "description": "Apply professional makeup looks, enhance facial features, beauty retouching",
                "provider": "Stability AI",
                "output": "image",
                "icon": "💄"
            }
        ],
        "privacy_notice": "All AI editing features require sending your photo to third-party services (Stability AI / Replicate). Your photo will be transmitted over the internet. PixelSearch does not store or log any edited results."
    }
