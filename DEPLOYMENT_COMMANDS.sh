#!/bin/bash

# 📋 QUICK COMMAND REFERENCE - DNA-STEGO + SUPABASE + EC2
# Copy and paste these commands as needed

# ═══════════════════════════════════════════════════════════════════════════
# PART 1: GENERATE CREDENTIALS (Run on your local machine)
# ═══════════════════════════════════════════════════════════════════════════

# Generate SECRET_KEY for production
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate JWT_SECRET for production
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"

# ═══════════════════════════════════════════════════════════════════════════
# PART 2: PREPARE ENVIRONMENT (Run on your local machine)
# ═══════════════════════════════════════════════════════════════════════════

# Create .env.production
cp .env.example .env.production

# Edit with your values
nano .env.production

# Don't commit this file
echo ".env.production" >> .gitignore

# ═══════════════════════════════════════════════════════════════════════════
# PART 3: EC2 CONNECTION (Run on your local machine)
# ═══════════════════════════════════════════════════════════════════════════

# Set SSH key permissions
chmod 400 ~/Downloads/dna-stego-prod-key.pem

# Test SSH connection (replace with your EC2 IP)
ssh -i ~/Downloads/dna-stego-prod-key.pem ubuntu@54.123.456.789

# ═══════════════════════════════════════════════════════════════════════════
# PART 4: DEPLOY TO EC2 (Run these commands on EC2 after SSH)
# ═══════════════════════════════════════════════════════════════════════════

# Clone repository
cd ~ && git clone <your-git-repo-url> dna-stego
cd dna-stego

# Add .env.production with Supabase credentials
nano .env.production

# Run automated deployment
bash deploy-to-ec2.sh

# ═══════════════════════════════════════════════════════════════════════════
# PART 5: VERIFICATION (Run on EC2 after deployment)
# ═══════════════════════════════════════════════════════════════════════════

# Run health check
bash health-check-ec2.sh

# Test backend API
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View backend logs only
docker-compose -f docker-compose.prod.yml logs -f backend

# ═══════════════════════════════════════════════════════════════════════════
# PART 6: DATABASE CONNECTION TEST (Run on EC2)
# ═══════════════════════════════════════════════════════════════════════════

# Verify Supabase credentials are set
cat .env.production | grep DATABASE

# Test database connection
nc -zv aws-0-[region].pooler.supabase.com 6543

# ═══════════════════════════════════════════════════════════════════════════
# PART 7: MAINTENANCE COMMANDS (Run on EC2)
# ═══════════════════════════════════════════════════════════════════════════

# View container status
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services again
docker-compose -f docker-compose.prod.yml up -d

# ═══════════════════════════════════════════════════════════════════════════
# PART 8: BACKUP & MONITORING (Run on EC2)
# ═══════════════════════════════════════════════════════════════════════════

# Create manual backup
bash backup.sh

# Setup daily backup (crontab)
crontab -e
# Add: 0 2 * * * cd /home/ubuntu/dna-stego && bash backup.sh

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top -b -n 1 | head -10

# ═══════════════════════════════════════════════════════════════════════════
# PART 9: DOMAIN & SSL SETUP (Run on EC2)
# ═══════════════════════════════════════════════════════════════════════════

# Install certbot
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate from Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com

# List certificates
sudo certbot certificates

# Renew certificate (dry run)
sudo certbot renew --dry-run

# ═══════════════════════════════════════════════════════════════════════════
# PART 10: TROUBLESHOOTING (Run on EC2)
# ═══════════════════════════════════════════════════════════════════════════

# Check if Docker is running
docker --version

# Rebuild and restart everything
docker-compose -f docker-compose.prod.yml down
docker system prune -a
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=50

# Check if ports are open
sudo lsof -i -P -n | grep LISTEN

# Find and kill process on specific port (e.g., 8000)
sudo lsof -i :8000
sudo kill -9 <PID>

# Check network connectivity
ping -c 1 8.8.8.8

# ═══════════════════════════════════════════════════════════════════════════
# QUICK COPY-PASTE SEQUENCES
# ═══════════════════════════════════════════════════════════════════════════

# === SEQUENCE 1: Complete Local Setup ===
# Run all these in order on your local machine:
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
cp .env.example .env.production
nano .env.production
echo ".env.production" >> .gitignore
git add -A && git commit -m "Add production environment setup"

# === SEQUENCE 2: Complete EC2 Deployment ===
# After SSH into EC2, run:
cd ~ && git clone <your-git-repo> dna-stego && cd dna-stego
nano .env.production
bash deploy-to-ec2.sh
sleep 30
bash health-check-ec2.sh

# === SEQUENCE 3: Setup Monitoring ===
# Run on EC2 to enable all monitoring:
crontab -e
# Add these lines:
# 0 */4 * * * cd /home/ubuntu/dna-stego && bash health-check-ec2.sh >> /var/log/health-check.log 2>&1
# 0 2 * * * cd /home/ubuntu/dna-stego && bash backup.sh >> /var/log/backup.log 2>&1

# === SEQUENCE 4: Emergency Restart ===
# If everything breaks, run:
docker-compose -f docker-compose.prod.yml down
docker system prune -a -f
git pull
bash deploy-to-ec2.sh

# ═══════════════════════════════════════════════════════════════════════════
# ENVIRONMENT VARIABLES TEMPLATE
# ═══════════════════════════════════════════════════════════════════════════

# Copy this template to .env.production and fill in YOUR values:

ENVIRONMENT=production
DEBUG=false

# API
VITE_API_URL=https://your-domain.com

# Security (Generate these with Python!)
SECRET_KEY=<your-secret-key-from-python>
JWT_SECRET=<your-jwt-secret-from-python>
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3000

# Supabase Database (Get from Supabase console)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.[project-ref]
DB_PASSWORD=<your-supabase-password>
DB_NAME=postgres
DB_POOL_SIZE=5

# Logging
LOG_LEVEL=INFO

# Optional AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# ═══════════════════════════════════════════════════════════════════════════
# USEFUL ONE-LINERS
# ═══════════════════════════════════════════════════════════════════════════

# Show backend logs with timestamps
docker-compose -f docker-compose.prod.yml logs -f backend --timestamps

# Count lines in logs
docker-compose -f docker-compose.prod.yml logs backend | wc -l

# Search logs for errors
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Check CPU/Memory in real-time
watch -n 1 'docker stats --no-stream'

# Watch health checks run every 5 seconds
watch -n 5 'bash health-check-ec2.sh'

# Size of all backups
du -sh backups/

# Remove old backups (keep last 10)
ls -t backups/*.tar.gz | tail -n +11 | xargs -r rm

# Download backup to local machine (from your local terminal)
scp -i ~/Downloads/dna-stego-prod-key.pem ubuntu@54.123.456.789:~/dna-stego/backups/backup-latest.tar.gz ~/backups/

# ═══════════════════════════════════════════════════════════════════════════
# IMPORTANT REMINDERS
# ═══════════════════════════════════════════════════════════════════════════

# ⚠️  NEVER commit .env.production to git
# ⚠️  NEVER share your SSH key (.pem file)
# ⚠️  NEVER hardcode database passwords
# ⚠️  ALWAYS backup before major changes
# ⚠️  ALWAYS test changes on a staging environment first
# ⚠️  ALWAYS keep SSH key permissions as 400 (chmod 400)
# ⚠️  ALWAYS use HTTPS in production (never HTTP for sensitive data)
# ⚠️  ALWAYS regenerate CORS if changing domain

echo "✅ Commands reference ready! Start with: DEPLOY_WITH_SUPABASE.md"
