from fastapi import FastAPI
from pydantic import BaseModel
from ml_model import predire_qos

app = FastAPI(
    title="ARTEC Platform API",
    description="API de régulation des télécommunications à Madagascar",
    version="1.0.0"
)

# Modèle de données pour recevoir les 4 indicateurs
class IndicateursQoS(BaseModel):
    csr: float
    debit_mbps: float
    latence_ms: float
    disponibilite_pct: float

# Route d'accueil
@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API de l'ARTEC",
        "status": "En ligne",
        "projet": "Plateforme intelligente de régulation"
    }

# Route de prédiction IA
@app.post("/predict")
def predict_qos(indicateurs: IndicateursQoS):
    """
    Prend les 4 indicateurs QoS et retourne le score prédit par l'IA.
    """
    resultat = predire_qos(
        csr=indicateurs.csr,
        debit=indicateurs.debit_mbps,
        latence=indicateurs.latence_ms,
        disponibilite=indicateurs.disponibilite_pct
    )
    return resultat