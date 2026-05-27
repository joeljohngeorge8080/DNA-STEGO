# 🔍 Quick Addon/Service Verification Guide

## ⚡ Quick Commands

### Check Everything at Once
```bash
./health-check.sh
```
This runs a comprehensive health check of all services.

---

## 📋 Individual Service Checks

### 1. **Backend API (Port 8000)**

**Quick Check:**
```bash
curl http://localhost:8000
```

**Detailed Checks:**
```bash
# Test if responding
curl -I http://localhost:8000

# Check health endpoint
curl http://localhost:8000/health

# View API documentation
curl http://localhost:8000/docs

# View real-time logs
docker-compose logs -f backend

# Specific error search
docker-compose logs backend | grep -i error
```

---

### 2. **Frontend (Port 5173)**

**Quick Check:**
```bash
curl http://localhost:5173
```

**Detailed Checks:**
```bash
# Check response headers
curl -I http://localhost:5173

# View real-time logs
docker-compose logs -f frontend

# Search for build errors
docker-compose logs frontend | grep -i error

# Check if React is loaded
curl http://localhost:5173 | grep -i "react\|javascript"
```

---

### 3. **Docker Containers**

**Quick Check:**
```bash
docker-compose ps
```

**Detailed Checks:**
```bash
# List all containers
docker ps

# Show container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# View container resource usage
docker stats

# Check specific container health
docker inspect --format='{{.State.Health.Status}}' dna-stego-backend
docker inspect --format='{{.State.Health.Status}}' dna-stego-frontend
```

---

### 4. **Port Availability**

**Quick Check:**
```bash
lsof -i :8000
lsof -i :5173
```

**Alternative:**
```bash
netstat -tlnp 2>/dev/null | grep -E "8000|5173"
```

---

### 5. **Database**

**Quick Check:**
```bash
ls -lh dna_stego.db
```

**Detailed Checks:**
```bash
# Check database integrity
sqlite3 dna_stego.db "PRAGMA integrity_check;"

# List database tables
sqlite3 dna_stego.db ".tables"

# Check database size
du -sh dna_stego.db
```

---

### 6. **Storage & Files**

**Quick Check:**
```bash
ls -R storage/
```

**Detailed Checks:**
```bash
# Check storage structure
tree storage/ -L 3

# Check disk usage
du -sh storage/

# List FASTA files
ls -lh storage/fasta_files/
```

---

### 7. **Logs**

**Quick Check:**
```bash
docker-compose logs --tail=20
```

**Detailed Checks:**
```bash
# View combined logs with timestamps
docker-compose logs --timestamps --tail=50

# View only backend logs
docker-compose logs backend

# View only frontend logs
docker-compose logs frontend

# Search for errors
docker-compose logs | grep -i "error\|exception\|failed"

# View application log file
tail -f logs/dna-stego.log
```

---

### 8. **Configuration**

**Quick Check:**
```bash
cat .env | grep -v "^#"
```

**Detailed Checks:**
```bash
# Check all environment variables
docker-compose exec backend printenv

# Verify critical variables
docker-compose exec backend bash -c 'echo "API Port: $API_PORT"'
docker-compose exec backend bash -c 'echo "Database: $DATABASE_URL"'
```

---

### 9. **Dependencies**

**Backend Dependencies:**
```bash
# List Python packages
docker-compose exec backend pip list

# Check specific package
docker-compose exec backend pip show fastapi

# Check requirements
cat requirements.txt
```

**Frontend Dependencies:**
```bash
# List Node packages
docker-compose exec frontend npm list

# Check package.json
cat frontend/package.json | grep -A 5 '"dependencies"'
```

---

### 10. **API Functionality**

**Test Basic Endpoints:**
```bash
# Get API info
curl http://localhost:8000/

# Check health
curl http://localhost:8000/health

# View Swagger UI (in browser)
http://localhost:8000/docs

# View ReDoc (in browser)
http://localhost:8000/redoc

# Test POST request
curl -X POST http://localhost:8000/api/test \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## 🎯 Start/Stop Services

**Start All Services:**
```bash
docker-compose up -d
```

**Start with Build:**
```bash
docker-compose up --build
```

**Start Specific Service:**
```bash
docker-compose up -d backend
docker-compose up -d frontend
```

**Stop Services:**
```bash
docker-compose down
```

**Stop Specific Service:**
```bash
docker-compose down backend
```

**Restart Services:**
```bash
docker-compose restart
docker-compose restart backend
docker-compose restart frontend
```

---

## 🐛 Troubleshooting Quick Fixes

### Services Won't Start
```bash
# Check for port conflicts
lsof -i :8000
lsof -i :5173

# Check logs for errors
docker-compose logs

# Try full rebuild
docker-compose down
docker-compose up --build
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Issues
```bash
# Check database file
ls -lh dna_stego.db

# Backup and remove
cp dna_stego.db dna_stego.db.backup
rm dna_stego.db

# Restart to recreate
docker-compose down
docker-compose up
```

### Clear Caches & Rebuild
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild everything
docker-compose up --build

# Clean Docker system
docker system prune -a
```

---

## 📊 Complete Verification Workflow

```bash
# 1. Start services
docker-compose up --build

# 2. Wait 30 seconds for startup
sleep 30

# 3. Run health check
./health-check.sh

# 4. Check specific services
curl http://localhost:8000
curl http://localhost:5173

# 5. View logs
docker-compose logs --tail=50

# 6. If all good, access in browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

---

## 🚨 Emergency Commands

```bash
# View Docker events in real-time
docker events

# Inspect container details
docker inspect dna-stego-backend | grep -A 10 "LogPath"

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Force remove all containers
docker-compose rm -f

# Check system resources
docker stats

# View all available logs
docker-compose logs --all
```

---

## 💡 Pro Tips

1. **Continuous Monitoring:**
   ```bash
   watch -n 1 'docker ps && echo "---" && curl -s http://localhost:8000 | head -c 50'
   ```

2. **Real-time Log Monitoring:**
   ```bash
   docker-compose logs -f --tail=20
   ```

3. **Service Health Monitoring:**
   ```bash
   while true; do docker ps --format "{{.Names}}\t{{.Status}}" | grep dna-stego; sleep 5; done
   ```

4. **Automated Daily Health Check:**
   Add to crontab:
   ```bash
   0 */6 * * * cd /path/to/dna-stego && ./health-check.sh >> health-check-log.txt
   ```

---

**Last Updated:** April 14, 2026
