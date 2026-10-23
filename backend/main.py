from fastapi import FastAPI

app = FastAPI(
    title="ARTEC Platform API",
    description="API de régulation des télécommunications à Madagascar",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API de l'ARTEC",
        "status": "En ligne",
        "projet": "Plateforme intelligente de régulation"
    }