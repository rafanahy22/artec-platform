from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models
import auth
import database
from ml_model import predire_qos

# Création des tables dans la base de données au démarrage
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="ARTEC Platform API",
    description="API de régulation des télécommunications à Madagascar",
    version="1.0.0"
)

# ============================================================
# MODÈLES PYDANTIC (pour valider les données entrantes)
# ============================================================
class IndicateursQoS(BaseModel):
    csr: float
    debit_mbps: float
    latence_ms: float
    disponibilite_pct: float

class UtilisateurCreation(BaseModel):
    nom: str
    email: str
    mot_de_passe: str
    role: str
    operateur_nom: str | None = None

# ============================================================
# ROUTES DE BASE
# ============================================================
@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API de l'ARTEC",
        "status": "En ligne",
        "projet": "Plateforme intelligente de régulation"
    }

@app.post("/predict")
def predict_qos(indicateurs: IndicateursQoS):
    resultat = predire_qos(
        csr=indicateurs.csr,
        debit=indicateurs.debit_mbps,
        latence=indicateurs.latence_ms,
        disponibilite=indicateurs.disponibilite_pct
    )
    return resultat

# ============================================================
# AUTHENTIFICATION
# ============================================================
@app.post("/register")
def register(user: UtilisateurCreation, db: Session = Depends(database.get_db)):
    # Vérifier si l'email existe déjà
    existe = db.query(models.Utilisateur).filter(models.Utilisateur.email == user.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    nouvel_utilisateur = models.Utilisateur(
        nom=user.nom,
        email=user.email,
        mot_de_passe=auth.hasher_mot_de_passe(user.mot_de_passe),
        role=user.role,
        operateur_nom=user.operateur_nom
    )
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return {"message": "Utilisateur créé avec succès", "id": nouvel_utilisateur.id}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    
    if not utilisateur or not auth.verifier_mot_de_passe(form_data.password, utilisateur.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not utilisateur.est_actif:
        raise HTTPException(status_code=403, detail="Compte désactivé par l'administrateur")

    token = auth.creer_token_acces(data={"sub": utilisateur.email, "role": utilisateur.role})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/moi")
def lire_mon_profil(utilisateur: models.Utilisateur = Depends(auth.get_utilisateur_actuel)):
    return {
        "id": utilisateur.id,
        "nom": utilisateur.nom,
        "email": utilisateur.email,
        "role": utilisateur.role,
        "operateur": utilisateur.operateur_nom
    }