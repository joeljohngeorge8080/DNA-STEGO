# 🐳 Deploy DNA-Stego with Docker + Supabase

**Complete Docker Deployment Guide**  
**Time Required:** 15-20 minutes  
**Cost:** FREE (self-hosted on any machine)

---

## 📋 **Pre-Deployment Checklist**

Before you start:
- [ ] Docker installed (https://docs.docker.com/get-docker/)
- [ ] Docker Compose installed (usually included with Docker)
- [ ] Supabase account with database credentials
- [ ] Your domain name (optional, can use IP)
- [ ] Git repository pushed to GitHub

---

## **PHASE 1: LOCAL TESTING WITH DOCKER** ⏱️ ~5 minutes

### Step 1.1: Create Development Environment

```bash
# Clone your repository
git clone <your-repo-url> dna-stego
cd dna-stego

# Create .env file for development
cp .env.production .env
```

### Step 1.2: Run Locally with Docker Compose

```bash
# Build and start containers
docker-compose up --build

# Expected output:
# backend    | INFO:     Uvicorn running on http://0.0.0.0:8000
# frontend   | VITE v7.3.1  ready in 234 ms
```

### Step 1.3: Test Application

Open in browser:
- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:8000/health

Both should be accessible and working! ✅

### Step 1.4: Stop Docker

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## **PHASE 2: PREPARE FOR PRODUCTION** ⏱️ ~5 minutes

### Step 2.1: Create Production Environment

```bash
# Copy production template
cp .env.production .env.prod

# Edit with your Supabase credentials
nano .env.prod

# Update these values:
VITE_API_URL=https://yourdomain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
DATABASE_URL=postgresql://postgres:password@host/postgres
SECRET_KEY=<generate-with-python>
JWT_SECRET=<generate-with-jwt>
```

Generate secrets:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2.2: Create Production Docker Compose

```bash
# Copy production docker-compose
cp docker-compose.yml docker-compose.prod.yml
```

Update `docker-compose.prod.yml`:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dna-stego-backend
    ports:
      - "8000:8000"
    volumes:
      - ./storage:/app/storage
      - ./logs:/app/logs
    env_file:
      - .env.prod
    environment:
      - ENVIRONMENT=production
    networks:
      - dna-stego-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: dna-stego-frontend
    ports:
      - "3000:3000"
    env_file:
      - .env.prod
    networks:
      - dna-stego-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: dna-stego-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-production.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend
      - frontend
    networks:
      - dna-stego-network
    restart: always

networks:
  dna-stego-network:
    driver: bridge
```

### Step 2.3: Create Nginx Config

Create `nginx-production.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Frontend upstream
    upstream frontend {
        server dna-stego-frontend:3000;
    }

    # Backend upstream
    upstream backend {
        server dna-stego-backend:8000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates (configure with Let's Encrypt)
        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 300s;
        }

        # Backend health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

---

## **PHASE 3: DEPLOY TO SERVER** ⏱️ ~10 minutes

### Step 3.1: Push to GitHub

```bash
# Add and commit
git add .env.prod docker-compose.prod.yml nginx-production.conf
git commit -m "Add Docker production configuration"
git push origin main
```

### Step 3.2: SSH to Your Server

```bash
# SSH into your server (EC2, DigitalOcean, Linode, etc.)
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3.3: Clone Repository

```bash
# Clone your repository
git clone <your-repo-url> ~/dna-stego
cd ~/dna-stego

# Checkout production branch (if you have one)
git checkout main
```

### Step 3.4: Add Environment Variables

```bash
# Create .env.prod with your Supabase credentials
nano .env.prod

# Add these (copy from your Supabase project):
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
DATABASE_URL=postgresql://postgres:password@host/postgres
SECRET_KEY=<generate-new>
JWT_SECRET=<generate-new>
VITE_API_URL=https://yourdomain.com
```

### Step 3.5: Build and Run

```bash
# Build images
sudo docker-compose -f docker-compose.prod.yml build

# Start containers
sudo docker-compose -f docker-compose.prod.yml up -d

# Check status
sudo docker-compose -f docker-compose.prod.yml ps

# View logs
sudo docker-compose -f docker-compose.prod.yml logs -f
```

### Step 3.6: Setup SSL Certificate

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate (install certbot first)
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf with certificate paths
sudo nano nginx-production.conf
# Update paths to:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Copy certificates to Docker volume (create certs directory)
sudo mkdir -p certs
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem certs/
sudo chown -R $(id -u):$(id -g) certs

# Restart nginx
sudo docker-compose -f docker-compose.prod.yml restart nginx
```

---

## **QUICK COMMAND REFERENCE**

### Development (Local)
```bash
# Start development
docker-compose up --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production (Server)
```bash
# Build production images
sudo docker-compose -f docker-compose.prod.yml build

# Start production
sudo docker-compose -f docker-compose.prod.yml up -d

# View logs
sudo docker-compose -f docker-compose.prod.yml logs -f backend
sudo docker-compose -f docker-compose.prod.yml logs -f frontend

# Stop gracefully
sudo docker-compose -f docker-compose.prod.yml stop

# Restart
sudo docker-compose -f docker-compose.prod.yml restart

# Update (after git pull)
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

### Monitoring
```bash
# Check container status
sudo docker-compose -f docker-compose.prod.yml ps

# Check resource usage
sudo docker stats

# View application logs
sudo docker-compose -f docker-compose.prod.yml logs --tail 50 backend

# SSH into container
sudo docker-compose -f docker-compose.prod.yml exec backend bash

# Backup database
docker-compose -f docker-compose.prod.yml exec backend pg_dump -h $DATABASE_HOST -U postgres > backup.sql
```

---

## **TROUBLESHOOTING**

### Problem: "Address already in use"
```bash
# Kill process on port
sudo lsof -i :8000
sudo kill -9 <PID>

# Or change port in docker-compose
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

### Problem: "Connection refused" to database
```bash
# Check if DATABASE_URL is set
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE

# Test connection manually
docker-compose -f docker-compose.prod.yml exec backend python3 -c "import psycopg2; print('✅ DB Connected')"
```

### Problem: "Frontend not connecting to API"
```bash
# Check VITE_API_URL is correct
docker-compose -f docker-compose.prod.yml exec frontend env | grep VITE_API_URL

# Verify nginx routing
sudo docker exec dna-stego-nginx curl http://dna-stego-backend:8000/health
```

### Problem: "Out of disk space"
```bash
# Clean up Docker
sudo docker system prune -a --volumes

# Check disk usage
df -h
```

---

## **DEPLOYMENT CHECKLIST**

- [ ] Docker installed on server
- [ ] Git repository cloned
- [ ] .env.prod created with Supabase credentials
- [ ] docker-compose.prod.yml configured
- [ ] nginx-production.conf configured
- [ ] SSL certificates installed
- [ ] Containers started successfully
- [ ] Health checks passing
- [ ] Frontend accessible at https://yourdomain.com
- [ ] Backend API responding at /health
- [ ] Database connection verified
- [ ] Logs being collected
- [ ] Backup strategy implemented

---

## **SCALING DOCKER DEPLOYMENT**

### Add Load Balancer
```yaml
# Use Docker load balancer (HAProxy)
services:
  haproxy:
    image: haproxy:2.4-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    depends_on:
      - backend
      - frontend
```

### Run Multiple Backend Instances
```bash
# Scale backend to 3 instances
sudo docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Nginx will load balance automatically
```

### Monitor with Portainer
```bash
# Optional: Deploy Portainer for Docker management
sudo docker run -d \
  -p 8080:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  portainer/portainer-ce:latest
```

Access at https://server-ip:9443

---

## **BACKUP & RECOVERY**

### Backup Database
```bash
# Backup to file
docker-compose -f docker-compose.prod.yml exec backend \
  pg_dump -h $DB_HOST -U postgres > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_*.sql
```

### Restore Database
```bash
# Restore from file
cat backup.sql.gz | gunzip | \
  docker-compose -f docker-compose.prod.yml exec -T backend \
  psql -h $DB_HOST -U postgres
```

### Backup Volumes
```bash
# Backup storage
tar -czf storage_backup.tar.gz storage/

# Restore
tar -xzf storage_backup.tar.gz
```

---

## **COST COMPARISON**

| Provider | Instance | Cost |
|----------|----------|------|
| AWS EC2 | t3.medium | $26/month |
| DigitalOcean | Standard | $12/month |
| Linode | 4GB | $20/month |
| Vultr | 2GB | $6/month |
| Hetzner | cx21 | $6/month |

---

## **YOU'RE LIVE! 🎉**

Your DNA-Stego application is now running on Docker!

### Status
- **Frontend:** https://yourdomain.com
- **Backend API:** https://yourdomain.com/api/
- **Health:** https://yourdomain.com/health

### Next Steps
1. Monitor logs regularly
2. Setup automated backups
3. Configure log rotation
4. Setup monitoring alerts
5. Plan scaling strategy

---

**Questions?** Check Docker docs: https://docs.docker.com/
