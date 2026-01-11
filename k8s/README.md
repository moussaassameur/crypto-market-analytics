# Déploiement Kubernetes avec Minikube

Ce guide explique comment déployer la plateforme crypto sur un cluster Kubernetes local avec Minikube.

## 📋 Prérequis

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installé
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installé
- Docker installé et en cours d'exécution
- Au minimum 4 Go de RAM disponible

## 🚀 Installation de Minikube

### Windows (PowerShell)
```powershell
# Via Chocolatey
choco install minikube

# Ou télécharger depuis
# https://minikube.sigs.k8s.io/docs/start/
```

### macOS
```bash
brew install minikube
```

### Linux
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## 🎯 Démarrage de Minikube

```bash
# Démarrer Minikube avec Docker driver
minikube start --driver=docker --cpus=2 --memory=4096

# Vérifier le statut
minikube status

# Activer les addons utiles
minikube addons enable metrics-server
minikube addons enable dashboard
```

## 🏗️ Construction des Images Docker

Les images doivent être construites dans l'environnement Docker de Minikube :

```bash
# Configurer l'environnement Docker pour Minikube
eval $(minikube docker-env)

# Sur Windows PowerShell:
# & minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Construire les images
docker build -t crypto-api:latest ./api
docker build -t crypto-frontend:latest ./cryptoFront
docker build -t crypto-collector:latest ./collector

# Vérifier les images
docker images | grep crypto
```

## 📦 Déploiement sur Kubernetes

### Déploiement complet

```bash
# Appliquer tous les manifestes dans l'ordre
kubectl apply -f k8s/00-namespace.yml
kubectl apply -f k8s/01-postgres.yml
kubectl apply -f k8s/02-api.yml
kubectl apply -f k8s/03-collector.yml
kubectl apply -f k8s/04-frontend.yml
kubectl apply -f k8s/05-prometheus.yml
kubectl apply -f k8s/06-grafana.yml

# Ou appliquer tout le dossier
kubectl apply -f k8s/
```

### Vérifier le déploiement

```bash
# Voir tous les pods
kubectl get pods -n crypto-platform

# Voir tous les services
kubectl get services -n crypto-platform

# Voir les déploiements
kubectl get deployments -n crypto-platform

# Voir les PVC (stockage)
kubectl get pvc -n crypto-platform

# Voir tous les objets
kubectl get all -n crypto-platform
```

## 🌐 Accès aux Services

### Obtenir les URLs des services

```bash
# Frontend
minikube service frontend -n crypto-platform --url

# API
minikube service api -n crypto-platform --url

# Prometheus
minikube service prometheus -n crypto-platform --url

# Grafana
minikube service grafana -n crypto-platform --url
```

### Ouvrir directement dans le navigateur

```bash
# Ouvrir le frontend
minikube service frontend -n crypto-platform

# Ouvrir Grafana
minikube service grafana -n crypto-platform
```

### Port Forwarding (alternative)

```bash
# Frontend (port 8080)
kubectl port-forward -n crypto-platform svc/frontend 8080:80

# API (port 3000)
kubectl port-forward -n crypto-platform svc/api 3000:3000

# Grafana (port 3002)
kubectl port-forward -n crypto-platform svc/grafana 3002:3000

# Prometheus (port 9090)
kubectl port-forward -n crypto-platform svc/prometheus 9090:9090
```

## 🔍 Surveillance et Debugging

### Logs des pods

```bash
# Logs de l'API
kubectl logs -n crypto-platform -l app=api -f

# Logs du collector
kubectl logs -n crypto-platform -l app=collector -f

# Logs d'un pod spécifique
kubectl logs -n crypto-platform <pod-name> -f
```

### Dashboard Kubernetes

```bash
# Ouvrir le dashboard Minikube
minikube dashboard
```

### Métriques

```bash
# Métriques des pods
kubectl top pods -n crypto-platform

# Métriques des nœuds
kubectl top nodes
```

### Debugging

```bash
# Décrire un pod
kubectl describe pod -n crypto-platform <pod-name>

# Exécuter une commande dans un pod
kubectl exec -n crypto-platform <pod-name> -it -- /bin/sh

# Tester la connexion à l'API depuis un pod
kubectl exec -n crypto-platform <pod-name> -- curl http://api:3000/health
```

## 🔄 Mise à jour du Déploiement

### Reconstruire et redéployer une image

```bash
# Configurer l'environnement Docker
eval $(minikube docker-env)

# Reconstruire l'image
docker build -t crypto-api:latest ./api

# Redémarrer le déploiement
kubectl rollout restart deployment/api -n crypto-platform

# Vérifier le statut du rollout
kubectl rollout status deployment/api -n crypto-platform
```

### Mise à l'échelle

```bash
# Augmenter le nombre de replicas de l'API
kubectl scale deployment/api -n crypto-platform --replicas=3

# Augmenter le nombre de replicas du frontend
kubectl scale deployment/frontend -n crypto-platform --replicas=3
```

## 🧹 Nettoyage

### Supprimer le déploiement

```bash
# Supprimer tous les objets
kubectl delete -f k8s/

# Ou supprimer le namespace (supprime tout)
kubectl delete namespace crypto-platform
```

### Arrêter Minikube

```bash
# Arrêter Minikube
minikube stop

# Supprimer le cluster
minikube delete
```

## 📊 Structure des Manifestes

```
k8s/
├── 00-namespace.yml        # Namespace crypto-platform
├── 01-postgres.yml         # Base de données + PVC
├── 02-api.yml             # API Backend (2 replicas)
├── 03-collector.yml       # Service de collecte (1 replica)
├── 04-frontend.yml        # Frontend React (2 replicas)
├── 05-prometheus.yml      # Monitoring Prometheus
└── 06-grafana.yml         # Dashboard Grafana
```

## 🔐 Credentials par défaut

- **PostgreSQL**: `postgres` / `postgres`
- **Grafana**: `admin` / `admin`

⚠️ **Important**: Changez ces credentials en production !

## 🎯 Architecture Déployée

```
┌─────────────────────────────────────────────────┐
│             Kubernetes Cluster                   │
│  (Namespace: crypto-platform)                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Frontend  │  │Frontend  │  │API       │      │
│  │Replica 1 │  │Replica 2 │  │Replica 1 │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │            │
│       └─────────────┴──────────────┘            │
│                     │                           │
│       ┌─────────────┴──────────────┐            │
│       │                            │            │
│  ┌────▼─────┐  ┌──────────┐  ┌────▼─────┐      │
│  │API       │  │Collector │  │PostgreSQL│      │
│  │Replica 2 │  │          │  │(PVC)     │      │
│  └────┬─────┘  └────┬─────┘  └──────────┘      │
│       │             │                           │
│  ┌────▼─────────────▼─────┐                     │
│  │    Prometheus          │                     │
│  └────────┬───────────────┘                     │
│           │                                     │
│  ┌────────▼───────────────┐                     │
│  │      Grafana           │                     │
│  └────────────────────────┘                     │
└─────────────────────────────────────────────────┘
```

## 📝 CI/CD avec GitHub Actions

Le déploiement est automatisé dans [.github/workflows/ci.yml](.github/workflows/ci.yml) :

- **Job `deploy-kubernetes`** : Déploie automatiquement sur Minikube lors des push sur `main`
- Configure Minikube dans le runner GitHub
- Construit les images Docker
- Applique les manifestes Kubernetes
- Effectue des health checks
- Génère un résumé de déploiement

## 🆘 Troubleshooting

### Les pods ne démarrent pas

```bash
# Vérifier les événements
kubectl get events -n crypto-platform --sort-by='.lastTimestamp'

# Décrire le pod en erreur
kubectl describe pod -n crypto-platform <pod-name>
```

### Erreur "ImagePullBackOff"

Les images doivent être construites dans l'environnement Docker de Minikube :
```bash
eval $(minikube docker-env)
docker build -t crypto-api:latest ./api
# ... etc
```

### Base de données non accessible

```bash
# Vérifier que le pod postgres est prêt
kubectl get pod -n crypto-platform -l app=postgres

# Vérifier les logs
kubectl logs -n crypto-platform -l app=postgres
```

### Services non accessibles

```bash
# Lister les services et leurs ports
kubectl get services -n crypto-platform

# Vérifier que Minikube tunnel est actif (si nécessaire)
minikube tunnel
```

## 📚 Ressources

- [Documentation Minikube](https://minikube.sigs.k8s.io/docs/)
- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
