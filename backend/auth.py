from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models

# ============================================================
# CONFIGURATION
# ============================================================
SECRET_KEY = "artec-secret-key-a-changer-en-production-123456"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ============================================================
# FONCTIONS
# ============================================================
def hasher_mot_de_passe(mot_de_passe: str) -> str:
    return pwd_context.hash(mot_de_passe)

def verifier_mot_de_passe(mot_de_passe_clair: str, mot_de_passe_hash: str) -> bool:
    return pwd_context.verify(mot_de_passe_clair, mot_de_passe_hash)

def creer_token_acces(data: dict):
    data_a_encoder = data.copy()
    expiration = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data_a_encoder.update({"exp": expiration})
    return jwt.encode(data_a_encoder, SECRET_KEY, algorithm=ALGORITHM)

def get_utilisateur_actuel(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
    if utilisateur is None:
        raise credentials_exception
    if not utilisateur.est_actif:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    return utilisateur

def exiger_role(role_requis: str):
    def verificateur(utilisateur: models.Utilisateur = Depends(get_utilisateur_actuel)):
        if utilisateur.role != role_requis and utilisateur.role != "admin":
            raise HTTPException(
                status_code=403,
                detail=f"Accès refusé. Rôle requis : {role_requis}"
            )
        return utilisateur
    return verificateur