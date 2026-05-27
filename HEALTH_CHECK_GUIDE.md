# 🏥 DNA-Stego Health Check & Verification Guide

## Quick Status Check

```bash
# Check all Docker services status
docker-compose ps

# Check service logs
docker-compose logs -f

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend
```

---

## 🔍 Service-by-Service Verification

### 1. **Backend API Service (Port 8000)**

#### Health Check Endpoint
```bash
curl http://localhost:8000/health
```
**Expected Response**: `{"status": "ok"}` or similar

#### Swagger API Documentation
```bash
# Open in browser
http://localhost:8000/docs

# Or check with curl
curl http://localhost:8000/docs
```

#### API Health Checks
```bash
# Test base endpoint
curl http://localhost:8000/

# Test API version
curl http://localhost:8000/api/v1/health

# Test if server is responding
curl -v http://localhost:8000/ 2>&1 | grep "Connected"
```

#### Backend Logs
```bash
# View real-time logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs backend --tail=100

# Search for errors
docker-compose logs backend | grep -i error
```

#### Database Check
```bash
# Check if database file exists
ls -lh storage/*.db

# Check database connectivity
python -c "import sqlite3; sqlite3.connect('./dna_stego.db').execute('SELECT 1'); print('✅ Database OK')"
```

---

### 2. **Frontend Service (Port 5173)**

#### Frontend Availability
```bash
# Simple connectivity check
curl http://localhost:5173

# Check with headers
curl -I http://localhost:5173
```

#### Build Verification
```bash
# Check if build succeeded
ls -lh frontend/dist/

# List generated files
ls frontend/dist/ | head -10
```

#### Frontend Logs
```bash
# View real-time logs
docker-compose logs -f frontend

# View build output
docker-compose logs frontend --tail=50
```

#### Browser Test
```bash
# Open in browser to verify UI loads
http://localhost:5173

# Check browser console for JS errors
# F12 → Console tab
```

---

### 3. **Docker Services Status**

#### View Running Containers
```bash
# List all running containers
docker ps

# List all containers (running & stopped)
docker ps -a

# Get detailed info about containers
docker inspect dna-stego-backend
docker inspect dna-stego-frontend
```

#### Container Resource Usage
```bash
# Real-time monitoring
docker stats

# Show memory and CPU usage
docker stats --no-stream
```

#### Container Health Status
```bash
# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# More detailed health info
docker inspect --format='{{.State.Health.Status}}' dna-stego-backend
docker inspect --format='{{.State.Health.Status}}' dna-stego-frontend
```

---

### 4. **Network & Connectivity**

#### Check Network Connectivity Between Services
```bash
# Verify backend is accessible from host
curl -v http://localhost:8000 2>&1 | grep "Connected\|refused"

# Verify frontend is accessible from host
curl -v http://localhost:5173 2>&1 | grep "Connected\|refused"

# Check DNS resolution (inside Docker)
docker-compose exec backend ping -c 1 frontend
docker-compose exec frontend wget -O - http://backend:8000/ --quiet
```

#### Port Availability
```bash
# Check if ports are in use
lsof -i :8000
lsof -i :5173

# Alternative: netstat
netstat -tlnp 2>/dev/null | grep -E "8000|5173"
```

---

### 5. **Application Functionality Tests**

#### Python Backend Tests
```bash
# Run pytest (if tests exist)
docker-compose exec backend pytest app/tests/ -v

# Or run locally if venv is active
pytest app/tests/ -v

# Run specific test
pytest app/tests/test_main.py -v
```

#### Manual API Tests
```bash
# Test encryption endpoint (example)
curl -X POST http://localhost:8000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"data": "test message"}'

# Test decryption endpoint (example)
curl -X POST http://localhost:8000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted_data": "..."}'

# Test file upload
curl -X POST http://localhost:8000/api/upload \
  -F "file=@test.txt"
```

#### Frontend Build & Assets
```bash
# Verify all assets loaded
curl http://localhost:5173 | grep -c "<script\|<link"

# Check for 404 errors
curl -s http://localhost:5173 2>&1 | grep "404\|error" | head -5
```

---

### 6. **Environment & Configuration**

#### Check Environment Variables
```bash
# View .env file
cat .env | grep -v "^#"

# Check Docker environment inside container
docker-compose exec backend printenv | grep API

# Verify critical variables
docker-compose exec backend bash -c 'echo "API_PORT: $API_PORT"'
```

#### Configuration Validation
```bash
# Check if required files exist
[ -f .env ] && echo "✅ .env exists" || echo "❌ .env missing"
[ -f docker-compose.yml ] && echo "✅ docker-compose.yml exists" || echo "❌ Missing"
[ -f requirements.txt ] && echo "✅ requirements.txt exists" || echo "❌ Missing"
[ -d frontend/dist ] && echo "✅ Frontend built" || echo "❌ Frontend not built"
```

---

### 7. **Storage & File System**

#### Check File Storage
```bash
# View storage structure
tree storage/ -L 2

# Or use ls
ls -R storage/

# Check file permissions
ls -lh storage/fasta_files/

# Check disk usage
du -sh storage/
du -sh logs/
```

#### Database Integrity
```bash
# Check database size and last modified
ls -lh dna_stego.db

# Backup database
cp dna_stego.db dna_stego.db.backup

# Check tables (if accessible)
sqlite3 dna_stego.db ".tables"
```

---

### 8. **Logging & Monitoring**

#### Check Application Logs
```bash
# View combined logs
docker-compose logs --tail=50

# Follow logs in real-time
docker-compose logs -f

# Search for errors in logs
docker-compose logs | grep -i "error\|exception\|failed"

# Get timestamped logs
docker-compose logs --timestamps
```

#### View Application Log Files
```bash
# Check log directory
ls -lh logs/

# View application logs
tail -f logs/dna-stego.log

# Search application logs
grep "ERROR\|WARN" logs/dna-stego.log
```

---

## 🔧 Automated Health Check Script

Create a file called `health-check.sh`:

```bash
#!/bin/bash

echo "🏥 DNA-Stego Health Check"
echo "=========================="
echo ""

# Backend Check
echo "1️⃣  Backend Service (Port 8000)"
if curl -s http://localhost:8000 > /dev/null; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:8000/health && echo "" || echo "   ⚠️  Health endpoint not responding"
else
    echo "   ❌ Backend is NOT running"
fi
echo ""

# Frontend Check
echo "2️⃣  Frontend Service (Port 5173)"
if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is NOT running"
fi
echo ""

# Docker Containers
echo "3️⃣  Docker Containers"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "dna-stego|NAMES"
echo ""

# Ports
echo "4️⃣  Port Availability"
lsof -i :8000 > /dev/null && echo "   ✅ Port 8000 in use" || echo "   ❌ Port 8000 NOT in use"
lsof -i :5173 > /dev/null && echo "   ✅ Port 5173 in use" || echo "   ❌ Port 5173 NOT in use"
echo ""

# Storage
echo "5️⃣  Storage & Database"
[ -f dna_stego.db ] && echo "   ✅ Database exists" || echo "   ❌ Database NOT found"
[ -d storage/fasta_files ] && echo "   ✅ Storage directory exists" || echo "   ❌ Storage directory NOT found"
echo ""

# Logs
echo "6️⃣  Logs"
[ -d logs ] && echo "   ✅ Logs directory exists" || echo "   ❌ Logs directory NOT found"
[ -f logs/dna-stego.log ] && echo "   ✅ Log file exists" || echo "   ⚠️  Log file not yet created"
echo ""

echo "✨ Health check complete!"
```

Run it:
```bash
chmod +x health-check.sh
./health-check.sh
```

---

## ⚠️ Common Issues & Troubleshooting

### Backend Not Starting
```bash
# Check logs for errors
docker-compose logs backend

# Verify Python dependencies
docker-compose exec backend pip list

# Check if port is already in use
lsof -i :8000
```

### Frontend Not Starting
```bash
# Check build logs
docker-compose logs frontend

# Verify Node modules are installed
docker-compose exec frontend ls node_modules | head -5

# Check for build errors
docker-compose logs frontend | grep -i "error"
```

### Database Issues
```bash
# Check database integrity
sqlite3 dna_stego.db "PRAGMA integrity_check;"

# Reset database
rm dna_stego.db  # WARNING: This deletes data!

# Reinitialize
docker-compose down
docker-compose up --build
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8000
lsof -i :5173

# Kill process (if needed)
kill -9 <PID>

# Or change ports in docker-compose.yml
```

---

## 📊 Complete Verification Checklist

- [ ] Backend responds to `curl http://localhost:8000`
- [ ] Frontend loads at `http://localhost:5173`
- [ ] API docs available at `http://localhost:8000/docs`
- [ ] Docker containers are running: `docker ps`
- [ ] No errors in logs: `docker-compose logs | grep -i error`
- [ ] Database file exists: `ls -l dna_stego.db`
- [ ] Storage directory exists: `ls -d storage/`
- [ ] Ports 8000 and 5173 are listening
- [ ] Environment variables loaded: `cat .env`
- [ ] All dependencies installed

---

## 🚀 Quick Start Verification

After running `./setup.sh` or `docker-compose up`, verify everything:

```bash
# 1. Check services
docker-compose ps

# 2. Run health checks
./health-check.sh

# 3. Check logs
docker-compose logs --tail=50

# 4. Test API
curl http://localhost:8000

# 5. Open browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

---

**Last Updated**: April 14, 2026
