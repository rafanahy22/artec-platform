from pydantic import BaseModel
from typing import Optional

# --- Utilisateur ---
class UtilisateurCreate(BaseModel):
    nom: str
    email: str
    mot_de_passe: str
    role: str  # "admin", "artec", "operateur"
    operateur_nom: Optional[str] = None  # "Orange", "Yas", "Airtel" (si role = operateur)

class UtilisateurLogin(BaseModel):
    email: str
    mot_de_passe: str

class UtilisateurResponse(BaseModel):
    id: int
    nom: str
    email: str
    role: str
    operateur_nom: Optional[str] = None

    class Config:
        from_attributes = True

# --- Avis ---
class AvisCreate(BaseModel):
    operateur_nom: str
    note: int
    commentaire: str
    service: str
    region: Optional[str] = None

from datetime import datetime

class MessageCreate(BaseModel):
    expediteur_email: str
    destinataire_email: str
    contenu: str

class MessageResponse(BaseModel):
    id: int
    expediteur_email: str
    destinataire_email: str
    contenu: str
    date_envoi: datetime

    class Config:
        from_attributes = True