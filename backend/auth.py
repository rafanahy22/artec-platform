from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.models import Utilisateur
import schemas

# Configuration du cryptage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hasher_mot_de_passe(mot_de_passe: str):
    return pwd_context.hash(mot_de_passe)

def verifier_mot_de_passe(mot_de_passe_clair: str, mot_de_passe_hache: str):
    return pwd_context.verify(mot_de_passe_clair, mot_de_passe_hache)

def creer_utilisateur(db: Session, user: schemas.UtilisateurCreate):
    # On vérifie si l'email existe déjà
    existe = db.query(Utilisateur).filter(Utilisateur.email == user.email).first()
    if existe:
        return None
    
    # On crypte le mot de passe
    mot_de_passe_hache = hasher_mot_de_passe(user.mot_de_passe)
    
    # On crée l'utilisateur
    nouvel_utilisateur = Utilisateur(
        nom=user.nom,
        email=user.email,
        mot_de_passe=mot_de_passe_hache,
        role=user.role,
        operateur_nom=user.operateur_nom
    )
    
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur

def authentifier_utilisateur(db: Session, email: str, mot_de_passe: str):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if not utilisateur:
        return None
    if not verifier_mot_de_passe(mot_de_passe, utilisateur.mot_de_passe):
        return None
    return utilisateur