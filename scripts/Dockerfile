FROM alpine:3.19

# Installer les outils nécessaires (client PostgreSQL, bash, cron)
RUN apk add --no-cache bash dcron postgresql16-client

# Créer le dossier de backups et donner les permissions
RUN mkdir -p /backups /scripts /var/log

# Copier les scripts
COPY backup.sh /scripts/backup.sh
COPY restore.sh /scripts/restore.sh
COPY backup-config.sh /scripts/backup-config.sh
COPY entrypoint.sh /entrypoint.sh

# Rendre les scripts exécutables
RUN chmod +x /scripts/*.sh /entrypoint.sh

# Créer le cron job pour backup automatique (tous les jours à minuit)
RUN echo "0 0 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/root && \
    chmod 0644 /etc/crontabs/root

# Crond doit être exécuté en tant que root pour Alpine
ENTRYPOINT ["/entrypoint.sh"]
