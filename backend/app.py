from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import io
import logging

import numpy as np
from mediapipe import solutions as mp_solutions


from PIL import Image, ImageOps
from color_maps import recommended_color_map, avoid_color_map

# =========================
# LOGGING
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# =========================
# APP
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

logger.info("FastAPI app initialized")

# =========================
# MEDIAPIPE SETUP
# =========================
mp_face_mesh = mp_solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

logger.info("MediaPipe FaceMesh loaded")

# =========================
# HELPERS
# =========================
def calculate_brightness(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def compute_average_color(pixels):
    if not pixels:
        return [128, 128, 128], "#808080"

    avg = np.mean(np.array(pixels), axis=0).astype(np.uint8)
    return avg.tolist(), "#{:02x}{:02x}{:02x}".format(*avg)

# =========================
# CORE LOGIC
# =========================
def analyze_face_image(rgb_image: np.ndarray):
    logger.info("Starting face analysis")

    h, w, _ = rgb_image.shape

    results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        return None, "No face detected"

    landmarks = results.multi_face_landmarks[0].landmark

    # Convert normalized → pixel coordinates
    def lm(idx):
        return int(landmarks[idx].x * w), int(landmarks[idx].y * h)

    points = {
        "jaw_left": lm(234),
        "jaw_right": lm(454),
        "jaw_center": lm(152),
        "nose": lm(6),
        "left_cheek": lm(93),
        "right_cheek": lm(323),
        "left_mid": lm(205),
        "right_mid": lm(425),
        "mouth_left": lm(61),
        "mouth_right": lm(291),
    }

    # =========================
    # SAMPLE PAIRS (LOGIC PRESERVED)
    # =========================
    pairs = [
        ("jaw_left", "nose"),
        ("jaw_right", "nose"),
        ("left_cheek", "nose"),
        ("right_cheek", "nose"),
        ("left_mid", "jaw_center"),
        ("right_mid", "jaw_center"),
        ("nose", "jaw_center"),
        ("left_cheek", "mouth_left"),
        ("right_cheek", "mouth_right"),
    ]

    sample_points = []

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
        if 0 <= y < h and 0 <= x < w:
            r, g, b = rgb_image[y, x]
            if calculate_brightness(r, g, b) > 130:
                light.append((r, g, b))
            else:
                dark.append((r, g, b))

    avg_light_rgb, avg_light_hex = compute_average_color(light)
    avg_dark_rgb, avg_dark_hex = compute_average_color(dark)
    avg_total_rgb, avg_total_hex = compute_average_color(light + dark)

    skin_tone = "light" if len(light) > len(dark) else "dark"
    if abs(len(light) - len(dark)) / max(len(light) + len(dark), 1) < 0.5:
        skin_tone = "dusky"

    r, g, b = avg_total_rgb
    undertone = "Warm" if r > b else "Cool" if b > r else "Neutral"
    skin_subtype = f"{skin_tone.capitalize()} {undertone}"

    logger.info(f"Skin subtype detected: {skin_subtype}")

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
# ROUTES
# =========================
@app.get("/")
def health():
    return {"message": "API running"}

@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()

        pil_image = Image.open(io.BytesIO(image_bytes))
        pil_image = ImageOps.exif_transpose(pil_image)
        pil_image = pil_image.convert("RGB")

        rgb_image = np.array(pil_image, dtype=np.uint8)

        result, error = analyze_face_image(rgb_image)

        if error:
            return JSONResponse(status_code=400, content={"error": error})

        return result

    except Exception as e:
        logger.exception("SERVER CRASH")
        return JSONResponse(status_code=500, content={"error": str(e)})
