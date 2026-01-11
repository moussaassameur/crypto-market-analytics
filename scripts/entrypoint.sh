#!/bin/bash
# =============================================================================
# Entrypoint pour le conteneur de backup
# =============================================================================

echo "=========================================="
echo "Crypto Platform Backup Service"
echo "=========================================="
echo ""
echo "Backup schedule: Daily at midnight (0:00)"
echo "Retention: 7 days"
echo ""
echo "Manual commands:"
echo "  - Backup now:  docker exec crypto-backup /scripts/backup.sh"
echo "  - Restore:     docker exec crypto-backup /scripts/restore.sh <backup_file>"
echo "  - List backups: docker exec crypto-backup ls -la /backups"
echo ""
echo "=========================================="

# Exécuter un premier backup au démarrage
echo "Running initial backup..."
/scripts/backup.sh

# Démarrer le cron daemon
echo "Starting cron daemon..."
crond -f -l 2
