from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

# ============================================================
# TABLE : UTILISATEURS (Admin, ARTEC, Opérateurs, Visiteurs)
# ============================================================
class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    mot_de_passe = Column(String)  # Sera chiffré, jamais en clair
    role = Column(String, default="visiteur")  # admin, artec, operateur, visiteur
    operateur_nom = Column(String, nullable=True)  # ex: "Orange", "Yas", "Airtel"
    est_actif = Column(Boolean, default=True)  # Pour que l'admin puisse désactiver
    date_creation = Column(DateTime, default=datetime.datetime.utcnow)

# ============================================================
# TABLE : PUBLICATIONS (Offres des opérateurs)
# ============================================================
class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    operateur_id = Column(Integer, ForeignKey("utilisateurs.id"))
    titre = Column(String)
    contenu = Column(String)
    type_offre = Column(String)  # Appels, SMS, Internet, Forfait
    date_pub = Column(DateTime, default=datetime.datetime.utcnow)
    
    operateur = relationship("Utilisateur")

# ============================================================
# TABLE : PLAINTES (Avis et signalements des visiteurs)
# ============================================================
class Plainte(Base):
    __tablename__ = "plaintes"

    id = Column(Integer, primary_key=True, index=True)
    visiteur_nom = Column(String, nullable=True)  # Anonyme possible
    operateur_id = Column(Integer, ForeignKey("utilisateurs.id"))
    categorie = Column(String)  # Appels, SMS, Internet, Couverture, etc.
    description = Column(String)
    region = Column(String, nullable=True)
    note = Column(Integer, nullable=True)  # Note de 0 à 10
    statut = Column(String, default="En attente")  # En attente, Traitée, Sanctionnée
    date_plainte = Column(DateTime, default=datetime.datetime.utcnow)
    
    operateur = relationship("Utilisateur")

# ============================================================
# TABLE : MESSAGES CHAT (ARTEC <-> Opérateurs)
# ============================================================
class MessageChat(Base):
    __tablename__ = "messages_chat"

    id = Column(Integer, primary_key=True, index=True)
    expediteur_id = Column(Integer, ForeignKey("utilisateurs.id"))
    destinataire_id = Column(Integer, ForeignKey("utilisateurs.id"))
    contenu = Column(String)
    date_envoi = Column(DateTime, default=datetime.datetime.utcnow)
    lu = Column(Boolean, default=False)
    
    expediteur = relationship("Utilisateur", foreign_keys=[expediteur_id])
    destinataire = relationship("Utilisateur", foreign_keys=[destinataire_id])

# ============================================================
# TABLE : ALERTES RÉGLEMENTAIRES (Envoyées par l'ARTEC)
# ============================================================
class AlerteReglementaire(Base):
    __tablename__ = "alertes"

    id = Column(Integer, primary_key=True, index=True)
    operateur_id = Column(Integer, ForeignKey("utilisateurs.id"))
    niveau = Column(String)  # Info, Avertissement, Sanction
    message = Column(String)
    date_alerte = Column(DateTime, default=datetime.datetime.utcnow)
    resolue = Column(Boolean, default=False)
    
    operateur = relationship("Utilisateur")

# ============================================================
# TABLE : SONDAGES (Questions de l'ARTEC/Opérateurs aux visiteurs)
# ============================================================
class Sondage(Base):
    __tablename__ = "sondages"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    operateur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=True)
    actif = Column(Boolean, default=True)
    date_creation = Column(DateTime, default=datetime.datetime.utcnow)
    
    operateur = relationship("Utilisateur")

class VoteSondage(Base):
    __tablename__ = "votes_sondages"

    id = Column(Integer, primary_key=True, index=True)
    sondage_id = Column(Integer, ForeignKey("sondages.id"))
    note = Column(Integer)  # Note de 0 à 10
    region = Column(String, nullable=True)
    commentaire = Column(String, nullable=True)
    date_vote = Column(DateTime, default=datetime.datetime.utcnow)
    
    sondage = relationship("Sondage")