# Crypto Market Analytics

Ce projet consiste à concevoir et développer une plateforme complète de suivi,
d’analyse et de prévision des marchés de cryptomonnaies.

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
## 📊 Monitoring (Prometheus + Grafana)

La plateforme intègre une stack d'observabilité complète :

### Services

| Service    | Port  | URL                     |
|------------|-------|-------------------------|
| Prometheus | 9090  | http://localhost:9090   |
| Grafana    | 3002  | http://localhost:3002   |

### Démarrage du monitoring

```powershell
# Démarrer uniquement Prometheus et Grafana
docker-compose up -d prometheus grafana

# Ou utiliser le script dédié
.\scripts\start-monitoring.ps1
```

### Métriques collectées

L'API expose les métriques suivantes sur `/metrics` :

- **http_requests_total** : Nombre total de requêtes HTTP (par méthode, route, code)
- **http_request_duration_seconds** : Durée des requêtes (histogramme)
- **active_connections** : Connexions WebSocket actives
- **alerts_triggered_total** : Alertes de prix déclenchées
- **crypto_price_usd** : Prix des cryptomonnaies en USD
- **errors_total** : Nombre total d'erreurs
- **active_users** : Utilisateurs actuellement connectés
- **portfolio_transactions_total** : Transactions de portefeuille

### Alertes configurées

| Alerte                 | Condition                          | Sévérité  |
|------------------------|-----------------------------------|-----------|
| ApiDown               | API indisponible > 1 min          | Critical  |
| HighErrorRate         | Erreurs 5xx > 5%                  | Warning   |
| SlowResponseTime      | P95 latence > 1s                  | Warning   |
| HighActiveConnections | Connexions > 100                  | Warning   |
| ErrorSpike            | > 50 erreurs en 5 min             | Critical  |

### Identifiants Grafana

- **Utilisateur** : admin
- **Mot de passe** : admin (par défaut)

Le dashboard "Crypto Platform Dashboard" est automatiquement provisionné.