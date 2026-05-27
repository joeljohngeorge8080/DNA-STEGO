# 🚀 Quick Start Guide - DNA-Stego

## 📦 One-Command Setup

```bash
# Clone or download the project, then run:
./setup.sh
```

That's it! The script handles everything automatically.

---

## 📋 What the Setup Script Does

### Automated Tasks (18 Steps):

1. ✅ **Prerequisites Check** - Installs Docker, Docker Compose, Python3, Node.js
2. ✅ **Project Structure** - Creates all necessary directories
3. ✅ **Configuration** - Generates secure .env file with encryption keys
4. ✅ **Port Validation** - Checks if ports 8000 and 5173 are available
5. ✅ **Dependencies** - Installs Python packages and Node modules
6. ✅ **Code Quality** - Formats code with Black and ESLint
7. ✅ **Testing** - Runs all unit tests
8. ✅ **Docker Build** - Builds optimized production images
9. ✅ **Storage Init** - Sets up file storage with sample data
10. ✅ **Service Start** - Launches all containers
11. ✅ **Health Checks** - Verifies all services are running
12. ✅ **Documentation** - Generates API docs
13. ✅ **Backup Script** - Creates automated backup system
14. ✅ **Security Scan** - Checks for vulnerabilities
15. ✅ **Final Validation** - Ensures everything works
16. ✅ **Cleanup** - Removes temporary files
17. ✅ **Logging** - Saves setup log for debugging
18. ✅ **Browser Launch** - Opens application (optional)

---

## ⚡ Manual Setup (Alternative)

If you prefer manual control:

### 1. Copy Project Files

```bash
./copy-project.sh
cd your-project-directory
```

### 2. Install Prerequisites

```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and update SECRET_KEY
```

### 4. Build and Run

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 🎯 Quick Commands

```bash
# Start everything
make dev

# View logs
make logs

# Run tests
make test

# Stop services
make down

# Create backup
./backup.sh

# Deploy to production
./deploy.sh production
```

---

## 🌐 Access Points

After setup completes:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main UI |
| Backend | http://localhost:8000 | API Server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Alternative Docs |
| Health Check | http://localhost:8000/health | Status |

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :8000
sudo lsof -i :5173

# Kill the process
sudo kill -9 <PID>
```

### Docker Permission Denied

```bash
sudo usermod -aG docker $USER
# Logout and login again
```

### Services Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Frontend Can't Connect to Backend

```bash
# Verify backend is running
curl http://localhost:8000/health

# Check CORS settings in .env
# Update VITE_API_URL if needed
```

---

## 📊 Verify Installation

Run these commands to verify everything works:

```bash
# Check services
docker-compose ps

# Test backend
curl http://localhost:8000/health

# Test frontend
curl http://localhost:5173

# Run full test suite
make test
```

Expected output:
```json
{
  "status": "healthy",
  "service": "DNA-Stego API",
  "version": "1.0.0"
}
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Generate new SECRET_KEY
- [ ] Update CORS_ORIGINS
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable automatic backups
- [ ] Set up monitoring
- [ ] Review and update .env file
- [ ] Change default passwords (if any)

---

## 📚 Next Steps

1. **Test the application**
   ```bash
   # Upload a sample FASTA file
   # Encrypt a message
   # Download and decrypt
   ```

2. **Review documentation**
   - README.md - Project overview
   - DEPLOYMENT.md - Production deployment
   - API docs at /docs

3. **Customize for your needs**
   - Update branding
   - Configure additional features
   - Set up production domain

4. **Deploy to production**
   ```bash
   ./deploy.sh production
   ```

---

## 💡 Tips

- **Development**: Use `make dev` for hot-reload
- **Testing**: Run `make test` before commits
- **Logs**: Use `make logs` to debug issues
- **Backups**: Schedule `./backup.sh` with cron
- **Updates**: Pull latest, rebuild: `docker-compose build`

---

## 🆘 Getting Help

1. Check the logs: `docker-compose logs`
2. Review DEPLOYMENT.md for detailed guides
3. Check GitHub issues
4. Run setup script with debug: `bash -x setup.sh`

---

## 🎉 Success!

If you see this in your browser:

```
DNA Stego
Secure DNA-based Data Encryption
[Encrypt] [Decrypt]
```

**You're all set!** Start encrypting messages.

---

## 📈 Performance Tips

- Use production compose for better performance
- Enable Docker BuildKit: `export DOCKER_BUILDKIT=1`
- Allocate more resources to Docker (4GB+ RAM)
- Use SSD for Docker storage
- Enable caching in nginx

---

**Time to deployment: ~5 minutes** ⚡

**Questions?** Check DEPLOYMENT.md or open an issue on GitHub.
