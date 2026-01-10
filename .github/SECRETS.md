# Configuration des Secrets GitHub Actions

## Secrets requis dans GitHub Repository Settings > Secrets and variables > Actions

### Docker Hub (pour build et push des images)
```
DOCKER_USERNAME = votre_username_dockerhub
DOCKER_PASSWORD = votre_token_dockerhub
```

### Snyk (pour tests de sécurité)
```  
SNYK_TOKEN = votre_token_snyk_api
```

### Base de données (si déploiement cloud)
```
DB_CONNECTION_STRING = postgresql://user:pass@host:port/dbname
```

## Comment obtenir les tokens

### 1. Docker Hub Token
1. Aller sur hub.docker.com
2. Account Settings > Security > New Access Token  
3. Nom: "github-actions"
4. Permissions: Read, Write, Delete
5. Copier le token généré dans DOCKER_PASSWORD

### 2. Snyk Token
1. Aller sur app.snyk.io
2. Account Settings > General > Auth Token
3. Copier le token dans SNYK_TOKEN

### 3. Ajouter les secrets dans GitHub
1. Repository > Settings > Secrets and variables > Actions
2. New repository secret
3. Ajouter chaque secret avec son nom et valeur

## Environments GitHub

### Staging Environment
- Name: staging
- Protection rules: Aucune
- Secrets: Peut hériter des repository secrets

### Production Environment  
- Name: production
- Protection rules: Required reviewers (recommandé)
- Secrets: Variables spécifiques production

## Variables d'environnement par défaut

Les workflows utilisent ces variables automatiquement:
- `github.sha` - Hash du commit
- `github.ref` - Référence de la branche
- `github.actor` - Utilisateur qui déclenche l'action