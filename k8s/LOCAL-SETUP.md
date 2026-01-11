# Configuration des Domaines Locaux (.local)

Pour accéder à votre application K8s avec des URLs comme **crypto-platform.local**, vous devez configurer votre fichier hosts.

## 🖥️ Configuration Locale (Après installation Minikube)

### Windows

```powershell
# Obtenir l'IP de Minikube
minikube ip

# Ouvrir le fichier hosts en tant qu'administrateur
notepad C:\Windows\System32\drivers\etc\hosts

# Ajouter ces lignes (remplacez 192.168.49.2 par votre IP Minikube)
192.168.49.2 crypto-platform.local
192.168.49.2 www.crypto-platform.local
192.168.49.2 api.crypto-platform.local
192.168.49.2 grafana.crypto-platform.local
192.168.49.2 prometheus.crypto-platform.local

# Sauvegarder et fermer
```

### macOS / Linux

```bash
# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)

# Ajouter au fichier hosts
echo "$MINIKUBE_IP crypto-platform.local" | sudo tee -a /etc/hosts
echo "$MINIKUBE_IP www.crypto-platform.local" | sudo tee -a /etc/hosts
echo "$MINIKUBE_IP api.crypto-platform.local" | sudo tee -a /etc/hosts
echo "$MINIKUBE_IP grafana.crypto-platform.local" | sudo tee -a /etc/hosts
echo "$MINIKUBE_IP prometheus.crypto-platform.local" | sudo tee -a /etc/hosts
```

## 🚀 Déploiement

```bash
# Démarrer Minikube
minikube start --driver=docker

# Installer NGINX Ingress
minikube addons enable ingress

# Construire les images
eval $(minikube docker-env)
docker build -t crypto-api:latest ./api
docker build -t crypto-frontend:latest ./cryptoFront
docker build -t crypto-collector:latest ./collector

# Déployer
kubectl apply -f k8s/

# Vérifier l'Ingress
kubectl get ingress -n crypto-platform
```

## 🌐 Accès aux URLs

Après configuration, ouvrez dans votre navigateur :

- **Frontend** : http://crypto-platform.local
- **API** : http://api.crypto-platform.local/api/health
- **Grafana** : http://grafana.crypto-platform.local
- **Prometheus** : http://prometheus.crypto-platform.local

## ⚠️ Notes

- ✅ **Gratuit** - Pas besoin d'acheter un domaine
- ✅ **Local** - Fonctionne uniquement sur votre machine
- ❌ **Pas de HTTPS** - Les domaines .local ne peuvent pas avoir de certificat SSL public
- ❌ **Pas accessible depuis Internet** - Uniquement en local

## 🔄 CI/CD GitHub Actions

Le CI/CD configure automatiquement les domaines .local dans `/etc/hosts` lors du déploiement.

## 💡 Pour un vrai domaine avec HTTPS

Si vous voulez rendre votre site accessible publiquement avec HTTPS, consultez [deployment-cloud.md](deployment-cloud.md) pour utiliser un vrai domaine (.com, .net, etc.).
