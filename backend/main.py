from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import io

import models
import auth
import database
import schemas
from ml_model import predire_qos

# Création des tables au démarrage
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="ARTEC Platform API",
    description="Plateforme intelligente de régulation des télécommunications à Madagascar",
    version="2.0.0"
)

# ============================================================
# CONFIGURATION CORS (Autorise React à communiquer avec l'API)
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, remplacer par l'adresse exacte du frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 🔐 AUTHENTIFICATION (Tous les acteurs)
# ============================================================
@app.post("/register")
def register(user: schemas.UtilisateurCreate, db: Session = Depends(database.get_db)):
    if db.query(models.Utilisateur).filter(models.Utilisateur.email == user.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    nouvel_utilisateur = models.Utilisateur(
        nom=user.nom, email=user.email,
        mot_de_passe=auth.hasher_mot_de_passe(user.mot_de_passe),
        role=user.role, operateur_nom=user.operateur_nom
    )
    db.add(nouvel_utilisateur)
    db.commit()
    return {"message": "Compte créé avec succès"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    if not utilisateur or not auth.verifier_mot_de_passe(form_data.password, utilisateur.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not utilisateur.est_actif:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    
    token = auth.creer_token_acces(data={"sub": utilisateur.email, "role": utilisateur.role})
    return {"access_token": token, "token_type": "bearer", "role": utilisateur.role, "nom": utilisateur.nom}

# ============================================================
# 🤖 IA - PRÉDICTION QoS (ARTEC)
# ============================================================
@app.post("/predict")
def predict(data: schemas.IndicateursQoS, user: models.Utilisateur = Depends(auth.exiger_role("artec"))):
    return predire_qos(data.csr, data.debit_mbps, data.latence_ms, data.disponibilite_pct)

# ============================================================
# 👑 ESPACE ADMINISTRATEUR (Supervision)
# ============================================================
@app.get("/admin/utilisateurs")
def voir_utilisateurs(db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.exiger_role("admin"))):
    return db.query(models.Utilisateur).all()

@app.put("/admin/utilisateur/{user_id}/statut")
def changer_statut(user_id: int, actif: bool, db: Session = Depends(database.get_db), admin: models.Utilisateur = Depends(auth.exiger_role("admin"))):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    utilisateur.est_actif = actif
    db.commit()
    return {"message": f"Compte {'activé' if actif else 'désactivé'}"}

# ============================================================
# 🏛️ ESPACE ARTEC (Régulation)
# ============================================================
@app.get("/artec/plaintes")
def voir_plaintes(db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.exiger_role("artec"))):
    return db.query(models.Plainte).all()

@app.get("/artec/operateurs")
def lister_operateurs(db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.exiger_role("artec"))):
    """Permet à l'ARTEC de lister tous les opérateurs pour le chat."""
    return db.query(models.Utilisateur).filter(models.Utilisateur.role == "operateur").all()

@app.post("/artec/alerte")
def envoyer_alerte(operateur_id: int, message: str, niveau: str, db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.exiger_role("artec"))):
    alerte = models.AlerteReglementaire(operateur_id=operateur_id, message=message, niveau=niveau)
    db.add(alerte)
    db.commit()
    return {"message": "Alerte envoyée à l'opérateur"}

@app.post("/artec/import-excel")
async def importer_excel(file: UploadFile = File(...), user: models.Utilisateur = Depends(auth.exiger_role("artec"))):
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez .xlsx ou .csv")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
    
    resultats = []
    for _, row in df.iterrows():
        res = predire_qos(row['csr'], row['debit_mbps'], row['latence_ms'], row['disponibilite_pct'])
        resultats.append(res)
    return {"message": f"{len(resultats)} lignes analysées", "resultats": resultats}

# ============================================================
# 📱 ESPACE OPÉRATEUR (Orange, Yas, Airtel)
# ============================================================
@app.post("/operateur/publication")
def creer_publication(pub: schemas.PublicationCreate, db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.exiger_role("operateur"))):
    nouvelle_pub = models.Publication(
        operateur_id=user.id, titre=pub.titre, contenu=pub.contenu, type_offre=pub.type_offre
    )
    db.add(nouvelle_pub)
    db.commit()
    return {"message": "Publication créée"}

@app.get("/operateur/alertes")
def mes_alertes(db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.exiger_role("operateur"))):
    return db.query(models.AlerteReglementaire).filter(models.AlerteReglementaire.operateur_id == user.id).all()

# ============================================================
# 🌐 ESPACE VISITEUR (Public)
# ============================================================
@app.get("/visiteur/publications")
def voir_publications(db: Session = Depends(database.get_db)):
    pubs = db.query(models.Publication).all()
    return [{"titre": p.titre, "contenu": p.contenu, "type": p.type_offre, "operateur": p.operateur.nom} for p in pubs]

@app.post("/visiteur/plainte")
def deposer_plainte(plainte: schemas.PlainteCreate, db: Session = Depends(database.get_db)):
    nouvelle_plainte = models.Plainte(**plainte.dict())
    db.add(nouvelle_plainte)
    db.commit()
    return {"message": "Plainte déposée avec succès"}

@app.get("/visiteur/statistiques")
def statistiques_publiques(db: Session = Depends(database.get_db)):
    operateurs = db.query(models.Utilisateur).filter(models.Utilisateur.role == "operateur").all()
    stats = []
    for op in operateurs:
        plaintes = db.query(models.Plainte).filter(models.Plainte.operateur_id == op.id).all()
        notes = [p.note for p in plaintes if p.note is not None]
        moyenne = sum(notes) / len(notes) if notes else 0
        stats.append({"operateur": op.operateur_nom, "note_moyenne": round(moyenne, 2), "nombre_plaintes": len(plaintes)})
    return stats

# ============================================================
# 💬 CHAT (ARTEC <-> Opérateurs)
# ============================================================
@app.post("/chat/envoyer")
def envoyer_message(msg: schemas.MessageCreate, db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.get_utilisateur_actuel)):
    nouveau_msg = models.MessageChat(expediteur_id=user.id, destinataire_id=msg.destinataire_id, contenu=msg.contenu)
    db.add(nouveau_msg)
    db.commit()
    return {"message": "Message envoyé"}

@app.get("/chat/historique/{contact_id}")
def historique_chat(contact_id: int, db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.get_utilisateur_actuel)):
    messages = db.query(models.MessageChat).filter(
        ((models.MessageChat.expediteur_id == user.id) & (models.MessageChat.destinataire_id == contact_id)) |
        ((models.MessageChat.expediteur_id == contact_id) & (models.MessageChat.destinataire_id == user.id))
    ).order_by(models.MessageChat.date_envoi).all()
    return messages
# ============================================================
# MARQUER LES MESSAGES COMME LUS
# ============================================================
@app.put("/chat/marquer-lu/{contact_id}")
def marquer_messages_lus(contact_id: int, db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.get_utilisateur_actuel)):
    """Marque tous les messages reçus de 'contact_id' comme lus."""
    messages = db.query(models.MessageChat).filter(
        models.MessageChat.expediteur_id == contact_id,
        models.MessageChat.destinataire_id == user.id,
        models.MessageChat.lu == False
    ).all()
    for msg in messages:
        msg.lu = True
    db.commit()
    return {"message": f"{len(messages)} message(s) marqué(s) comme lu(s)"}

# ============================================================
# COMPTER LES MESSAGES NON LUS (pour l'ARTEC)
# ============================================================
@app.get("/chat/non-lus")
def compter_messages_non_lus(db: Session = Depends(database.get_db), user: models.Utilisateur = Depends(auth.get_utilisateur_actuel)):
    """Retourne le nombre de messages non lus par expéditeur."""
    messages = db.query(models.MessageChat).filter(
        models.MessageChat.destinataire_id == user.id,
        models.MessageChat.lu == False
    ).all()
    
    # On groupe par expéditeur
    resultat = {}
    for msg in messages:
        if msg.expediteur_id not in resultat:
            resultat[msg.expediteur_id] = 0
        resultat[msg.expediteur_id] += 1
    return resultat