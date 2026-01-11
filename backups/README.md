# Backups Directory
Ce dossier contient les sauvegardes automatiques de la base de données.

## Structure
- `crypto_platform_backup_*.sql.gz` - Backups de la base de données PostgreSQL
- `configs/` - Backups des fichiers de configuration

## Commandes utiles

### Lancer un backup manuel
```bash
docker exec crypto-backup /scripts/backup.sh
```

### Restaurer un backup
```bash
docker exec crypto-backup /scripts/restore.sh /backups/crypto_platform_backup_YYYY-MM-DD_HH-MM-SS.sql.gz
```

### Lister les backups disponibles
```bash
docker exec crypto-backup ls -la /backups
```

## Rétention
- Les backups de base de données sont conservés pendant **7 jours**
- Les backups de configuration sont conservés pendant **30 jours**

## Planification
- Backup automatique: **tous les jours à minuit (0h00)**
