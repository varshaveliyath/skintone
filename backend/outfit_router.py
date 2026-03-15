from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import logging

logger = logging.getLogger(__name__)

class ColorItem(BaseModel):
    name: str
    hex: str
    family: str
    match_score: Optional[float] = None

class OutfitRequest(BaseModel):
    dark_score: float
    undertone: str
    preferred_color: str = ""
    event: str = ""
    season: str = ""
    recommended_colors: List[ColorItem]

STYLISH_FITS = [
    { "id": 0, "name": "Modern Minimalist", "top": "Oversized Shirt", "bottom": "Loose Fitted Jeans", "footwear": "Chunky Sneakers", "layer": "None" },
    { "id": 1, "name": "Tailored Chic", "top": "Long Tailored Shirt", "bottom": "Straight Leg Trousers", "footwear": "Loafers", "layer": "Blazer" },
    { "id": 2, "name": "Relaxed Luxe", "top": "Cropped Knit Top", "bottom": "Loose Pants", "footwear": "Mules", "layer": "Trench Coat" },
    { "id": 3, "name": "Urban Edge", "top": "Fitted Bodysuit", "bottom": "Mini Skirt", "footwear": "Knee-high Boots", "layer": "Leather Jacket" },
    { "id": 4, "name": "Preppy Revived", "top": "Polo Shirt", "bottom": "Tennis Skirt", "footwear": "Sneakers", "layer": "Cardigan" },
    { "id": 5, "name": "Street Style", "top": "Graphic Tee", "bottom": "Cargo Pants", "footwear": "Canvas High-tops", "layer": "Denim Jacket" },
    { "id": 6, "name": "Night Out", "top": "Corset Top", "bottom": "Denim Maxi Skirt", "footwear": "Strappy Heels", "layer": "Structured Blazer" },
    { "id": 7, "name": "Quiet Luxury", "top": "Silk Wrap Blouse", "bottom": "Wide-leg Linen Pants", "footwear": "Strappy Sandals", "layer": "None" },
    { "id": 8, "name": "Y2K Aesthetic", "top": "Baby Tee", "bottom": "Parachute Pants", "footwear": "Platform Slides", "layer": "Zip-up Hoodie" },
    { "id": 9, "name": "Downtown Cool", "top": "Tank Top", "bottom": "Leather Pants", "footwear": "Ankle Boots", "layer": "Overcoat" },
    { "id": 10, "name": "Summer Soiree", "top": "Halter Top", "bottom": "Pleated Midi Skirt", "footwear": "Slide Sandals", "layer": "Soft Shrug" },
    { "id": 11, "name": "Athleisure Premium", "top": "Scoop Neck Bra Top", "bottom": "Flared Leggings", "footwear": "Fitness Trainers", "layer": "Puffer Vest" },
    { "id": 12, "name": "Nordic Style", "top": "Turtle Neck", "bottom": "Wool Trousers", "footwear": "Chelsea Boots", "layer": "Longline Coat" },
    { "id": 13, "name": "Vibrant Casual", "top": "Button-down Shirt", "bottom": "Wide Leg Jeans", "footwear": "Clogs", "layer": "Knitted Vest" },
    { "id": 14, "name": "Sophisticated Short", "top": "High-neck Tank", "bottom": "Tailored Shorts", "footwear": "Ballet Flats", "layer": "Linen Blazer" },
    { "id": 15, "name": "Grunge Light", "top": "Distressed Tee", "bottom": "Biker Shorts", "footwear": "Combat Boots", "layer": "Flannel Shirt" },
    { "id": 16, "name": "Classic Feminine", "top": "Sweetheart Top", "bottom": "Skort", "footwear": "Pointed Flats", "layer": "Cropped Cardigan" },
    { "id": 17, "name": "Boho Modern", "top": "Peasant Blouse", "bottom": "Bell Bottom Jeans", "footwear": "Suede Boots", "layer": "Fringed Kimono" },
    { "id": 18, "name": "Office Avant", "top": "Asymmetric Top", "bottom": "Cigarette Trousers", "footwear": "Pointed Toe Heels", "layer": "Cape Blazer" },
    { "id": 19, "name": "Weekend Cozy", "top": "Oversized Hoodie", "bottom": "Ribbed Leggings", "footwear": "Slides", "layer": "Denim Jacket" },
    { "id": 20, "name": "Effortless Gala", "top": "Slip Dress", "bottom": "None", "footwear": "Strappy Heels", "layer": "Silk Scarf" },
    { "id": 21, "name": "Summer Brunch", "top": "Wrap Dress", "bottom": "None", "footwear": "Espadrilles", "layer": "Straw Hat" },
    { "id": 22, "name": "Cohesive Power", "top": "Jumpsuit", "bottom": "None", "footwear": "Pointed Heels", "layer": "Structured Blazer" },
    { "id": 23, "name": "Minimalist Chic", "top": "Column Dress", "bottom": "None", "footwear": "Nude Slides", "layer": "Light Cardigan" },
    { "id": 24, "name": "Boho Breeze", "top": "Maxi Dress", "bottom": "None", "footwear": "Leather Sandals", "layer": "Denim Vest" },
    { "id": 25, "name": "Preppy Polish", "top": "Shift Dress", "bottom": "None", "footwear": "Mary Janes", "layer": "Headband" },
    { "id": 26, "name": "Art Gallery", "top": "Tiered Midi Dress", "bottom": "None", "footwear": "Ankle Boots", "layer": "Statement Necklace" },
    { "id": 27, "name": "Lounge Luxe", "top": "Knit Set", "bottom": "Matching Trousers", "footwear": "Shearling Slides", "layer": "None" },
    { "id": 28, "name": "Sporty Spice", "top": "Unitard", "bottom": "None", "footwear": "Technical Trainers", "layer": "Nylon Windbreaker" },
    { "id": 29, "name": "Classic Duo", "top": "Basic T-Shirt", "bottom": "Straight Jeans", "footwear": "Canvas Shoes", "layer": "None" },
    { "id": 30, "name": "Summer Basic", "top": "Ribbed Tank Top", "bottom": "Tailored Shorts", "footwear": "Flip Flops", "layer": "None" }
]

NEUTRAL_MAP = {
    "White": "#FFFFFF",
    "Black": "#0A0A0A",
    "Beige": "#F5F5DC",
    "Tan": "#D2B48C",
    "Charcoal": "#36454F",
    "Navy": "#2C3E50"
}

def generate_ml_outfits(req: OutfitRequest, outfit_knn_model, outfit_knn_labels, color_placement_tree):
    # 1. Prepare ML Inputs
    event = req.event.lower()
    
    event_encoded = 0 # Default Casual
    if "work" in event or "office" in event or "formal" in event:
        event_encoded = 1
    elif "night" in event or "party" in event or "club" in event:
        event_encoded = 2
    elif "wedding" in event or "gala" in event or "elegant" in event:
        event_encoded = 3
    elif "street" in event or "active" in event or "gym" in event:
        event_encoded = 4
        
    formality_score = 0.5
    if event_encoded in [1, 3]: formality_score = 0.8
    if event_encoded in [0, 4]: formality_score = 0.2
    
    # 1b. Seasonal Weather Scoring
    weather_score = 0.5 
    season = req.season.lower()
    if "summer" in season:
        weather_score = 0.1 # Hot
    elif "winter" in season:
        weather_score = 0.9 # Cold
    elif "spring" in season or "monsoon" in season:
        weather_score = 0.4 # Mild/Wet
    
    # 2. Get KNN Neighbors with Random Jitter for Refresh Variety
    f_score = np.clip(formality_score + np.random.normal(0, 0.15), 0, 1.0)
    w_score = np.clip(weather_score + np.random.normal(0, 0.2), 0, 1.0) # Reduced jitter for seasonal consistency
    input_features = np.array([[event_encoded, f_score, w_score]])
    
    # Check if models are loaded
    if outfit_knn_model is None or color_placement_tree is None:
        logger.warning("ML Models missing. Falling back to simple selection.")
        archetype_ids = [0, 1, 2] # Fallback
    else:
        # Pull top 15 closest matching outfits from the ML model, then randomly pick 3
        distances, indices = outfit_knn_model.kneighbors(input_features, n_neighbors=15)
        
        possible_archetypes = []
        for idx in indices[0]:
            arch_id = int(outfit_knn_labels[idx])
            if arch_id not in possible_archetypes:
                possible_archetypes.append(arch_id)
                
        np.random.shuffle(possible_archetypes)
        archetype_ids = possible_archetypes[:3]
        
        while len(archetype_ids) < 3:
            archetype_ids.append(np.random.randint(0, 20))
            
    # 3. Decision Tree Color Placement Rule
    is_warm = 1 if "warm" in req.undertone.lower() else 0
    # Approximate contrast based on dark_score
    skin_contrast = 0.8 if req.dark_score > 6.0 else 0.4
    
    if color_placement_tree is not None:
        predicted_rule = int(color_placement_tree.predict([[skin_contrast, req.dark_score, is_warm]])[0])
    else:
        predicted_rule = 0
        
    # rule 0: HERO_TOP_NEUTRAL_BOTTOM
    # rule 1: NEUTRAL_BASE_HERO_LAYER
    # rule 2: BASIC_TOP_HERO_BOTTOM
    # rule 3: HERO_BOTTOM_NEUTRAL_TOP
    
    # To prevent all outfits from having the exact same color blocking (e.g., all monochromatic bases), 
    # we use the ML's #1 predicted rule for the first outfit, and unique alternative rules for the rest.
    rules_to_apply = [predicted_rule]
    alt_rules = [r for r in [0, 1, 2, 3] if r != predicted_rule]
    np.random.shuffle(alt_rules)
    rules_to_apply.extend(alt_rules[:len(archetype_ids) - 1])
    
    outfits = []
    
    # 0. Safety Check for Empty Recommended Colors
    if not req.recommended_colors:
        logger.warning("No recommended colors provided to outfit generator.")
        # Return basic neutral placeholders instead of crashing
        return [{
            "outfitName": "Basic Essentials",
            "top": "Neutral Top",
            "bottom": "Neutral Bottom",
            "footwear": "Classic Shoes",
            "layer": "None",
            "jewelry": "Minimal accents",
            "colors": [{"name": "Black", "hex": "#000000", "family": "Neutral"}]
        }]

    neutrals_keys = list(NEUTRAL_MAP.keys())
    pure_basics = ["White", "Black", "Beige"]
    
    for i, arch_id in enumerate(archetype_ids):
        try:
            placement_rule = rules_to_apply[i]
            base_fit = next((f for f in STYLISH_FITS if f["id"] == arch_id), STYLISH_FITS[0])
            
            # Pick colors
            np.random.seed() # reset seed
            
            # Hero color
            hero_color = None
            if req.preferred_color:
                matches = [c for c in req.recommended_colors if req.preferred_color.lower() in c.name.lower() or req.preferred_color.lower() in c.family.lower()]
                if matches:
                    hero_color = np.random.choice(matches)
            
            if not hero_color:
                hero_color = np.random.choice(req.recommended_colors)
                
            n1 = np.random.choice(pure_basics) # Guarantee a pure basic staple
            n2 = np.random.choice([n for n in neutrals_keys if n != n1])
            
            top_c, bot_c, lay_c = "", "", ""
            
            if placement_rule == 0:
                top_c = hero_color.name if hero_color else ""
                bot_c = n1 # Essential basic pants
                lay_c = n2
            elif placement_rule == 1:
                top_c = n1
                bot_c = n1 # Monochromatic staple base (All black, all white)
                lay_c = hero_color.name if hero_color else "" # Pop of color layer
            elif placement_rule == 2:
                top_c = n1 # Staple basic top (White tee, black top)
                bot_c = hero_color.name if hero_color else "" # Pop of color pants
                lay_c = n2
            elif placement_rule == 3:
                top_c = n2
                bot_c = n1 # Staple basic pants
                lay_c = hero_color.name if hero_color else ""
                
            # Format strings
            def fmt(c, desc): 
                if desc == "None": return "None"
                return f"{c} ({desc})" if c else desc
            
            top_text = fmt(top_c, base_fit['top'])
            bottom_text = fmt(bot_c, base_fit['bottom'])
            layer_text = fmt(lay_c, base_fit['layer']) if base_fit['layer'] != "None" else "None"
            
            if base_fit['bottom'] == "None":
                # It's a dress or jumpsuit
                bottom_text = "N/A" # Dress covers both
            
            # Determine Jewelry
            if is_warm:
                jewelry = np.random.choice([
                    "Gold minimal jewelry", 
                    "Yellow gold hoop earrings", 
                    "Bronze cuff bracelet",
                    "Rose gold chain necklace",
                    "Pearl drop earrings with gold accents",
                    "Chunky gold statement ring"
                ])
            else:
                jewelry = np.random.choice([
                    "Silver accents", 
                    "White gold stud earrings", 
                    "Platinum delicate chain",
                    "Chunky silver bangle",
                    "Classic pearl necklace with silver clasp",
                    "Silver geometric rings"
                ])
                
            colors_arr = []
            if hero_color:
                colors_arr.append({"name": hero_color.name, "hex": hero_color.hex, "family": hero_color.family})
            colors_arr.append({"name": n1, "hex": NEUTRAL_MAP[n1], "family": "Neutral"})
            colors_arr.append({"name": n2, "hex": NEUTRAL_MAP[n2], "family": "Neutral"})

            # Determine Hexes for Avatar Sync
            top_hex, bottom_hex, footwear_hex = "", "", ""
            
            # Map rule colors to hexes
            hero_hex = hero_color.hex if hero_color else "#FFFFFF"
            n1_hex = NEUTRAL_MAP[n1]
            n2_hex = NEUTRAL_MAP[n2]
            
            if placement_rule == 0:
                top_hex = hero_hex
                bottom_hex = n1_hex
                footwear_hex = n2_hex
            elif placement_rule == 1:
                top_hex = n1_hex
                bottom_hex = n1_hex # Monochromatic base
                footwear_hex = hero_hex # Pop on shoes/details often used for layer if footwear undefined
            elif placement_rule == 2:
                top_hex = n1_hex
                bottom_hex = hero_hex
                footwear_hex = n2_hex
            elif placement_rule == 3:
                top_hex = n2_hex
                bottom_hex = n1_hex
                footwear_hex = hero_hex

            # Special cases for dresses/jumpsuits (no separate bottom)
            if base_fit['bottom'] == "None":
                bottom_hex = top_hex # Use same color for bottom to look cohesive
                
            outfits.append({
                "outfitName": f"{req.event} - {base_fit['name']}" if req.event else base_fit['name'],
                "top": top_text,
                "bottom": bottom_text,
                "footwear": base_fit['footwear'],
                "layer": layer_text,
                "jewelry": jewelry,
                "colors": colors_arr,
                "top_hex": top_hex,
                "bottom_hex": bottom_hex,
                "footwear_hex": footwear_hex
            })
        except Exception as e:
            logger.error(f"Failed to generate outfit option {i}: {e}")
            continue
            
    return outfits if outfits else [{
        "outfitName": "Recovery Look",
        "top": "Black Top",
        "bottom": "Black Jeans",
        "footwear": "Street Shoes",
        "layer": "None",
        "jewelry": "Silver studs",
        "colors": [{"name": "Black", "hex": "#0A0A0A", "family": "Neutral"}],
        "top_hex": "#0A0A0A",
        "bottom_hex": "#0A0A0A",
        "footwear_hex": "#0A0A0A"
    }]
