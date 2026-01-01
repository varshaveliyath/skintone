import numpy as np
from PIL import Image, ImageOps
import logging

# Import ONLY the core logic from app.py
from app import analyze_face_image

# -------------------------
# Logging setup
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    image_path = "D:/skintone/backend/image.jpg"

    try:
        logger.info("📸 Loading image from disk")

        # Load image exactly like API does
        pil_image = Image.open(image_path)
        pil_image = ImageOps.exif_transpose(pil_image)
        pil_image = pil_image.convert("RGB")

        rgb_image = np.array(pil_image, dtype=np.uint8)

        logger.info(f"🖼️ Image shape: {rgb_image.shape}, dtype: {rgb_image.dtype}")

        # Run analysis
        result, error = analyze_face_image(rgb_image)

        if error:
            logger.error(f"❌ Analysis failed: {error}")
            return

        logger.info("✅ Analysis successful\n")
        print("====== RESULT ======")
        for k, v in result.items():
            print(f"{k}: {v}")

    except Exception as e:
        logger.exception("💥 Test script crashed")


if __name__ == "__main__":
    main()
