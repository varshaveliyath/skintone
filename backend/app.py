from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import io
import os
import bz2
import urllib.request
import logging

import cv2
import dlib
import numpy as np

from PIL import Image, ImageOps

from color_maps import recommended_color_map, avoid_color_map


# =========================
# LOGGING SETUP (RENDER SAFE)
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


# =========================
# App setup
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skintone-lime.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("✅ FastAPI app initialized")

# =========================
# Dlib model setup
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DLIB_MODEL_PATH = os.path.join(BASE_DIR, "shape_predictor_68_face_landmarks.dat")

logger.info(f"📂 Looking for dlib model at: {DLIB_MODEL_PATH}")

# 🚫 DO NOT DOWNLOAD AT RUNTIME (Render unsafe)
if not os.path.exists(DLIB_MODEL_PATH):
    logger.error("❌ shape_predictor_68_face_landmarks.dat NOT FOUND")
    logger.error("❌ Place the file in the backend folder and redeploy")
    raise RuntimeError("Missing dlib shape predictor model")

# ✅ Lightweight detector (always safe)
face_detector = dlib.get_frontal_face_detector()

# ✅ Heavy model — must load successfully or app should fail
landmark_predictor = dlib.shape_predictor(DLIB_MODEL_PATH)

logger.info("✅ dlib face detector loaded")



# =========================
# Helper functions
# =========================
def calculate_brightness(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def compute_average_color(pixels):
    if not pixels:
        return [128, 128, 128], "#808080"

    avg = np.mean(np.array(pixels), axis=0).astype(np.uint8)
    return avg.tolist(), "#{:02x}{:02x}{:02x}".format(*avg)


# =========================
# Core analysis logic
# =========================
def analyze_face_image(rgb_image: np.ndarray):
    logger.info("🧠 Starting face analysis")

    # 🔒 HARD ENFORCEMENT — uint8 RGB, contiguous
    rgb_image = np.asarray(rgb_image, dtype=np.uint8)
    rgb_image = np.ascontiguousarray(rgb_image)

    logger.info(
        f"📸 RGB image shape: {rgb_image.shape}, "
        f"dtype: {rgb_image.dtype}, "
        f"contiguous: {rgb_image.flags['C_CONTIGUOUS']}"
    )

    # 🔑 CRITICAL STEP — dlib ONLY accepts 8-bit GRAYSCALE
    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY)
    gray = np.asarray(gray, dtype=np.uint8)
    gray = np.ascontiguousarray(gray)

    logger.info(
        f"📸 Gray image shape: {gray.shape}, "
        f"dtype: {gray.dtype}, "
        f"contiguous: {gray.flags['C_CONTIGUOUS']}"
    )

    # ✅ FINAL & CORRECT dlib call
    logger.info("🔍 Running face detector")
    faces = face_detector(gray)

    logger.info(f"🙂 Faces detected: {len(faces)}")

    if len(faces) == 0:
        return None, "No face detected"

    landmarks = landmark_predictor(gray, faces[0])
    points = [(p.x, p.y) for p in landmarks.parts()]

    # =========================
    # Sample skin pixels
    # =========================
    sample_points = []
    pairs = [
    # Jaw ↔ mid-face
    (1, 31), (2, 31), (3, 31), (4, 31), (5, 31),
    (11, 35), (12, 35), (13, 35), (14, 35), (15, 35),

    # Cheek ↔ nose bridge
    (6, 28), (7, 28), (8, 28), (9, 28), (10, 28),

    # Nose bridge ↔ jaw center
    (27, 8), (28, 8), (29, 8),

    # Upper cheek cross-samples
    (31, 48), (35, 54)
]

    for s, e in pairs:
        x1, y1 = points[s]
        x2, y2 = points[e]
        for i in range(1, 6):
            t = i / 6
            sample_points.append((
                int(x1 + t * (x2 - x1)),
                int(y1 + t * (y2 - y1))
            ))

    light, dark = [], []

    for x, y in sample_points:
        if 0 <= y < rgb_image.shape[0] and 0 <= x < rgb_image.shape[1]:
            r, g, b = rgb_image[y, x]
            if calculate_brightness(r, g, b) > 130:
                light.append((r, g, b))
            else:
                dark.append((r, g, b))

    avg_light_rgb, avg_light_hex = compute_average_color(light)
    avg_dark_rgb, avg_dark_hex = compute_average_color(dark)
    avg_total_rgb, avg_total_hex = compute_average_color(light + dark)

    # =========================
    # Skin tone classification
    # =========================
    skin_tone = "light" if len(light) > len(dark) else "dark"
    if abs(len(light) - len(dark)) / max(len(light) + len(dark), 1) < 0.5:
        skin_tone = "dusky"

    r, g, b = avg_total_rgb
    undertone = "Warm" if r > b else "Cool" if b > r else "Neutral"
    skin_subtype = f"{skin_tone.capitalize()} {undertone}"

    logger.info(f"🎨 Skin subtype detected: {skin_subtype}")

    return {
        "skin_tone": skin_tone,
        "skin_subtype": skin_subtype,
        "undertone": undertone,
        "avg_light_rgb": avg_light_rgb,
        "avg_light_hex": avg_light_hex,
        "avg_dark_rgb": avg_dark_rgb,
        "avg_dark_hex": avg_dark_hex,
        "avg_total_rgb": avg_total_rgb,
        "avg_total_hex": avg_total_hex,
        "recommended_colors": recommended_color_map.get(skin_subtype, []),
        "avoid_colors": avoid_color_map.get(skin_subtype, []),
    }, None


# =========================
# Routes
# =========================
@app.get("/")
def health():
    logger.info("💓 Health check hit")
    return {"message": "API running"}


@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    logger.info("🔥 /analyze endpoint HIT")

    try:
        image_bytes = await image.read()
        logger.info(f"📦 Image received: {len(image_bytes)} bytes")

        pil_image = Image.open(io.BytesIO(image_bytes))
        pil_image = ImageOps.exif_transpose(pil_image)
        pil_image = pil_image.convert("RGB")

        rgb_image = np.array(pil_image, dtype=np.uint8)

        result, error = analyze_face_image(rgb_image)

        if error:
            logger.warning(f"⚠️ Analysis error: {error}")
            return JSONResponse(status_code=400, content={"error": error})

        logger.info("✅ Analysis successful")
        return result

    except Exception as e:
        logger.exception("💥 SERVER CRASH")
        return JSONResponse(status_code=500, content={"error": str(e)})
