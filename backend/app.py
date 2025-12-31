from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import cv2
import dlib
import numpy as np
import os
import urllib.request
import bz2

from PIL import Image

# 🔹 IMPORT SPLIT COLOR MAPS
from color_maps import recommended_color_map, avoid_color_map


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

# =========================
# Dlib model setup
# =========================

DLIB_MODEL_URL = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
DLIB_MODEL_PATH = "shape_predictor_68_face_landmarks.dat"

if not os.path.exists(DLIB_MODEL_PATH):
    bz2_path = DLIB_MODEL_PATH + ".bz2"
    urllib.request.urlretrieve(DLIB_MODEL_URL, bz2_path)
    with bz2.BZ2File(bz2_path) as f, open(DLIB_MODEL_PATH, "wb") as out:
        out.write(f.read())
    os.remove(bz2_path)

face_detector = dlib.get_frontal_face_detector()
landmark_predictor = dlib.shape_predictor(DLIB_MODEL_PATH)

# =========================
# Helper functions
# =========================

def calculate_brightness(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def compute_average_color(pixels):
    if not pixels:
        return [128, 128, 128], "#808080"

    avg = np.mean(np.array(pixels), axis=0).astype(np.uint8)
    hex_color = "#{:02x}{:02x}{:02x}".format(*avg)
    return avg.tolist(), hex_color


# =========================
# Core analysis logic
# =========================

def analyze_face_image(rgb_image: np.ndarray):
    # 🔹 HARD GUARANTEE IMAGE FORMAT (fixes unsupported image error)
    if rgb_image is None:
        return None, "Invalid image data"

    if rgb_image.ndim != 3 or rgb_image.shape[2] != 3:
        return None, "Unsupported image type, must be RGB"

    rgb_image = rgb_image.astype(np.uint8)


    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY)
    faces = face_detector(gray)

    if len(faces) == 0:
        return None, "No face detected"

    landmarks = landmark_predictor(gray, faces[0])
    points = [(p.x, p.y) for p in landmarks.parts()]

    sample_points = []
    pairs = [(6, 9), (28, 15), (2, 30), (35, 13), (31, 4)]

    for s, e in pairs:
        x1, y1 = points[s]
        x2, y2 = points[e]
        for i in range(1, 6):
            r = i / 6
            sample_points.append((
                int(x1 + r * (x2 - x1)),
                int(y1 + r * (y2 - y1))
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
    if r > b:
        undertone = "Warm"
    elif b > r:
        undertone = "Cool"
    else:
        undertone = "Neutral"

    skin_subtype = f"{skin_tone.capitalize()} {undertone}"

    # 🔹 ALIGN WITH color_maps.py KEYS
    recommended_colors = recommended_color_map.get(undertone, [])
    avoid_colors = avoid_color_map.get(undertone, [])

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
        "recommended_colors": recommended_colors,
        "avoid_colors": avoid_colors,
    }, None


# =========================
# Routes
# =========================

@app.get("/")
def health():
    return {"message": "API running"}


@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()

        # 🔹 FORCE IMAGE CONVERSION USING PIL (critical fix)
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        rgb_image = np.array(pil_image)

        result, error = analyze_face_image(rgb_image)

        if error:
            return JSONResponse(status_code=400, content={"error": error})

        return result

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
