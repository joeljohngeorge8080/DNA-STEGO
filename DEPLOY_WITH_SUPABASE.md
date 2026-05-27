# 🚀 Deploy DNA-Stego to AWS EC2 with Supabase Database

**Complete Step-by-Step Guide**  
**Time Required:** 45-60 minutes  
**Cost:** ~$30-40/month (EC2) + Supabase free tier

---

## 📋 **Pre-Deployment Checklist**

Before you start, make sure you have:
- [ ] AWS account with billing enabled
- [ ] Supabase account (free at https://supabase.com)
- [ ] Git repository with your code
- [ ] SSH client (built-in on Mac/Linux, PuTTY on Windows)
- [ ] A domain name (optional, can use EC2 IP initially)

---

## **PHASE 1: SUPABASE SETUP** ⏱️ ~10 minutes

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New project"**
3. Fill in:
   - **Project name:** `dna-stego`
   - **Database password:** Generate a strong password (save it!)
   - **Region:** Select closest to your EC2 region (US-East-1 = Virginia)
4. Click **"Create new project"**
5. Wait 2-3 minutes for database to initialize

### Step 1.2: Get Supabase Connection Credentials

Once your project is ready:

1. Go to **Settings** → **Database** (left sidebar)
2. Look for **Connection String** section
3. You should see:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. **Copy and save these values separately:**
   - **Database URL:** (the full connection string above)
   - **DB Host:** `aws-0-[region].pooler.supabase.com`
   - **DB Port:** `6543`
   - **DB User:** `postgres.[project-ref]`
   - **DB Password:** (the one you created)
   - **DB Name:** `postgres`

### Step 1.3: Create Database Tables (if needed)

In Supabase editor (SQL):
1. Click **"SQL Editor"** → **"New query"**
2. Create your tables here (if your app needs them)

Example for DNA-Stego:
```sql
-- If you're storing encoding history
CREATE TABLE encoding_history (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  dna_sequence TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **PHASE 2: PREPARE YOUR PROJECT LOCALLY** ⏱️ ~5 minutes

### Step 2.1: Update Environment Configuration

1. Open your project root directory
2. Open/create `.env.production` file
3. Add these Supabase variables:

```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# API Configuration
VITE_API_URL=https://your-domain.com
# OR if using EC2 IP:
# VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:8000

# Security (CRITICAL - Generate these!)
SECRET_KEY=<generate-random-32-chars>
JWT_SECRET=<generate-random-32-chars>
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3000

# Database - SUPABASE
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.[project-ref]
DB_PASSWORD=<your-supabase-password>
DB_NAME=postgres
DB_POOL_SIZE=5

# Optional AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Logging
LOG_LEVEL=INFO
```

### Step 2.2: Generate Secure Keys

Open terminal and run:

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate JWT_SECRET
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste into `.env.production` for `SECRET_KEY` and `JWT_SECRET`.

### Step 2.3: Update Your Backend Code (if using database)

Update `app/main.py` or `app/api/routes.py` to use Supabase:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Connect to Supabase
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    DATABASE_URL,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=10,
    pool_pre_ping=True  # Verify connection before using
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Step 2.4: Commit Your Changes

```bash
# Don't commit .env.production!
echo ".env.production" >> .gitignore

# Commit other changes
git add -A
git commit -m "Add Supabase configuration"
git push
```

---

## **PHASE 3: LAUNCH AWS EC2 INSTANCE** ⏱️ ~15 minutes

### Step 3.1: Create EC2 Instance

1. Go to **AWS Console** → **EC2** → **Instances**
2. Click **"Launch Instances"**

### Step 3.2: Configure Instance

**1. Select AMI (Image):**
   - Search for: `Ubuntu 22.04 LTS`
   - Select: `ami-0557a15b87f6559cf` (or latest Ubuntu 22.04)

**2. Instance Type:**
   - Select: **t3.medium** (recommended for production)
   - Or t3.small for minimal ($14/month)

**3. Network Settings:**
   - VPC: Default (unless you need custom VPC)
   - Subnet: Any available
   - Auto-assign public IP: **Enable**

**4. Security Group (NEW):**
   Create new security group: `dna-stego-prod`
   
   Add these rules:
   ```
   Type              Protocol  Port Range  Source
   ───────────────────────────────────────────────
   SSH               TCP       22         Your IP/0.0.0.0/0
   HTTP              TCP       80         0.0.0.0/0
   HTTPS             TCP       443        0.0.0.0/0
   Custom TCP        TCP       8000       0.0.0.0/0 (optional, for debugging)
   ```

**5. Storage:**
   - Size: **30 GB** (gp3 recommended)
   - Delete on termination: Check

**6. Advanced Details:**
   - Monitoring: Enable detailed CloudWatch monitoring (optional)

### Step 3.3: Create Key Pair

1. Still in launch dialog, scroll to **Key pair**
2. Click **"Create new key pair"**
3. Name: `dna-stego-prod-key`
4. Type: **RSA**
5. Format: **PEM** (for Mac/Linux) or **PPK** (for PuTTY on Windows)
6. Click **"Create key pair"**
   - Save the `.pem` file to your computer
   - **DO NOT lose this file!**

### Step 3.4: Launch Instance

1. Click **"Launch Instances"**
2. Wait for instance to reach **"Running"** state (2-3 minutes)
3. Copy your **Public IPv4 address** (you'll need this)

```
Example: 54.123.456.789
```

---

## **PHASE 4: PREPARE SSH CONNECTION** ⏱️ ~5 minutes

### Step 4.1: Set Permissions on Your Key

**On Mac/Linux:**
```bash
chmod 400 ~/Downloads/dna-stego-prod-key.pem
```

**On Windows (PowerShell):**
```powershell
icacls C:\Users\YourUser\Downloads\dna-stego-prod-key.pem /inheritance:r /grant:r "%USERNAME%:F"
```

### Step 4.2: Test SSH Connection

Replace `54.123.456.789` with your actual EC2 public IP:

```bash
ssh -i ~/Downloads/dna-stego-prod-key.pem ubuntu@54.123.456.789
```

**Expected output:**
```
The authenticity of host '54.123.456.789' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

Type **`yes`** and press Enter.

You should now see:
```
ubuntu@ip-172-31-xx-xxx:~$
```

✅ **Success!** You're connected to your EC2 instance.

---

## **PHASE 5: DEPLOY TO EC2** ⏱️ ~10-15 minutes

### Step 5.1: Clone Your Repository

Still SSH'd into EC2, run:

```bash
# Navigate to home
cd ~

# Clone your repository
git clone <your-git-repo-url> dna-stego
cd dna-stego

# Verify deployment scripts exist
ls -la *.sh
```

Expected output:
```
-rwxr-xr-x deploy-to-ec2.sh
-rwxr-xr-x health-check-ec2.sh
-rwxr-xr-x backup.sh
```

### Step 5.2: Add Supabase Credentials to EC2

```bash
# Create .env.production on EC2
nano .env.production
```

Paste your complete `.env.production` file from Phase 2. When done:
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

### Step 5.3: Run Automated Deployment

```bash
bash deploy-to-ec2.sh
```

**What this script does:**
1. ✅ Checks prerequisites (Docker, git, etc.)
2. ✅ Installs Docker & Docker Compose (if not present)
3. ✅ Pulls latest code
4. ✅ Builds Docker images
5. ✅ Starts containers (frontend + backend)
6. ✅ Verifies health

**Expected output:**
```
✓ Checking prerequisites
✓ Installing Docker
✓ Building backend image
✓ Building frontend image
✓ Starting services
✓ Waiting for services to start
✓ Checking health...
Backend: Running ✓
Frontend: Running ✓
```

⏱️ **Deployment takes 5-10 minutes. Be patient!**

### Step 5.4: Verify Deployment

After deployment completes:

```bash
# Run health check
bash health-check-ec2.sh
```

**Expected output:**
```
═══════════════════════════════════════════
      ✅ DNA-STEGO HEALTH CHECK
═══════════════════════════════════════════

Backend (Port 8000):
  └─ Status: ✅ RUNNING
  └─ Health: 200 OK
  └─ Response Time: 45ms

Frontend (Port 3000):
  └─ Status: ✅ RUNNING
  └─ Health: 200 OK

Storage:
  └─ Status: ✅ ACCESSIBLE
  └─ Disk Free: 28GB

Docker Containers:
  └─ Status: ✅ ALL RUNNING
  └─ Memory: 850MB / 3.7GB
  └─ CPU: 2.3%

═══════════════════════════════════════════
     ✅ ALL SYSTEMS OPERATIONAL
═══════════════════════════════════════════
```

✅ **Deployment successful!**

---

## **PHASE 6: VERIFY YOUR APPLICATION** ⏱️ ~5 minutes

### Step 6.1: Test Backend API

Replace `54.123.456.789` with your EC2 IP:

```bash
# Test backend
curl http://54.123.456.789:8000/health

# Expected response:
# {"status":"healthy","timestamp":"2026-05-26T12:00:00Z"}
```

### Step 6.2: Access Frontend

Open browser and go to:
```
http://54.123.456.789:3000
```

You should see your DNA-Stego application loading!

### Step 6.3: Test Database Connection

In your app, trigger a database operation (if you have one). Check logs:

```bash
# View backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Look for Supabase connection confirmation
```

---

## **PHASE 7: SETUP DOMAIN & SSL (OPTIONAL BUT RECOMMENDED)** ⏱️ ~15 minutes

### Step 7.1: Point Domain to EC2

If you have a domain:

1. Go to your **DNS provider** (GoDaddy, Namecheap, Route 53, etc.)
2. Find **DNS Management** or **DNS Records**
3. Create **A Record:**
   ```
   Type:  A
   Name:  @ (or www)
   Value: 54.123.456.789 (your EC2 public IP)
   TTL:   3600
   ```
4. Save and wait 5-15 minutes for DNS to propagate

### Step 7.2: Setup SSL Certificate

SSH into EC2 again:

```bash
# Update system
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Follow prompts and enter your email
```

Certificate will be saved to:
```
/etc/letsencrypt/live/your-domain.com/
```

### Step 7.3: Configure Nginx with SSL

Update nginx config and restart:

```bash
# Edit nginx config
sudo nano /etc/nginx/nginx-production.conf

# Update certificate paths:
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

# Reload nginx
sudo systemctl reload nginx
```

### Step 7.4: Update Environment Variables

```bash
# Edit .env.production
nano .env.production

# Update:
VITE_API_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com

# Restart containers
docker-compose -f docker-compose.prod.yml restart
```

---

## **PHASE 8: BACKUP & MAINTENANCE** ⏱️ ~5 minutes

### Step 8.1: Setup Automatic Backups

```bash
# Create backup
bash backup.sh

# Expected output:
# Backup created: /home/ubuntu/dna-stego/backups/backup-2026-05-26-120000.tar.gz

# Setup cron job for daily backups
crontab -e

# Add this line (backup at 2 AM daily):
0 2 * * * cd /home/ubuntu/dna-stego && bash backup.sh
```

### Step 8.2: Supabase Backups

In Supabase console:
1. Go to **Settings** → **Backups**
2. Enable **Auto backups** (free tier: 7-day retention)
3. Set backup frequency to **Daily**

---

## **PHASE 9: MONITOR YOUR DEPLOYMENT** ⏱️ Ongoing

### Step 9.1: View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Backend only
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend only
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Step 9.2: Check System Health

```bash
# Every 4 hours (add to crontab)
0 */4 * * * cd /home/ubuntu/dna-stego && bash health-check-ec2.sh

# Manual check
bash health-check-ec2.sh
```

### Step 9.3: AWS CloudWatch Monitoring (Optional)

1. Go to **CloudWatch** → **Dashboards**
2. Create new dashboard
3. Add metrics:
   - EC2 CPU Usage
   - EC2 Network In/Out
   - Memory Usage (requires agent)

---

## **QUICK REFERENCE: Common Commands**

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Rebuild Services
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Check Disk Space
```bash
df -h
```

### Check Memory Usage
```bash
free -h
```

### Check Running Containers
```bash
docker ps -a
```

### View Database Connection
```bash
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

---

## **TROUBLESHOOTING**

### Problem: "Connection refused" when accessing application

**Solution:**
```bash
# Check if containers are running
docker ps -a

# If not running, start them
docker-compose -f docker-compose.prod.yml up -d

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Verify Supabase credentials in .env.production
cat .env.production | grep DATABASE

# Test connection
nc -zv aws-0-[region].pooler.supabase.com 6543

# Check if firewall allows outbound connections
sudo ufw status
```

### Problem: "Cannot resolve domain"

**Solution:**
```bash
# Check DNS propagation
nslookup your-domain.com

# May take 5-15 minutes after setting DNS record

# Meanwhile, use EC2 IP:
http://54.123.456.789:3000
```

### Problem: SSL certificate errors

**Solution:**
```bash
# Renew certificate
sudo certbot renew --dry-run

# If test passes, renew for real
sudo certbot renew

# Check certificate expiration
sudo certbot certificates
```

### Problem: Out of disk space

**Solution:**
```bash
# Check space
df -h

# Clean Docker
docker system prune -a

# Remove old backups
rm -rf backups/backup-2026-04-*.tar.gz
```

---

## **COST BREAKDOWN**

| Component | Price | Notes |
|-----------|-------|-------|
| EC2 t3.medium | $26/mo | 2 vCPU, 4GB RAM |
| EBS 30GB gp3 | $3/mo | Storage |
| Data transfer | $0.09/GB | Outbound only |
| Supabase | FREE | Free tier (2GB database) |
| **TOTAL** | **$29-35/mo** | With minimal traffic |

---

## **POST-DEPLOYMENT CHECKLIST**

- [ ] Application loads at http://EC2_IP:3000
- [ ] Backend responds at http://EC2_IP:8000/health
- [ ] Supabase connection verified in logs
- [ ] Domain pointing to EC2 IP (if using domain)
- [ ] SSL certificate installed (if using domain)
- [ ] Backup script running automatically
- [ ] Health checks configured
- [ ] Logs being collected
- [ ] Monitoring dashboard setup (optional)
- [ ] Database backups enabled in Supabase

---

## **YOU'RE LIVE! 🎉**

Your DNA-Stego application is now running on AWS EC2 with Supabase database!

### Next Steps:
1. Monitor logs for any issues
2. Test all features thoroughly
3. Set up alerting (CloudWatch)
4. Plan scaling (if needed)
5. Schedule regular backups

### Questions?
Refer to:
- [AWS_EC2_DEPLOYMENT_GUIDE.md](AWS_EC2_DEPLOYMENT_GUIDE.md) - Detailed troubleshooting
- [EC2_DEPLOYMENT_CHECKLIST.md](EC2_DEPLOYMENT_CHECKLIST.md) - Verification checklist
- [Supabase Docs](https://supabase.com/docs)
