# Crypto Market Analytics

[![CI Tests](https://github.com/USERNAME/crypto-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/crypto-platform/actions/workflows/ci.yml)
[![CD Deploy](https://github.com/USERNAME/crypto-platform/actions/workflows/cd.yml/badge.svg)](https://github.com/USERNAME/crypto-platform/actions/workflows/cd.yml)
[![Performance](https://github.com/USERNAME/crypto-platform/actions/workflows/performance.yml/badge.svg)](https://github.com/USERNAME/crypto-platform/actions/workflows/performance.yml)
[![Security](https://snyk.io/test/github/USERNAME/crypto-platform/badge.svg)](https://snyk.io/test/github/USERNAME/crypto-platform)

Ce projet consiste à concevoir et développer une plateforme complète de suivi,
d'analyse et de prévision des marchés de cryptomonnaies avec pipeline CI/CD automatisé.

## Pipeline CI/CD

| Workflow | Trigger | Durée | Description |
|----------|---------|-------|-------------|
| **CI Tests** | Push/PR | ~5min | Tests unitaires + intégration + sécurité |
| **CD Deploy** | Merge main | ~3min | Build Docker + déploiement staging/prod |
| **Performance** | Nightly/Manual | ~10min | Tests K6 de performance |

## Status Qualité

- Tests: 105 tests d'intégration + 63 tests de sécurité
- Couverture: >80% du code applicatif
- Sécurité: Scan Snyk automatique + 0 vulnérabilité critique
- Performance: Support 800+ utilisateurs concurrent

## Objectifs

- Collecter automatiquement les données de prix depuis une API publique (ex : CoinGecko)
- Stocker l’historique des prix dans une base PostgreSQL
- Exposer une API backend (Express) pour le frontend web
- Proposer un tableau de bord (dashboard) avec graphiques et filtres temporels
- Permettre la création d’alertes personnalisées
- Simuler un portefeuille virtuel (achats / ventes)
- Mettre en place un processus de développement Agile (backlog, sprints, CI/CD, Docker, Kubernetes)

##  Architecture globale 

L’architecture générale est la suivante :

- **Collector** : service qui récupère régulièrement les données de marché via une API externe
- **API Backend (Express)** : fournit des endpoints REST pour le frontend et la gestion des données
- **Frontend Web** : interface utilisateur (dashboard, alertes, portefeuille, prévisions)
- **Base de données PostgreSQL** : stockage des cryptos, prix, alertes, portefeuilles, utilisateurs
- **Scheduler (cron)** : déclenche automatiquement la collecte et la vérification des alertes

Le diagramme d’architecture détaillé se trouve dans `docs/architecture.png`.

## Processus de développement (GLA)

- Méthodologie : Agile (backlog + sprints)
- Sprint 0 : initialisation du projet et conception (architecture + UML)
- Sprints suivants : implémentation de l’API, du collector, de la webapp, des tests, de la CI/CD et du déploiement Docker/Kubernetes.
