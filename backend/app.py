from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import dlib
import numpy as np
import os
import base64
import urllib.request
import bz2

app = FastAPI()

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://skintone-lime.vercel.app/"],   # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- Download Dlib model if not present --------
MODEL_URL = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
MODEL_BZ2 = "shape_predictor_68_face_landmarks.dat.bz2"
MODEL_PATH = "shape_predictor_68_face_landmarks.dat"

def download_shape_predictor():
    print("Downloading dlib shape predictor model...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_BZ2)
    with bz2.BZ2File(MODEL_BZ2) as fr, open(MODEL_PATH, "wb") as fw:
        fw.write(fr.read())
    os.remove(MODEL_BZ2)
    print("Download complete.")

if not os.path.exists(MODEL_PATH):
    download_shape_predictor()

# Load dlib models
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(MODEL_PATH)

# -------- Utility Functions --------
def get_rgb_brightness(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b

def average_color(swatches):
    if not swatches:
        return None, None
    avg = np.mean(np.array(swatches), axis=0).astype(int)
    hex_val = '#{:02x}{:02x}{:02x}'.format(*avg)
    return avg.tolist(), hex_val

def process_image(image_np):
    original_image = image_np.copy()
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    if len(faces) == 0:
        return None, "No face detected"

    shape = predictor(gray, faces[0])
    landmarks = [(pt.x, pt.y) for pt in shape.parts()]
    custom_points = []

    # Custom sampling points
    connection_pairs = [
        (6, 9), (28, 15), (2, 30), (35, 13), (31, 4),
        (4, 61), (5, 60), (6, 59), (7, 58), (8, 57),
        (9, 56), (10, 55), (11, 54), (12, 53),
        (1, 28), (2, 30), (27, 35), (27, 31), (29, 15), (30, 14)
    ]
    for start_idx, end_idx in connection_pairs:
        x1, y1 = landmarks[start_idx]
        x2, y2 = landmarks[end_idx]
        for i in range(1, 6):
            alpha = i / 6
            xi = int(x1 + alpha * (x2 - x1))
            yi = int(y1 + alpha * (y2 - y1))
            custom_points.append((xi, yi))

    # Extra brow & forehead points
    brow_indices = [20, 21, 22, 23]
    for idx in brow_indices:
        x, y = landmarks[idx]
        custom_points.append((x, y - 20))

    forehead_offsets = [(0, -10), (-10, 0), (0, -10), (-10, 0),
                        (0, -10), (10, 0), (0, -10), (10, 0)]
    for i, (dx, dy) in enumerate(forehead_offsets):
        base_x, base_y = custom_points[-4 + i // 2]
        custom_points.append((base_x + dx, base_y + dy))

    # Collect swatches
    light_swatches, dark_swatches = [], []
    for (x, y) in custom_points:
        if 0 <= x < original_image.shape[1] and 0 <= y < original_image.shape[0]:
            b, g, r = original_image[y, x]
            brightness = get_rgb_brightness(r, g, b)
            if brightness > 130:
                light_swatches.append((r, g, b))
            else:
                dark_swatches.append((r, g, b))

    avg_light, hex_light = average_color(light_swatches)
    avg_dark, hex_dark = average_color(dark_swatches)
    avg_total, hex_total = average_color(light_swatches + dark_swatches)

    # Determine main skin tone
    light_count = len(light_swatches)
    dark_count = len(dark_swatches)
    total = light_count + dark_count
    diff_ratio = abs(light_count - dark_count) / total if total else 0

    if diff_ratio < 0.5:
        skin_tone = "dusky"
    elif light_count > dark_count:
        skin_tone = "light"
    else:
        skin_tone = "dark"

    # --- Determine undertone ---
    r, g, b = avg_total if avg_total else (128, 128, 128)
    if r > b and r > g:
        undertone = "warm"
    elif b > r and b > g:
        undertone = "cool"
    else:
        undertone = "neutral"

    # Skin subtype
    skin_subtype = f"{skin_tone.capitalize()} {undertone.capitalize()}"

    # Recommended and avoid colors with reasons
    recommendations = {
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

    avoid_colors_map = {
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

    recommended_colors = recommendations.get(skin_subtype, [{"name":"Default White","hex":"#FFFFFF","reason":"Default"}])
    avoid_colors = avoid_colors_map.get(skin_subtype, [{"name":"Default Black","hex":"#000000","reason":"Default"}])

    _, buffer = cv2.imencode('.jpg', image_np)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return {
        "annotated_image": encoded_image,
        "skin_tone": skin_tone,
        "skin_subtype": skin_subtype,
        "undertone": undertone,
        "recommended_colors": recommended_colors,
        "avoid_colors": avoid_colors,
        "avg_light_rgb": avg_light,
        "avg_light_hex": hex_light,
        "avg_dark_rgb": avg_dark,
        "avg_dark_hex": hex_dark,
        "avg_total_rgb": avg_total,
        "avg_total_hex": hex_total,
    }, None

# -------- API Routes --------
@app.get("/")
def health():
    return {"message": "API running"}

@app.post("/api/analyze")
async def analyze(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        npimg = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        result, error = process_image(img)
        if error:
            return JSONResponse(status_code=400, content={"error": error})
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
