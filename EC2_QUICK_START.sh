#!/bin/bash

# 🚀 DNA-Stego EC2 Quick Reference Card
# Print this or bookmark for quick access during deployment

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                  DNA-STEGO AWS EC2 DEPLOYMENT QUICK START                 ║
║                         🚀 Ready in 3 Steps 🚀                            ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 STEP 1: PREPARE (On Your Local Machine)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  $ cp .env.example .env.production
  $ nano .env.production

  UPDATE THESE VALUES:
    ENVIRONMENT=production
    VITE_API_URL=https://your-domain.com
    SECRET_KEY=<generate-random-string>
    JWT_SECRET=<generate-random-string>
    ALLOWED_ORIGINS=https://your-domain.com

  Generate secure keys:
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️  STEP 2: LAUNCH EC2 INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS CONSOLE:
  1. EC2 > Instances > Launch Instances
  2. Select: Ubuntu 22.04 LTS (ami-0557a15b87f6559cf)
  3. Instance Type: t3.medium (minimum recommended)
  4. Storage: 30GB EBS gp3
  5. Security Group:
     - SSH: Port 22 (Your IP)
     - HTTP: Port 80 (0.0.0.0/0)
     - HTTPS: Port 443 (0.0.0.0/0)
  6. Launch and save key pair

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STEP 3: DEPLOY (SSH into EC2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  $ ssh -i "your-key.pem" ubuntu@EC2_PUBLIC_IP

  # Clone project
  $ git clone <your-repo-url> ~/dna-stego
  $ cd ~/dna-stego

  # Deploy automatically
  $ bash deploy-to-ec2.sh

  # Wait for services to start (2-3 minutes)
  # Check health
  $ bash health-check-ec2.sh

  # View logs
  $ docker-compose -f docker-compose.prod.yml logs -f

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 OPTIONAL: SETUP DOMAIN & SSL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Point domain A record to EC2 public IP
  2. Install certbot:
     $ sudo apt-get install -y certbot python3-certbot-nginx

  3. Get certificate:
     $ sudo certbot certonly --standalone -d your-domain.com

  4. Update nginx config (see nginx-production.conf)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆘 TROUBLESHOOTING QUICK FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PROBLEM: Containers not starting
  $ docker-compose -f docker-compose.prod.yml down
  $ docker-compose -f docker-compose.prod.yml build --no-cache
  $ docker-compose -f docker-compose.prod.yml up -d

  PROBLEM: Port already in use
  $ sudo lsof -i :8000
  $ sudo kill -9 <PID>

  PROBLEM: Check logs
  $ docker-compose -f docker-compose.prod.yml logs -f backend
  $ docker-compose -f docker-compose.prod.yml logs -f frontend

  PROBLEM: Health check failing
  $ curl http://localhost:8000/health
  $ bash health-check-ec2.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 USEFUL COMMANDS (SSH into EC2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  View all logs:
  $ docker-compose -f docker-compose.prod.yml logs -f

  View specific service:
  $ docker-compose -f docker-compose.prod.yml logs -f backend

  Check service status:
  $ docker-compose -f docker-compose.prod.yml ps

  Restart services:
  $ docker-compose -f docker-compose.prod.yml restart

  Stop services:
  $ docker-compose -f docker-compose.prod.yml down

  Create backup:
  $ bash backup.sh

  Health check:
  $ bash health-check-ec2.sh

  Check disk space:
  $ df -h

  Check memory:
  $ free -h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  After deployment:
  ✓ Backend responding: curl http://localhost:8000/health
  ✓ Frontend responding: curl http://localhost:3000
  ✓ All containers running: docker ps -a
  ✓ Storage accessible: ls -la storage/
  ✓ Logs available: docker logs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 DOCUMENTATION FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  AWS_EC2_DEPLOYMENT_GUIDE.md
  └─ Complete step-by-step guide (60+ pages)

  EC2_DEPLOYMENT_CHECKLIST.md
  └─ Verification checklist and resources

  DEPLOYMENT_READY_SUMMARY.md
  └─ What was configured and why

  README.md
  └─ Project overview and features

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 COST ESTIMATION (AWS Free Tier eligible)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  t3.medium (recommended):    $26-35/month
  EBS 30GB gp3:              $2-3/month
  Data transfer out:         $0.09/GB
  ────────────────────────────────────
  TOTAL (minimal):           $28-40/month ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 SECURITY REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. NEVER commit .env.production to git
  2. Generate new SECRET_KEY and JWT_SECRET for production
  3. SSH key permissions: chmod 400 your-key.pem
  4. Security group: SSH from YOUR IP only
  5. Keep key pair (.pem) safe and backed up
  6. Enable MFA on AWS account
  7. Use different secrets for each environment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    ✅ STATUS: DEPLOYMENT READY
                    Generated: May 26, 2026
                    Version: 2.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
