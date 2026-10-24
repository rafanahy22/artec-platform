# 🏛️ ARTEC Platform

**Plateforme intelligente de régulation des télécommunications à Madagascar.**

## 🎯 Objectif

Centraliser les informations des opérateurs (Orange, Yas, Airtel), surveiller la qualité de service, collecter les avis des visiteurs, analyser les données grâce à l'intelligence artificielle et aider l'ARTEC à détecter les manquements réglementaires.

## 👥 Les 4 Espaces

| Acteur | Fonctionnalités |
|---|---|
| 👑 **Administrateur** | Gère les comptes (activer/désactiver), supervise toute la plateforme. |
| 🏛️ **ARTEC** | Analyse la QoS avec l'IA, importe des fichiers Excel, gère les plaintes, envoie des alertes, discute avec les opérateurs. |
| 📱 **Opérateurs** (Orange, Yas, Airtel) | Publient leurs offres, consultent leurs alertes, discutent avec l'ARTEC. |
| 🌐 **Visiteur** | Consulte les offres, les statistiques publiques, dépose une plainte (sans compte). |

## 🛠️ Stack Technique

- **Backend** : Python, FastAPI, SQLite, SQLAlchemy
- **Intelligence Artificielle** : TensorFlow, Keras, Scikit-learn
- **Sécurité** : JWT (JSON Web Tokens), Bcrypt
- **Frontend** : React, Tailwind CSS

## 🚀 Comment lancer le projet

### Prérequis
- Python 3.10+
- Node.js 18+

### 1. Lancer le Backend (Python)
Ouvrez un terminal et tapez :
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

## 📌 Statut

🚧 Projet en cours de développement — Version 2.0
