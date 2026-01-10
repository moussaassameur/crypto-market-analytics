# Guide de Démarrage CI/CD

## Configuration initiale

### 1. Secrets GitHub
Aller dans Settings > Secrets and variables > Actions et ajouter:

```
DOCKER_USERNAME = votre_username_dockerhub  
DOCKER_PASSWORD = votre_token_dockerhub
SNYK_TOKEN = votre_token_snyk
```

### 2. Environments GitHub
Aller dans Settings > Environments et créer:
- **staging** (aucune protection)
- **production** (avec required reviewers)

### 3. Premier push
```bash
git add .
git commit -m "feat: ajout pipeline CI/CD complet"
git push origin main
```

## Workflows disponibles

### CI - Tests et Sécurité (`ci.yml`)
**Déclencheur**: Push sur main/develop, PR vers main
**Durée**: ~5 minutes
**Jobs**:
- Tests unitaires et intégration
- Scan de sécurité Snyk
- Build frontend
- Vérification collector

### CD - Déploiement (`cd.yml`)  
**Déclencheur**: Push sur main après success du CI
**Durée**: ~3 minutes
**Jobs**:
- Build et push images Docker
- Deploy staging automatique
- Deploy production avec approbation

### Performance (`performance.yml`)
**Déclencheur**: Nightly (2h du matin) ou manuel
**Durée**: ~10 minutes
**Jobs**:
- Tests K6 (smoke, load, stress)
- Génération de rapport performance

### PR Validation (`pr-validation.yml`)
**Déclencheur**: Création/update de PR
**Durée**: ~2 minutes  
**Jobs**:
- Tests rapides
- Détection des changements
- Commentaire automatique sur PR

## Monitoring

### Badges de status
Les badges dans le README se mettent à jour automatiquement:
- ![CI](https://github.com/USERNAME/crypto-platform/actions/workflows/ci.yml/badge.svg)
- ![CD](https://github.com/USERNAME/crypto-platform/actions/workflows/cd.yml/badge.svg)
- ![Performance](https://github.com/USERNAME/crypto-platform/actions/workflows/performance.yml/badge.svg)

### Notifications
- Échec de build → Email GitHub automatique
- Deploy production → Commentaire sur commit
- Tests performance → Artifact avec résultats

## Commandes utiles

```bash
# Forcer un rebuild
git commit --allow-empty -m "trigger: rebuild pipeline"
git push

# Déclencher tests performance manuellement
# Aller dans Actions > Performance Tests > Run workflow

# Voir les logs détaillés
# Aller dans Actions > Choisir le workflow > Voir les jobs
```

## Dépannage

### Build échoue
1. Vérifier les secrets configurés
2. Regarder les logs dans Actions
3. Tests en local: `npm run ci:test`

### Deploy échoue  
1. Vérifier DOCKER_USERNAME/PASSWORD
2. Tester build local: `docker build -t test .`
3. Vérifier les environments GitHub

### Performance tests échouent
1. API démarre-t-elle correctement?
2. Base de données accessible?
3. Tests locaux: `npm run k6:smoke`

## Métriques surveillées

- **Couverture de code**: >80%
- **Temps de build**: <10 minutes total
- **Taux de réussite**: >95% sur 30 derniers builds
- **Performance**: P95 <500ms, 0% erreurs