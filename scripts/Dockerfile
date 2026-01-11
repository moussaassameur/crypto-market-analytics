FROM alpine:3.19

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 backupgroup && \
    adduser -u 1001 -G backupgroup -D backupuser

# Installer les outils nécessaires (client PostgreSQL, bash, cron)
RUN apk add --no-cache bash dcron postgresql16-client

# Créer le dossier de backups et donner les permissions
RUN mkdir -p /backups /scripts /var/log && \
    chown -R backupuser:backupgroup /backups /scripts /var/log

# Copier les scripts (lecture + exécution uniquement, pas d'écriture)
COPY --chmod=555 --chown=backupuser:backupgroup backup.sh /scripts/backup.sh
COPY --chmod=555 --chown=backupuser:backupgroup restore.sh /scripts/restore.sh
COPY --chmod=555 --chown=backupuser:backupgroup backup-config.sh /scripts/backup-config.sh

# Créer le cron job pour backup automatique (tous les jours à minuit)
RUN echo "0 0 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/backupuser

# Script d'entrée (lecture + exécution uniquement, pas d'écriture)
COPY --chmod=555 --chown=backupuser:backupgroup entrypoint.sh /entrypoint.sh

# Utiliser l'utilisateur non-root
USER backupuser

ENTRYPOINT ["/entrypoint.sh"]
