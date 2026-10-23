from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import func

# Imports locaux
from database.db import engine, SessionLocal, Base
import models.models as models
import schemas
import auth
from ml_model import predire_qos

# --- Création des tables dans la base de données ---
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ARTEC Platform API",
    description="API de régulation des télécommunications à Madagascar",
    version="1.0.0"
)

# 🛡️ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dépendance pour la base de données ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Modèles de données pour le ML ---
class IndicateursQoS(BaseModel):
    csr: float
    debit_mbps: float
    latence_ms: float
    disponibilite_pct: float

# --- ROUTES ---

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API de l'ARTEC",
        "status": "En ligne",
        "projet": "Plateforme intelligente de régulation"
    }

# 1. Route d'inscription
@app.post("/register", response_model=schemas.UtilisateurResponse)
def register(user: schemas.UtilisateurCreate, db: Session = Depends(get_db)):
    nouvel_utilisateur = auth.creer_utilisateur(db, user)
    if nouvel_utilisateur is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà."
        )
    return nouvel_utilisateur

# 2. Route de connexion
@app.post("/login")
def login(user: schemas.UtilisateurLogin, db: Session = Depends(get_db)):
    utilisateur = auth.authentifier_utilisateur(db, user.email, user.mot_de_passe)
    if not utilisateur:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect."
        )
    return {
        "message": "Connexion réussie",
        "utilisateur": {
            "id": utilisateur.id,
            "nom": utilisateur.nom,
            "email": utilisateur.email,
            "role": utilisateur.role,
            "operateur_nom": utilisateur.operateur_nom
        }
    }

# 3. Route de prédiction IA
@app.post("/predict")
def predict_qos(indicateurs: IndicateursQoS):
    resultat = predire_qos(
        csr=indicateurs.csr,
        debit=indicateurs.debit_mbps,
        latence=indicateurs.latence_ms,
        disponibilite=indicateurs.disponibilite_pct
    )
    return resultat

# 4. Route pour enregistrer un avis visiteur
@app.post("/avis")
def ajouter_avis(avis: schemas.AvisCreate, db: Session = Depends(get_db)):
    nouvel_avis = models.Avis(
        operateur_nom=avis.operateur_nom,
        note=avis.note,
        commentaire=avis.commentaire,
        service=avis.service,
        region=avis.region
    )
    db.add(nouvel_avis)
    db.commit()
    db.refresh(nouvel_avis)
    return {"message": "Merci pour votre avis !", "avis_id": nouvel_avis.id}

# 5. Route pour récupérer les statistiques des avis par opérateur
@app.get("/statistiques")
def get_statistiques(db: Session = Depends(get_db)):
    stats = db.query(
        models.Avis.operateur_nom, 
        func.avg(models.Avis.note).label('moyenne'),
        func.count(models.Avis.id).label('total')
    ).group_by(models.Avis.operateur_nom).all()
    
    resultat = []
    for operateur, moyenne, total in stats:
        resultat.append({
            "operateur": operateur,
            "moyenne": round(float(moyenne), 2),
            "total_avis": total
        })
    
    return resultat

# 6. Route pour envoyer un message
@app.post("/messages", response_model=schemas.MessageResponse)
def envoyer_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    nouveau_message = models.Message(
        expediteur_email=message.expediteur_email,
        destinataire_email=message.destinataire_email,
        contenu=message.contenu
    )
    db.add(nouveau_message)
    db.commit()
    db.refresh(nouveau_message)
    return nouveau_message

# 7. Route pour récupérer les messages entre deux utilisateurs
@app.get("/messages/{email1}/{email2}")
def get_messages(email1: str, email2: str, db: Session = Depends(get_db)):
    from sqlalchemy import or_, and_
    messages = db.query(models.Message).filter(
        or_(
            and_(models.Message.expediteur_email == email1, models.Message.destinataire_email == email2),
            and_(models.Message.expediteur_email == email2, models.Message.destinataire_email == email1)
        )
    ).order_by(models.Message.date_envoi.asc()).all()
    return messages