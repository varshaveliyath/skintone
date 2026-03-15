from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import io
import logging

import numpy as np
from mediapipe import solutions as mp_solutions


from PIL import Image, ImageOps
from color_maps import seasonal_recommended_colors, seasonal_avoid_colors
import joblib

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
        "https://moodwear.vercel.app",
        "https://skintone.onrender.com",
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
# ML MODEL SETUP
# =========================
try:
    feature_model = joblib.load("feature_model.pkl")
    feature_encoder = joblib.load("feature_encoder.pkl")
    logger.info("New Feature-based ML model loaded")
except Exception as e:
    logger.error(f"Failed to load new ML model: {e}")
    feature_model = None
    feature_encoder = None

try:
    color_model = joblib.load("color_model.pkl")
    logger.info("Color Compatibility model loaded")
except Exception as e:
    logger.error(f"Failed to load Color Compatibility model: {e}")
    color_model = None

try:
    outfit_knn_model = joblib.load("outfit_knn_model.pkl")
    outfit_knn_labels = joblib.load("outfit_knn_labels.pkl")
    color_placement_tree = joblib.load("color_placement_tree.pkl")
    logger.info("Outfit Gen ML models loaded")
except Exception as e:
    logger.error(f"Failed to load Outfit Gen ML models: {e}")
    outfit_knn_model = None
    outfit_knn_labels = None
    color_placement_tree = None

logger.info("Models loaded attempt complete.")

# =========================
# HELPERS
# =========================
def calculate_brightness(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return [int(hex_str[i:i+2], 16) for i in (0, 2, 4)]


def compute_average_color(pixels):
    if not pixels:
        return [128, 128, 128], "#808080"

    avg = np.mean(np.array(pixels), axis=0).astype(np.uint8)
    return avg.tolist(), "#{:02x}{:02x}{:02x}".format(*avg)

# =========================
# CORE LOGIC
# =========================
def analyze_face_image(rgb_image: np.ndarray):
    logger.info("Starting accurate model-based face analysis")

    h, w, _ = rgb_image.shape

    results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        return None, "No face detected"

    landmarks = results.multi_face_landmarks[0].landmark

    # Convert normalized → pixel coordinates
    def lm(idx):
        return int(landmarks[idx].x * w), int(landmarks[idx].y * h)

    try:
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
    except Exception as e:
        logger.error(f"Landmark extraction failed: {e}")
        return None, "Complex face detection error"

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

    # 0-10 Scale Logic (Features for the model)
    total_pixels = len(light) + len(dark)
    dark_score = (len(dark) / total_pixels) * 10 if total_pixels > 0 else 0
    r_avg, g_avg, b_avg = avg_total_rgb
    brightness = calculate_brightness(r_avg, g_avg, b_avg)

    # NEW: ML Prediction using extracted features
    skin_tone = "light"
    undertone = "Neutral"
    skin_subtype = "Light Neutral"
    
    try:
        if feature_model and feature_encoder:
            features = np.array([[r_avg, g_avg, b_avg, brightness, dark_score]])
            prediction = feature_model.predict(features)
            skin_subtype_raw = feature_encoder.inverse_transform(prediction)[0]
            
            # Securely deconstruct subtype (e.g., "Light Warm")
            parts = skin_subtype_raw.split()
            skin_tone = parts[0].lower() if len(parts) > 0 else "light"
            undertone = parts[1] if len(parts) > 1 else "Neutral"
            skin_subtype = f"{skin_tone.capitalize()} {undertone}"
        else:
            raise ValueError("Model not loaded")
    except Exception as e:
        logger.warning(f"ML Strategy failed ({e}), using fallback rules")
        # Fallback to manual if model load/prediction fails
        if dark_score < 4:
            skin_tone = "light"
        elif dark_score < 8.5:
            skin_tone = "dusky"
        else:
            skin_tone = "dark"
            
        margin = 5
        if abs(r_avg - b_avg) <= margin:
            undertone = "Neutral"
        elif r_avg > b_avg:
            undertone = "Warm"
        else:
            undertone = "Cool"
        skin_subtype = f"{skin_tone.capitalize()} {undertone}"
    
    logger.info(f"Model Prediction: {skin_subtype} (Score: {dark_score:.1f})")

    recommended = seasonal_recommended_colors.get(skin_subtype, [])
    avoid = seasonal_avoid_colors.get(skin_subtype, [])

    if color_model:
        # Score the 30 curated recommended colors specifically for this user
        scored_recommended = []
        for c in recommended:
            try:
                c_copy = c.copy()
                cr, cg, cb = hex_to_rgb(c["hex"])
                c_features = np.array([[r_avg, g_avg, b_avg, brightness, dark_score, cr, cg, cb]])
                pred_score = float(color_model.predict(c_features)[0])
                c_copy["match_score"] = min(100.0, max(0.0, round(pred_score * 100, 1)))
                scored_recommended.append(c_copy)
            except Exception as e:
                logger.error(f"Scoring failed for color {c.get('name')}: {e}")
                c_copy = c.copy()
                c_copy["match_score"] = 50.0 # Safe default
                scored_recommended.append(c_copy)
            
        # Sort by ML score (highest to lowest)
        scored_recommended.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        
        # Return the full scored pool sorted by score instead of truncating to 8, 
        # so the frontend has options to randomly shuffle through on 'Refresh'.
        # We will still ensure the top 8 (which the frontend initially shows) are diverse
        final_recommended = []
        seen_rec_families = set()
        
        # Pass 1: Get the top 8 diverse
        for c in scored_recommended:
            family = c.get("family", "Unknown")
            if family not in seen_rec_families:
                final_recommended.append(c)
                seen_rec_families.add(family)
            if len(final_recommended) == 8:
                break
                
        # Pass 2: Add all remaining colors from the pool to the end of the array
        for c in scored_recommended:
            if c not in final_recommended:
                final_recommended.append(c)
                
        recommended = final_recommended
        
        # Score the avoid colors similarly
        scored_avoid = []
        for c in avoid:
            c_copy = c.copy()
            cr, cg, cb = hex_to_rgb(c["hex"])
            c_features = np.array([[r_avg, g_avg, b_avg, brightness, dark_score, cr, cg, cb]])
            pred_score = float(color_model.predict(c_features)[0])
            c_copy["match_score"] = min(100.0, max(0.0, round(pred_score * 100, 1)))
            scored_avoid.append(c_copy)
            
        # Lowest scores are the worst colors
        scored_avoid.sort(key=lambda x: x.get("match_score", 0)) 
        
        final_avoid = []
        seen_avoid_families = set()
        for c in scored_avoid:
            family = c.get("family", "Unknown")
            if family not in seen_avoid_families and c not in recommended:
                final_avoid.append(c)
                seen_avoid_families.add(family)
            if len(final_avoid) == 4:
                break
                
        if len(final_avoid) < 4:
            for c in scored_avoid:
                if c not in recommended and c not in final_avoid:
                    final_avoid.append(c)
                if len(final_avoid) == 4:
                    break
                    
        avoid = final_avoid

    return {
        "skin_tone": skin_tone,
        "skin_subtype": skin_subtype,
        "undertone": undertone,
        "dark_score": round(dark_score, 2),
        "avg_light_rgb": avg_light_rgb,
        "avg_light_hex": avg_light_hex,
        "avg_dark_rgb": avg_dark_rgb,
        "avg_dark_hex": avg_dark_hex,
        "avg_total_rgb": avg_total_rgb,
        "avg_total_hex": avg_total_hex,
        "recommended_colors": recommended,
        "avoid_colors": avoid,
        "is_ml_based": True,
        "has_color_model": color_model is not None
    }, None

# =========================
# ROUTES
# =========================
@app.get("/")
def health():
    return {"message": "API running"}

from outfit_router import OutfitRequest, generate_ml_outfits

@app.post("/api/outfits")
async def get_outfits(req: OutfitRequest):
    try:
        if outfit_knn_model is None or color_placement_tree is None:
            # Fallback will be handled inside generate_ml_outfits
            pass
            
        outfits = generate_ml_outfits(req, outfit_knn_model, outfit_knn_labels, color_placement_tree)
        return {"outfits": outfits}
    except Exception as e:
        logger.exception("SERVER CRASH in /api/outfits")
        return JSONResponse(status_code=500, content={"error": str(e)})

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
