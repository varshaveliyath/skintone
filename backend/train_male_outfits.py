import numpy as np
import joblib
from sklearn.neighbors import NearestNeighbors

# Male Stylist fits reference (matching MALE_STYLISH_FITS in outfit_router.py)
# 0: Modern Minimalist (Casual/Mild)
# 1: Tailored Sharp (Formal/Mild)
# 2: Relaxed Utility (Casual/Mild)
# 3: Urban Tech (Street/Active/Mild)
# 4: Preppy Classic (Casual/Hot)
# 5: Skater Edge (Street/Mild)
# 6: Night Vibes (Night/Mild)
# 7: Quiet Luxury (Casual/Mild)
# 8: Athleisure (Street/Active/Mild)
# 9: Downtown Rugged (Casual/Mild)
# 10: Summer Clean (Casual/Hot)
# 11: Corporate Avant (Formal/Cold)

# Data generation
# Features: [event_encoded, formality_score, weather_score]
# event_encoded: 0-Casual, 1-Work/Formal, 2-Night/Party, 3-Wedding/Gala, 4-Street/Active

data = [
    # Casual, Low Formality, Mild Weather
    [0, 0.2, 0.5, 0], # Modern Minimalist
    [0, 0.3, 0.5, 2], # Relaxed Utility
    [0, 0.2, 0.5, 5], # Skater Edge
    [0, 0.3, 0.5, 9], # Downtown Rugged
    
    # Formal/Work, High Formality, Mild/Cool Weather
    [1, 0.8, 0.5, 1], # Tailored Sharp
    [1, 0.7, 0.6, 1], # Tailored Sharp
    [1, 0.9, 0.8, 11], # Corporate Avant
    
    # Night/Party, Medium Formality, Mild Weather
    [2, 0.6, 0.5, 6], # Night Vibes
    [2, 0.5, 0.5, 0], # Modern Minimalist
    
    # Wedding/Gala, Extreme Formality, Mild Weather
    [3, 0.95, 0.5, 1], # Tailored Sharp
    [3, 0.9, 0.6, 11], # Corporate Avant
    
    # Street/Active, Low Formality, Mild Weather
    [4, 0.2, 0.5, 3], # Urban Tech
    [4, 0.1, 0.5, 8], # Athleisure
    
    # Summer/Hot Weather
    [0, 0.2, 0.1, 10], # Summer Clean
    [0, 0.3, 0.1, 4],  # Preppy Classic
    [0, 0.1, 0.2, 10], # Summer Clean
    
    # Winter/Cold Weather
    [0, 0.4, 0.9, 9],  # Downtown Rugged (Layered)
    [1, 0.8, 0.9, 11], # Corporate Avant (Trench)
    [2, 0.6, 0.8, 6],  # Night Vibes (Leather Jacket)
]

# Expand data with some jitter for better training
X = []
y = []

for row in data:
    for _ in range(50): # 50 variations per archetype
        event, formality, weather, label = row
        f_jitter = np.clip(formality + np.random.normal(0, 0.1), 0, 1.0)
        w_jitter = np.clip(weather + np.random.normal(0, 0.1), 0, 1.0)
        X.append([event, f_jitter, w_jitter])
        y.append(label)

X = np.array(X)
y = np.array(y)

# Train KNN
knn = NearestNeighbors(n_neighbors=15, algorithm='auto')
knn.fit(X)

# Save models
joblib.dump(knn, "male_outfit_knn_model.pkl")
joblib.dump(y, "male_outfit_knn_labels.pkl")

print("Male outfit Gen ML models trained and saved successfully.")
