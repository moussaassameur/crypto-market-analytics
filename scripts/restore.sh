#!/bin/bash
# =============================================================================
# Script de restauration PostgreSQL - Crypto Platform
# Usage: ./restore.sh <backup_file.sql.gz>
# =============================================================================

set -e

BACKUP_FILE="$1"
BACKUP_DIR="/backups"

# Variables PostgreSQL (depuis docker-compose)
PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-crypto_platform}"
export PGPASSWORD="${PGPASSWORD:-postgres}"

if [ -z "${BACKUP_FILE}" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ${BACKUP_DIR}/crypto_platform_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "=========================================="
echo "Starting PostgreSQL restore at $(date)"
echo "Backup file: ${BACKUP_FILE}"
echo "Database: ${PGDATABASE}"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will overwrite the current database!"
echo "Press Ctrl+C to cancel or wait 5 seconds to continue..."
sleep 5

# Restaurer le backup
echo "Restoring database..."
gunzip -c "${BACKUP_FILE}" | psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}"

echo ""
echo "✅ Database restored successfully!"
echo "=========================================="
echo "Restore completed at $(date)"
echo "=========================================="
