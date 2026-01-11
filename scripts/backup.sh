#!/bin/bash
# =============================================================================
# Script de backup automatique PostgreSQL - Crypto Platform
# =============================================================================

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/crypto_platform_backup_${DATE}.sql.gz"
RETENTION_DAYS=7

# Variables PostgreSQL (depuis docker-compose)
PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-crypto_platform}"
export PGPASSWORD="${PGPASSWORD:-postgres}"

# Créer le dossier de backup s'il n'existe pas
mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo "Starting PostgreSQL backup at $(date)"
echo "Database: ${PGDATABASE}"
echo "=========================================="

# Effectuer le backup avec compression
pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" | gzip > "${BACKUP_FILE}"

# Vérifier si le backup a réussi
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
    echo " Backup created successfully: ${BACKUP_FILE}"
    echo "   Size: ${BACKUP_SIZE}"
else
    echo " Backup failed!"
    exit 1
fi

# Supprimer les anciens backups (rétention de 7 jours)
echo ""
echo "Cleaning old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "crypto_platform_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

# Lister les backups existants
echo ""
echo "Current backups:"
ls -lh "${BACKUP_DIR}"/crypto_platform_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo "=========================================="
echo "Backup completed at $(date)"
echo "=========================================="
