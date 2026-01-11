#!/bin/bash
# =============================================================================
# Script de backup des configurations - Crypto Platform
# Sauvegarde les fichiers de configuration importants
# =============================================================================

set -e

# Configuration
BACKUP_DIR="/backups/configs"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
CONFIG_BACKUP="${BACKUP_DIR}/config_backup_${DATE}.tar.gz"
RETENTION_DAYS=30

# Créer le dossier de backup s'il n'existe pas
mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo "Starting configuration backup at $(date)"
echo "=========================================="

# Fichiers de configuration à sauvegarder
CONFIG_FILES=(
    "/app/docker-compose.yml"
    "/app/.env"
    "/app/api/.env"
    "/app/cryptoFront/.env"
    "/app/collector/.env"
)

# Créer un dossier temporaire
TEMP_DIR=$(mktemp -d)
mkdir -p "${TEMP_DIR}/configs"

# Copier les fichiers de configuration existants
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "${file}" ]; then
        cp "${file}" "${TEMP_DIR}/configs/" 2>/dev/null || true
        echo "  Backed up: ${file}"
    fi
done

# Créer l'archive
tar -czf "${CONFIG_BACKUP}" -C "${TEMP_DIR}" configs

# Nettoyer le dossier temporaire
rm -rf "${TEMP_DIR}"

# Vérifier si le backup a réussi
if [ -f "${CONFIG_BACKUP}" ] && [ -s "${CONFIG_BACKUP}" ]; then
    BACKUP_SIZE=$(ls -lh "${CONFIG_BACKUP}" | awk '{print $5}')
    echo ""
    echo "✅ Config backup created: ${CONFIG_BACKUP}"
    echo "   Size: ${BACKUP_SIZE}"
else
    echo "❌ Config backup failed!"
    exit 1
fi

# Supprimer les anciens backups
echo ""
echo "Cleaning old config backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "config_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

echo ""
echo "=========================================="
echo "Config backup completed at $(date)"
echo "=========================================="
