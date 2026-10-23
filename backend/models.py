from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    mot_de_passe = Column(String)  # Sera chiffré, jamais en clair
    role = Column(String, default="visiteur")  # admin, artec, operateur, visiteur
    operateur_nom = Column(String, nullable=True)  # ex: "Orange", "Yas", "Airtel" (rempli seulement si role=operateur)
    est_actif = Column(Boolean, default=True)  # Pour que l'admin puisse désactiver un compte