# 🏛️ ARTEC Platform

Plateforme intelligente de régulation des télécommunications à Madagascar.

## 🎯 Objectif

Centraliser les informations des opérateurs (Orange, Yas, Airtel), surveiller la qualité de service, collecter les avis des visiteurs, analyser les données via l'IA et aider l'ARTEC à détecter les manquements réglementaires.

## 👥 Acteurs

| Acteur | Rôle |
|---|---|
| 👑 Administrateur | Gère les comptes, supervise tout |
| 🏛️ ARTEC | Import Excel, ML, alertes, plaintes, sondages, chat, scraping |
| 📱 Opérateurs (Orange, Yas, Airtel) | Voient leurs mesures, répondent aux alertes, chat avec l'ARTEC |
| 🌐 Visiteur | Infos publiques, plaintes, sondages |

## 🛠️ Stack technique (prévue)

- **Backend** : FastAPI (Python)
- **Frontend** : à définir
- **Base de données** : à définir
- **IA** : TensorFlow / Keras (régression → score QoS 0-100)

## 📁 Structure

artec-platform/
├── backend/ # API + ML
├── frontend/ # Interface web
└── docs/ # Documentation

## 📌 Statut

🚧 Projet en cours de développement — étape 1 : initialisation.