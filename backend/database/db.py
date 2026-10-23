from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# On utilise SQLite (un simple fichier local)
SQLALCHEMY_DATABASE_URL = "sqlite:///./artec.db"

# Création du moteur de base de données
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()