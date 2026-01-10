# Environnements GitHub Actions

## Staging Environment
- **URL**: https://crypto-platform-staging.herokuapp.com
- **Branche**: Toutes (pour tests)
- **Protection**: Aucune
- **Deploy automatique**: Oui sur success des tests

## Production Environment  
- **URL**: https://crypto-platform.herokuapp.com
- **Branche**: main uniquement
- **Protection**: Reviewers requis (recommandé)
- **Deploy automatique**: Après validation staging

## Configuration dans GitHub

1. Repository > Settings > Environments
2. New environment "staging"
3. New environment "production" 
4. Pour production: cocher "Required reviewers"
5. Ajouter reviewers (au moins 1 personne)

## Variables par environnement

### Staging
```
API_URL=https://crypto-api-staging.herokuapp.com
FRONTEND_URL=https://crypto-frontend-staging.herokuapp.com
DB_NAME=crypto_staging
```

### Production  
```
API_URL=https://crypto-api.herokuapp.com
FRONTEND_URL=https://crypto-frontend.herokuapp.com
DB_NAME=crypto_production
```