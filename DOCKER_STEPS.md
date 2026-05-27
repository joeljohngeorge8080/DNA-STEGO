# 🐳 Docker Deployment - Complete Steps

## Overview

Deploy DNA-Stego with Docker in 3 phases:
1. **Test Locally** (5 min) - Verify everything works on your machine
2. **Create Production Config** (5 min) - Prepare for server deployment
3. **Deploy to Server** (10 min) - Launch on DigitalOcean or Hetzner

**Total Time: 15-20 minutes**

---

## PHASE 1: Test Locally (5 minutes)

### Prerequisites
- Docker installed (`docker --version`)
- Docker Compose installed (`docker-compose --version`)
- Git repository cloned

### Steps

#### 1.1 Navigate to project directory
```bash
cd /path/to/dna-stego
```

#### 1.2 Create .env file for development
```bash
cp .env.production .env
```

Edit `.env` and set these values:
```env
ENVIRONMENT=development
DEBUG=true
VITE_API_URL=http://localhost:8000
DATABASE_URL=postgresql://user:password@localhost:5432/dna_stego
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

#### 1.3 Start Docker containers
```bash
docker-compose up --build
```

Wait for output like:
```
backend    | INFO:     Uvicorn running on http://0.0.0.0:8000
frontend   | VITE v7.3.1  ready in 234 ms
```

#### 1.4 Test in browser

**Frontend Test:**
- Open: `http://localhost:5173`
- Should see: DNA Stego landing page

**Backend Test:**
- Open: `http://localhost:8000/health`
- Should see: `{"status": "ok"}`

**API Test:**
```bash
curl -X GET http://localhost:8000/health
# Response: {"status":"ok"}
```

#### 1.5 Stop containers
```bash
# Press Ctrl+C in terminal, then cleanup:
docker-compose down
```

**If all tests pass ✅ → Continue to Phase 2**

---

## PHASE 2: Create Production Configuration (5 minutes)

### 2.1 Create production environment file
```bash
cp .env.production .env.prod
```

Edit `.env.prod` with actual values:
```env
# Environment
ENVIRONMENT=production
DEBUG=false

# Supabase Database (Get from Supabase console)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres

# API Configuration
VITE_API_URL=https://yourdomain.com
VITE_APP_NAME=DNA-Stego
VITE_APP_URL=https://yourdomain.com

# Security (Generate with: openssl rand -hex 32)
SECRET_KEY=your_generated_secret_key_here
JWT_SECRET=your_generated_jwt_secret_here

# CORS (Allow your domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Storage paths
STORAGE_PATH=/app/storage
FASTA_FILES_PATH=/app/storage/fasta_files
TEMP_FILES_PATH=/app/storage/temp

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
LOG_FILE=/app/logs/app.log

# Authentication (Optional)
COGNITO_REGION=us-east-1
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_USER_POOL_ID=your_cognito_user_pool_id

# Optional: AWS S3 for backups
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=dna-stego-backups
```

### 2.2 Create production docker-compose file
```bash
cp docker-compose.yml docker-compose.prod.yml
```

**Edit `docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dna-stego-backend
    ports:
      - "8000:8000"
    env_file:
      - .env.prod
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./storage:/app/storage
      - ./logs:/app/logs
    networks:
      - dna-stego-network
    restart: always
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: dna-stego-frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=${VITE_API_URL}
    networks:
      - dna-stego-network
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  dna-stego-network:
    driver: bridge
```

### 2.3 Generate security keys
```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate JWT_SECRET
openssl rand -hex 32
```

Copy these into `.env.prod`

### 2.4 Verify configuration files exist
```bash
ls -la | grep -E "(Dockerfile|docker-compose|\.env)"
```

Should show:
```
-rw-r--r-- Dockerfile
-rw-r--r-- docker-compose.yml
-rw-r--r-- docker-compose.prod.yml
-rw-r--r-- .env.prod
```

---

## PHASE 3: Deploy to Server (10-15 minutes)

### Prerequisites
- Server running Linux (Ubuntu 20.04+ recommended)
- Domain name (optional but recommended)
- Supabase database created with connection string

### 3.1 Choose a Server Provider

**Recommended: DigitalOcean**
- Cost: $12/month
- CPU: 2 cores
- RAM: 4GB
- Storage: 80GB SSD
- Setup: 5 min
- Region: Global

**OR: Hetzner**
- Cost: €3.99/month (~$6)
- CPU: 2 cores
- RAM: 4GB
- Storage: 40GB SSD
- Setup: 5 min
- Region: Europe

**Create a droplet/instance with:**
- OS: Ubuntu 22.04 LTS
- Size: $12-20/month tier
- SSH key configured

### 3.2 Connect to server
```bash
ssh -i /path/to/private/key root@your_server_ip

# OR with password:
ssh root@your_server_ip
```

### 3.3 Install Docker on server
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker-compose --version
```

### 3.4 Clone repository
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/dna-stego.git
cd dna-stego
```

### 3.5 Copy production environment
```bash
# Create .env.prod on server
nano .env.prod
```

Paste your production environment (from Phase 2):
```env
ENVIRONMENT=production
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
VITE_API_URL=https://yourdomain.com
# ... etc
```

**Save with:** Ctrl+X, then Y, then Enter

### 3.6 Create storage directories
```bash
mkdir -p storage/fasta_files storage/temp
mkdir -p logs
sudo chown -R 1000:1000 storage logs
```

### 3.7 Start containers
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 3.8 Verify containers are running
```bash
docker-compose -f docker-compose.prod.yml ps

# Should show:
# NAME                          STATUS
# dna-stego-backend            Up (healthy)
# dna-stego-frontend           Up (healthy)
```

### 3.9 Check logs
```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

### 3.10 Verify services are accessible
```bash
# Test backend
curl -X GET http://localhost:8000/health

# Test frontend
curl -X GET http://localhost:3000
```

### 3.11 Setup SSL with Let's Encrypt

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**Issue certificate:**
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**Verify certificates:**
```bash
ls -la /etc/letsencrypt/live/yourdomain.com/
```

### 3.12 Configure Nginx reverse proxy

Create `/home/ubuntu/nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.13 Point domain DNS

Go to your domain registrar:
1. Add A record: `@` → Your server IP
2. Add CNAME: `www` → Your domain
3. Wait for DNS to propagate (5-30 min)

**Test DNS:**
```bash
nslookup yourdomain.com
```

### 3.14 Access your application

**Frontend:** https://yourdomain.com
**Backend API:** https://yourdomain.com/api/health

---

## Post-Deployment

### Monitoring
```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View resource usage
docker stats
```

### Backup Database
```bash
# Backup Supabase database
pg_dump postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres > backup.sql

# Or use automated backups (Supabase → Settings → Backups)
```

### Update Application
```bash
cd /home/ubuntu/dna-stego

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### SSL Certificate Renewal
```bash
# Auto-renewal (runs automatically)
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

---

## Troubleshooting

### Port already in use
```bash
# Find what's using port 8000
sudo lsof -i :8000

# Kill the process
sudo kill -9 PID
```

### Database connection error
```bash
# Check DATABASE_URL in .env.prod
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Frontend not loading
```bash
# Check frontend container
docker-compose -f docker-compose.prod.yml logs frontend

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend
```

### Disk space issues
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
```

### Container keeps restarting
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# View restart policy
docker inspect dna-stego-backend | grep -A 5 RestartPolicy
```

---

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Server | $6-20/mo | DigitalOcean/Hetzner |
| Domain | $10-15/yr | GoDaddy, Namecheap, etc |
| Supabase DB | FREE | First 2GB free |
| SSL Cert | FREE | Let's Encrypt |
| **Total** | **~$6-20/mo** | **Including domain** |

---

## Summary

✅ **Phase 1:** Local testing (docker-compose up --build)
✅ **Phase 2:** Production configuration (.env.prod + docker-compose.prod.yml)
✅ **Phase 3:** Server deployment (SSH, Docker, DNS, SSL)

**Your app is now deployed and accessible at: https://yourdomain.com** 🎉

For more details, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
