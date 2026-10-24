from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models

# ============================================================
# CONFIGURATION DE LA SÉCURITÉ (Le cœur de ton application)
# ============================================================
# La clé secrète sert à signer les tokens. En production, on la cache dans un fichier .env
SECRET_KEY = "artec-secret-key-super-securise-madagascar-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # Le token expire après 2 heures

# Outil pour crypter les mots de passe avec l'algorithme bcrypt (le plus sécurisé)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 : dit à FastAPI où se trouve la route de login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ============================================================
# GESTION DES MOTS DE PASSE
# ============================================================
def hasher_mot_de_passe(mot_de_passe: str) -> str:
    """Transforme un mot de passe en clair en une chaîne cryptée irréversible."""
    return pwd_context.hash(mot_de_passe)

def verifier_mot_de_passe(mot_de_passe_clair: str, mot_de_passe_hash: str) -> bool:
    """Vérifie si le mot de passe tapé correspond au mot de passe crypté en base."""
    return pwd_context.verify(mot_de_passe_clair, mot_de_passe_hash)

# ============================================================
# GESTION DES TOKENS JWT (Le ticket d'entrée)
# ============================================================
def creer_token_acces(data: dict):
    """Génère un token JWT qui contient les infos de l'utilisateur + une date d'expiration."""
    data_a_encoder = data.copy()
    expiration = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data_a_encoder.update({"exp": expiration})
    return jwt.encode(data_a_encoder, SECRET_KEY, algorithm=ALGORITHM)

# ============================================================
# DÉPENDANCES DE SÉCURITÉ POUR FASTAPI
# ============================================================
def get_utilisateur_actuel(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Cette fonction est appelée à chaque fois qu'une route protégée est touchée.
    Elle vérifie que le token est valide et retourne l'utilisateur connecté.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # On décode le token pour retrouver l'email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # On cherche l'utilisateur dans la base de données
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
    
    if utilisateur is None:
        raise credentials_exception
    if not utilisateur.est_actif:
        raise HTTPException(status_code=403, detail="Compte désactivé par l'administrateur")
        
    return utilisateur

def exiger_role(role_requis: str):
    """
    C'est le 'garde du corps' des routes. 
    Exemple : exiger_role("artec") empêche un visiteur d'accéder aux données de l'ARTEC.
    L'admin a toujours accès à tout.
    """
    def verificateur(utilisateur: models.Utilisateur = Depends(get_utilisateur_actuel)):
        if utilisateur.role != role_requis and utilisateur.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès refusé. Rôle requis : {role_requis}"
            )
        return utilisateur
    return verificateur