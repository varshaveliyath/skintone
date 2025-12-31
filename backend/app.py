from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import cv2
import dlib
import numpy as np
import os
import io
import urllib.request
import bz2

from PIL import Image, ImageOps

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
    if len(pixels) == 0:
        return [128, 128, 128], "#808080"

    avg = np.mean(np.array(pixels), axis=0).astype(np.uint8)
    hex_color = "#{:02x}{:02x}{:02x}".format(*avg)
    return avg.tolist(), hex_color

# =========================
# Core analysis logic
# =========================

def analyze_face_image(rgb_image: np.ndarray):
    # Ensure correct format
    if rgb_image.dtype != np.uint8 or rgb_image.ndim != 3 or rgb_image.shape[2] != 3:
        return None, "Unsupported image format"

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

    skin_tone = "light" if len(light) > len(dark) else "dark"
    if abs(len(light) - len(dark)) / max(len(light) + len(dark), 1) < 0.5:
        skin_tone = "dusky"

    r, g, b = avg_total_rgb
    undertone = "warm" if r > b else "cool" if b > r else "neutral"

    skin_subtype = f"{skin_tone.capitalize()} {undertone.capitalize()}"


    # -------------------------
    # Color recommendation maps
    # -------------------------

    recommended_color_map = {
        "Light Warm": [
            {"name": "Peach", "hex": "#FFDAB9", "reason": "Enhances warm glow"},
            {"name": "Coral", "hex": "#FF7F50", "reason": "Adds vibrance"},
            {"name": "Yellow", "hex": "#FFD700", "reason": "Matches undertone"},
            {"name": "Beige", "hex": "#F5F5DC", "reason": "Soft neutral"},
            {"name": "Light Brown", "hex": "#C4A484", "reason": "Balances warmth"},
            {"name": "Soft Pink", "hex": "#FFB6C1", "reason": "Adds freshness"},
            {"name": "Olive", "hex": "#808000", "reason": "Earthy balance"},
            {"name": "Amber", "hex": "#FFBF00", "reason": "Boosts warm undertone"},
            {"name": "Ivory", "hex": "#FFFFF0", "reason": "Brightens skin"},
            {"name": "Salmon", "hex": "#FA8072", "reason": "Complements tone"}
        ],
        "Light Cool": [
            {"name": "Sky Blue", "hex": "#87CEEB", "reason": "Brightens undertone"},
            {"name": "Lavender", "hex": "#E6E6FA", "reason": "Softens look"},
            {"name": "Mint", "hex": "#98FF98", "reason": "Fresh contrast"},
            {"name": "Silver", "hex": "#C0C0C0", "reason": "Cool metallic"},
            {"name": "Lilac", "hex": "#D8BFD8", "reason": "Gentle contrast"},
            {"name": "Turquoise", "hex": "#40E0D0", "reason": "Fresh vibrance"},
            {"name": "Ice Blue", "hex": "#AFEEEE", "reason": "Enhances radiance"},
            {"name": "Soft Gray", "hex": "#D3D3D3", "reason": "Neutral base"},
            {"name": "Rose Pink", "hex": "#FFC0CB", "reason": "Adds softness"},
            {"name": "Aqua", "hex": "#00FFFF", "reason": "Bright pop"}
        ],
        "Light Neutral": [
            {"name": "Beige", "hex": "#F5F5DC", "reason": "Neutral match"},
            {"name": "Cream", "hex": "#FFFDD0", "reason": "Soft brightness"},
            {"name": "White", "hex": "#FFFFFF", "reason": "Classic neutral"},
            {"name": "Sand", "hex": "#C2B280", "reason": "Natural earthy tone"},
            {"name": "Soft Pink", "hex": "#FFD1DC", "reason": "Gentle contrast"},
            {"name": "Gray", "hex": "#D3D3D3", "reason": "Balances tone"},
            {"name": "Champagne", "hex": "#F7E7CE", "reason": "Elegant glow"},
            {"name": "Taupe", "hex": "#B38B6D", "reason": "Neutral earthy shade"},
            {"name": "Pale Peach", "hex": "#FFE5B4", "reason": "Adds warmth"},
            {"name": "Ivory", "hex": "#FFFFF0", "reason": "Clean, soft look"}
        ],
        "Dusky Warm": [
            {"name": "Orange", "hex": "#FFA500", "reason": "Highlights warmth"},
            {"name": "Mustard", "hex": "#FFDB58", "reason": "Bold and vibrant"},
            {"name": "Olive Green", "hex": "#808000", "reason": "Earthy complement"},
            {"name": "Coral", "hex": "#FF7F50", "reason": "Adds freshness"},
            {"name": "Brown", "hex": "#8B4513", "reason": "Balances undertone"},
            {"name": "Golden Yellow", "hex": "#FFD700", "reason": "Accentuates warmth"},
            {"name": "Rust", "hex": "#B7410E", "reason": "Earthy richness"},
            {"name": "Peach", "hex": "#FFDAB9", "reason": "Softens tone"},
            {"name": "Camel", "hex": "#C19A6B", "reason": "Neutral earthy look"},
            {"name": "Warm Beige", "hex": "#F5F5DC", "reason": "Complements tone"}
        ],
        "Dusky Cool": [
            {"name": "Navy Blue", "hex": "#000080", "reason": "Strong contrast"},
            {"name": "Burgundy", "hex": "#800020", "reason": "Adds richness"},
            {"name": "Emerald Green", "hex": "#50C878", "reason": "Bright balance"},
            {"name": "Purple", "hex": "#800080", "reason": "Enhances undertone"},
            {"name": "Teal", "hex": "#008080", "reason": "Balances coolness"},
            {"name": "Gray", "hex": "#808080", "reason": "Neutral grounding"},
            {"name": "Magenta", "hex": "#FF00FF", "reason": "Adds pop"},
            {"name": "Blue", "hex": "#0000FF", "reason": "Sharp, clean contrast"},
            {"name": "Lavender", "hex": "#E6E6FA", "reason": "Soft balance"},
            {"name": "Rose", "hex": "#FF007F", "reason": "Brightens complexion"}
        ],
        "Dusky Neutral": [
            {"name": "Teal", "hex": "#008080", "reason": "Balances undertone"},
            {"name": "Olive", "hex": "#808000", "reason": "Earthy complement"},
            {"name": "Coral", "hex": "#FF7F50", "reason": "Adds vibrance"},
            {"name": "Navy", "hex": "#000080", "reason": "Strong contrast"},
            {"name": "Beige", "hex": "#F5F5DC", "reason": "Neutral grounding"},
            {"name": "Rose Pink", "hex": "#FFC0CB", "reason": "Soft pop"},
            {"name": "Gray", "hex": "#D3D3D3", "reason": "Balances tone"},
            {"name": "Brown", "hex": "#8B4513", "reason": "Adds richness"},
            {"name": "Soft Blue", "hex": "#87CEEB", "reason": "Light, fresh"},
            {"name": "Camel", "hex": "#C19A6B", "reason": "Earthy balance"}
        ],
        "Dark Warm": [
            {"name": "Gold", "hex": "#FFD700", "reason": "Enhances richness"},
            {"name": "Orange", "hex": "#FFA500", "reason": "Bright, bold contrast"},
            {"name": "Yellow", "hex": "#FFFF00", "reason": "Accentuates warmth"},
            {"name": "Olive Green", "hex": "#808000", "reason": "Earthy balance"},
            {"name": "Copper", "hex": "#B87333", "reason": "Adds richness"},
            {"name": "Maroon", "hex": "#800000", "reason": "Deep, bold look"},
            {"name": "Rust", "hex": "#B7410E", "reason": "Earthy warmth"},
            {"name": "Camel", "hex": "#C19A6B", "reason": "Soft contrast"},
            {"name": "Coral", "hex": "#FF7F50", "reason": "Bright freshness"},
            {"name": "Amber", "hex": "#FFBF00", "reason": "Glowing richness"}
        ],
        "Dark Cool": [
            {"name": "Emerald", "hex": "#50C878", "reason": "Vivid balance"},
            {"name": "Navy", "hex": "#000080", "reason": "Strong contrast"},
            {"name": "Burgundy", "hex": "#800020", "reason": "Adds richness"},
            {"name": "Plum", "hex": "#8E4585", "reason": "Enhances coolness"},
            {"name": "Teal", "hex": "#008080", "reason": "Cool grounding"},
            {"name": "Blue", "hex": "#0000FF", "reason": "Bright pop"},
            {"name": "Lavender", "hex": "#E6E6FA", "reason": "Soft contrast"},
            {"name": "Rose", "hex": "#FF007F", "reason": "Adds brightness"},
            {"name": "Silver", "hex": "#C0C0C0", "reason": "Neutral highlight"},
            {"name": "Gray", "hex": "#808080", "reason": "Balances skin"}
        ],
        "Dark Neutral": [
            {"name": "Brown", "hex": "#8B4513", "reason": "Rich neutral match"},
            {"name": "Olive", "hex": "#808000", "reason": "Earthy balance"},
            {"name": "Beige", "hex": "#F5F5DC", "reason": "Neutral grounding"},
            {"name": "Camel", "hex": "#C19A6B", "reason": "Soft, earthy"},
            {"name": "Burgundy", "hex": "#800020", "reason": "Adds richness"},
            {"name": "Teal", "hex": "#008080", "reason": "Balances undertone"},
            {"name": "Navy", "hex": "#000080", "reason": "Bold contrast"},
            {"name": "Coral", "hex": "#FF7F50", "reason": "Adds pop"},
            {"name": "Gold", "hex": "#FFD700", "reason": "Enhances glow"},
            {"name": "Gray", "hex": "#A9A9A9", "reason": "Neutral highlight"}
        ]
    }

    avoid_color_map = {
            "Light Warm": [
        {"name": "Neon Green", "hex": "#39FF14", "reason": "Too harsh"},
        {"name": "Black", "hex": "#000000", "reason": "Overpowers skin"},
        {"name": "Bright White", "hex": "#FFFFFF", "reason": "Too stark"},
        {"name": "Cool Gray", "hex": "#A9A9A9", "reason": "Washes out skin"},
        {"name": "Purple", "hex": "#800080", "reason": "Clashes with warmth"}
    ],
    "Light Cool": [
        {"name": "Orange", "hex": "#FFA500", "reason": "Too warm"},
        {"name": "Mustard", "hex": "#FFDB58", "reason": "Overpowers cool skin"},
        {"name": "Golden Yellow", "hex": "#FFD700", "reason": "Too warm"},
        {"name": "Coral", "hex": "#FF7F50", "reason": "Too bright"},
        {"name": "Beige", "hex": "#F5F5DC", "reason": "Looks dull"}
    ],
    "Light Neutral": [
        {"name": "Neon Pink", "hex": "#FF6EC7", "reason": "Too bold"},
        {"name": "Lime Green", "hex": "#32CD32", "reason": "Overwhelms skin"},
        {"name": "Bright Red", "hex": "#FF0000", "reason": "Too harsh"},
        {"name": "Black", "hex": "#000000", "reason": "Strong contrast"},
        {"name": "Violet", "hex": "#8F00FF", "reason": "Too bold"}
    ],
    "Dusky Warm": [
        {"name": "Neon Yellow", "hex": "#FFFF33", "reason": "Overly bright"},
        {"name": "Pink", "hex": "#FF69B4", "reason": "Too soft"},
        {"name": "Cool Blue", "hex": "#1E90FF", "reason": "Too sharp"},
        {"name": "Purple", "hex": "#800080", "reason": "Clashes with warmth"},
        {"name": "Silver", "hex": "#C0C0C0", "reason": "Too cold"}
    ],
    "Dusky Cool": [
        {"name": "Orange", "hex": "#FFA500", "reason": "Too warm"},
        {"name": "Yellow", "hex": "#FFFF00", "reason": "Overpowers coolness"},
        {"name": "Beige", "hex": "#F5F5DC", "reason": "Looks flat"},
        {"name": "Brown", "hex": "#8B4513", "reason": "Too heavy"},
        {"name": "Gold", "hex": "#FFD700", "reason": "Too warm"}
    ],
    "Dusky Neutral": [
        {"name": "Neon Pink", "hex": "#FF69B4", "reason": "Too loud"},
        {"name": "Lime Green", "hex": "#32CD32", "reason": "Too sharp"},
        {"name": "Neon Yellow", "hex": "#FFFF33", "reason": "Overpowers balance"},
        {"name": "Bright Orange", "hex": "#FF4500", "reason": "Too strong"},
        {"name": "Silver Gray", "hex": "#C0C0C0", "reason": "Flattens tone"}
    ],
    "Dark Warm": [
        {"name": "Neon Blue", "hex": "#1F51FF", "reason": "Too artificial"},
        {"name": "Cool Pink", "hex": "#FFB6C1", "reason": "Clashes with warmth"},
        {"name": "Silver", "hex": "#C0C0C0", "reason": "Looks dull"},
        {"name": "Lavender", "hex": "#E6E6FA", "reason": "Too cool"},
        {"name": "Gray", "hex": "#808080", "reason": "Flattens complexion"}
    ],
    "Dark Cool": [
        {"name": "Mustard", "hex": "#FFDB58", "reason": "Too warm"},
        {"name": "Orange", "hex": "#FFA500", "reason": "Clashes with undertone"},
        {"name": "Beige", "hex": "#F5F5DC", "reason": "Washes out richness"},
        {"name": "Khaki", "hex": "#C3B091", "reason": "Looks flat"},
        {"name": "Peach", "hex": "#FFE5B4", "reason": "Too light"}
    ],
    "Dark Neutral": [
        {"name": "Neon Green", "hex": "#39FF14", "reason": "Too harsh"},
        {"name": "Neon Orange", "hex": "#FF5F1F", "reason": "Overpowers depth"},
        {"name": "Hot Pink", "hex": "#FF69B4", "reason": "Too flashy"},
        {"name": "Bright Yellow", "hex": "#FFFF00", "reason": "Too strong"},
        {"name": "Pastel Blue", "hex": "#AEC6CF", "reason": "Too weak for depth"}
    ]

    }
    recommended_colors = recommended_color_map.get(skin_subtype, [])
    avoid_colors = avoid_color_map.get(skin_subtype, [])

    return {
        "skin_tone": skin_tone,
        "skin_subtype": skin_subtype,
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

        # Decode image using OpenCV (MOST IMPORTANT FIX)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        bgr_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if bgr_image is None:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid or unsupported image file"}
            )

        # Convert BGR → RGB
        rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)

        result, error = analyze_face_image(rgb_image)

        if error:
            return JSONResponse(status_code=400, content={"error": error})

        return result

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
