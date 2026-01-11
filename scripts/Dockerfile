FROM postgres:16-alpine

# Installer les outils nécessaires
RUN apk add --no-cache bash dcron

# Créer le dossier de backups
RUN mkdir -p /backups

# Copier les scripts
COPY backup.sh /scripts/backup.sh
COPY restore.sh /scripts/restore.sh
COPY backup-config.sh /scripts/backup-config.sh

# Rendre les scripts exécutables
RUN chmod +x /scripts/*.sh

# Créer le cron job pour backup automatique (tous les jours à minuit)
RUN echo "0 0 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/root

# Script d'entrée
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
