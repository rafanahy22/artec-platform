from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# On crée un fichier base de données SQLite nommé "artec.db"
SQLALCHEMY_DATABASE_URL = "sqlite:///./artec.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fonction pour obtenir la session de base de données (utilisée par FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
