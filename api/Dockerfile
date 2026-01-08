# ==============================================
# Dockerfile pour l'API Node.js / Express
# ==============================================

# Image de base : Node.js 18 LTS sur Alpine (légère ~50MB)
FROM node:18-alpine

# Métadonnées
LABEL maintainer="crypto-platform"
LABEL description="API REST pour la plateforme crypto"

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances en premier
# (optimise le cache Docker - les dépendances ne changent pas souvent)
COPY package.json package-lock.json ./

# Installer les dépendances de production uniquement
# npm ci est plus rapide et plus fiable que npm install pour CI/CD
RUN npm ci --only=production

# Copier le reste du code source
COPY src/ ./src/

# Créer le dossier logs avec les bonnes permissions
RUN mkdir -p /app/logs && chown -R node:node /app

# Exposer le port sur lequel l'API écoute
EXPOSE 3000

# Définir l'utilisateur non-root pour la sécurité
USER node

# Variable d'environnement par défaut
ENV NODE_ENV=production

# Commande de démarrage de l'application
CMD ["node", "src/server.js"]
