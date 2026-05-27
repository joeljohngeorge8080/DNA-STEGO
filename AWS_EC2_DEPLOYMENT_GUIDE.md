# 🚀 DNA-Stego AWS EC2 Deployment Guide

## Pre-Deployment Checklist

### ✅ Issues Found & Fixed:
1. **Missing `.env.production`** - Created with secure defaults
2. **Frontend missing docker build port exposure** - Fixed frontend Dockerfile
3. **Missing nginx reverse proxy config** - Created for production
4. **No production docker-compose** - Created docker-compose.prod.yml
5. **Missing EC2 deployment script** - Created deploy-to-ec2.sh
6. **CORS hardcoded to \*\*** - Updated for production security
7. **Missing .dockerignore** - Created for optimized builds
8. **Missing health check verification** - Enhanced health endpoints
9. **No SSL/TLS configuration** - Added nginx SSL guide
10. **Missing CloudWatch logging** - Added configuration guide

---

## 📋 Step-by-Step EC2 Deployment

### **Phase 1: AWS EC2 Instance Setup**

```bash
# 1. Launch EC2 Instance
# - AMI: Ubuntu 22.04 LTS (ami-0557a15b87f6559cf)
# - Instance Type: t3.medium (2 vCPU, 4GB RAM) - minimum
# - Storage: 30GB EBS (gp3)
# - Security Groups: 
#   - Inbound: SSH (22), HTTP (80), HTTPS (443)
#   - Outbound: All traffic

# 2. SSH into instance
ssh -i "your-key.pem" ubuntu@your-ec2-instance-ip

# 3. Update system
sudo apt-get update && sudo apt-get upgrade -y
```

### **Phase 2: Install Prerequisites**

```bash
# Install Docker
sudo apt-get install -y docker.io docker-compose git curl wget

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Verify installations
docker --version
docker-compose --version

# Logout and login again for group changes to take effect
exit
ssh -i "your-key.pem" ubuntu@your-ec2-instance-ip
```

### **Phase 3: Clone Project & Configure**

```bash
# Clone repository
git clone <your-repo-url> ~/dna-stego
cd ~/dna-stego

# Copy environment template
cp .env.example .env.production

# Edit production environment
nano .env.production
# Update: SECRET_KEY, JWT_SECRET, API_URL, ENVIRONMENT=production
```

### **Phase 4: Deploy with Docker Compose**

```bash
# Navigate to project
cd ~/dna-stego

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs

# Check health
curl http://localhost:8000/health
curl http://localhost:3000
```

### **Phase 5: Configure Nginx Reverse Proxy (Optional but Recommended)**

```bash
# Install nginx
sudo apt-get install -y nginx

# Copy nginx config
sudo cp nginx-production.conf /etc/nginx/sites-available/dna-stego

# Enable site
sudo ln -s /etc/nginx/sites-available/dna-stego /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### **Phase 6: Setup SSL/TLS with Let's Encrypt**

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d your-domain.com

# Update nginx config to use certificate
sudo certbot install --nginx -d your-domain.com

# Restart nginx
sudo systemctl restart nginx
```

---

## 📊 Recommended EC2 Instance Sizes

| Use Case | Instance Type | vCPU | Memory | Cost/Month |
|----------|---------------|------|--------|-----------|
| Development/Testing | t3.small | 1 | 2 GB | ~$7-10 |
| Small Production | t3.medium | 2 | 4 GB | ~$26-35 |
| Production (Recommended) | t3.large | 2 | 8 GB | ~$60-70 |
| High Traffic | t3.xlarge | 4 | 16 GB | ~$120-140 |

---

## 🔒 Security Best Practices

### 1. **Environment Variables**
```bash
# NEVER commit .env to git
# Always use .env.production on EC2
# Keep SECRET_KEY and JWT_SECRET unique and long
```

### 2. **Security Group Rules**
```bash
# Allow SSH only from your IP
# SSH: 22 from YOUR_IP/32

# Allow HTTP/HTTPS from anywhere (0.0.0.0/0)
# HTTP: 80 from 0.0.0.0/0
# HTTPS: 443 from 0.0.0.0/0

# No outbound restrictions needed
```

### 3. **IAM Roles (Optional)**
Create IAM role for EC2 if using AWS services:
```bash
# For CloudWatch Logs
# For S3 access
# For RDS access
```

### 4. **Enable CloudWatch Monitoring**
```bash
# In AWS Console:
# 1. Enable detailed monitoring
# 2. Create CloudWatch alarms for:
#    - CPU utilization > 80%
#    - Memory usage > 85%
#    - Disk usage > 90%
```

---

## 📡 Domain & DNS Configuration

### Using Route 53 (AWS DNS)
```bash
# In AWS Console:
# 1. Create hosted zone for domain
# 2. Create A record pointing to EC2 public IP
# 3. Wait for DNS propagation (5-30 minutes)
```

### Using External DNS Provider
```bash
# Create A record pointing to EC2 public IP
# Example with Namecheap, GoDaddy, or Google Domains
# A Record: dna-stego.yourdomain.com → EC2_PUBLIC_IP
```

---

## 🔄 Continuous Deployment Setup

### Using GitHub Actions (Automated Deployment)
Create `.github/workflows/deploy-to-ec2.yml`:
```yaml
name: Deploy to EC2
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.EC2_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh -o StrictHostKeyChecking=no ubuntu@${{ secrets.EC2_IP }} 'cd ~/dna-stego && git pull && docker-compose -f docker-compose.prod.yml up -d'
```

---

## 📊 Monitoring & Logs

### View Docker Logs
```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# All logs
docker-compose -f docker-compose.prod.yml logs -f
```

### CloudWatch Integration
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure and start
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :8000
# Kill process
sudo kill -9 <PID>
```

### Container Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Disk Space
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
docker volume prune
```

### Memory Issues
```bash
# Monitor memory
free -h

# Limit container memory in docker-compose.prod.yml
services:
  backend:
    mem_limit: 2g
  frontend:
    mem_limit: 512m
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use AWS Load Balancer (ALB/NLB)
- Deploy multiple EC2 instances
- Use auto-scaling groups
- Share storage with EFS

### Vertical Scaling
- Upgrade to larger instance type (t3.xlarge, c5.2xlarge)
- Increase EBS volume size
- Add more memory/CPU resources

### Database
- Consider RDS for better management
- Use ElastiCache for caching
- Implement backup strategies

---

## 🎯 Next Steps

1. ✅ Review all created files
2. ✅ Update `.env.production` with your values
3. ✅ Test locally with `docker-compose.prod.yml`
4. ✅ Launch EC2 instance
5. ✅ Deploy using step-by-step guide
6. ✅ Configure domain & SSL
7. ✅ Setup monitoring
8. ✅ Create backup strategy

---

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:8000/health`
3. Check Docker status: `docker ps`
4. Review AWS CloudWatch logs

---

**Last Updated:** May 26, 2026
**Status:** ✅ Deployment Ready
