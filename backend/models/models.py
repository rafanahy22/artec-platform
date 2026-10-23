from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    mot_de_passe = Column(String)
    role = Column(String)  # "admin", "artec", "operateur"
    
    # Si c'est un opérateur, on précise lequel (Orange, Yas, Airtel)
    operateur_nom = Column(String, nullable=True)

class Avis(Base):
    __tablename__ = "avis"

    id = Column(Integer, primary_key=True, index=True)
    operateur_nom = Column(String, index=True)
    note = Column(Integer)  # 0 à 10
    commentaire = Column(String)
    service = Column(String)  # Appels, SMS, Internet...
    region = Column(String, nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    expediteur_email = Column(String, index=True)
    destinataire_email = Column(String, index=True)
    contenu = Column(String)
    date_envoi = Column(DateTime, default=datetime.utcnow)