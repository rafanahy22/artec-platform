import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# ============================================================
# DONNÉES D'ENTRAÎNEMENT (issues de ton dataset)
# ============================================================
X = np.array([
    [82.5, 3.2, 85.0, 91.5], [85.1, 4.5, 72.0, 93.0], [88.8, 5.8, 65.0, 94.8],
    [90.2, 6.7, 58.0, 95.5], [91.5, 7.9, 52.0, 96.2], [92.8, 8.8, 48.0, 97.0],
    [93.6, 9.7, 44.0, 97.5], [94.5, 10.9, 40.0, 98.0], [95.1, 12.1, 36.0, 98.5],
    [96.0, 13.5, 32.0, 99.0], [78.5, 2.5, 95.0, 89.0], [81.7, 3.8, 82.0, 91.5],
    [87.2, 5.1, 70.0, 94.0], [89.5, 6.3, 61.0, 95.0], [92.0, 8.5, 49.0, 96.8],
    [93.8, 10.2, 42.0, 97.8], [95.5, 12.8, 35.0, 98.7], [96.4, 14.6, 29.0, 99.2],
    [97.1, 16.2, 25.0, 99.5], [98.0, 18.5, 20.0, 99.8]
], dtype=float)

Y = np.array([
    18.0, 27.0, 34.0, 42.0, 49.0, 55.0, 61.0, 68.0, 74.0, 81.0,
    10.0, 22.0, 31.0, 39.0, 53.0, 64.0, 76.0, 88.0, 95.0, 100.0
], dtype=float)

# ============================================================
# MODÈLE & ENTRAÎNEMENT
# ============================================================
model = Sequential([
    Dense(1, activation='linear', input_shape=(4,))
])
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

print("⏳ Entraînement du modèle en cours...")
history = model.fit(X, Y, epochs=2500, verbose=0)
print("✅ Modèle entraîné !")

# ============================================================
# FONCTION DE PRÉDICTION
# ============================================================
def predire_qos(csr, debit, latence, disponibilite):
    """
    Prend 4 valeurs en entrée et retourne le score QoS (0-100)
    """
    X_nouveau = np.array([[csr, debit, latence, disponibilite]], dtype=float)
    prediction = model.predict(X_nouveau, verbose=0)
    score = float(np.clip(prediction[0, 0], 0, 100))
    
    # Interprétation
    if score <= 20:
        interpretation = "Très mauvaise qualité"
    elif score <= 40:
        interpretation = "Mauvaise qualité"
    elif score <= 60:
        interpretation = "Qualité moyenne"
    elif score <= 80:
        interpretation = "Bonne qualité"
    elif score <= 90:
        interpretation = "Très bonne qualité"
    else:
        interpretation = "Excellente qualité"
    
    return {
        "score_qos": round(score, 2),
        "interpretation": interpretation,
        "details": {
            "csr": csr,
            "debit_mbps": debit,
            "latence_ms": latence,
            "disponibilite_pct": disponibilite
        }
    }

# ============================================================
# TEST (uniquement si on lance ce fichier directement)
# ============================================================
if __name__ == "__main__":
    print("\n=== TEST DE PRÉDICTION ===")
    resultat = predire_qos(95.5, 13.8, 32.5, 99.2)
    print(resultat)