#!/bin/bash

# ================================
# DNA-Stego Backup Script
# ================================
# Backs up database and storage

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="dna-stego-backup-$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "Starting backup: $BACKUP_NAME"

# Backup storage
echo "Backing up storage..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}-storage.tar.gz" ./storage

# Backup database
if [ -f "dna_stego.db" ]; then
    echo "Backing up database..."
    cp dna_stego.db "$BACKUP_DIR/${BACKUP_NAME}-db.db"
fi

# Backup environment
echo "Backing up environment..."
cp .env.production "$BACKUP_DIR/${BACKUP_NAME}-env" 2>/dev/null || true

echo "✅ Backup complete: $BACKUP_DIR/$BACKUP_NAME-*"

# Clean old backups (keep last 10)
echo "Cleaning old backups..."
ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +11 | xargs -r rm --

echo "Done!"
