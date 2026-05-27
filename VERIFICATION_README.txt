═══════════════════════════════════════════════════════════════════════════════
                DNA-STEGO ADDON/SERVICE VERIFICATION GUIDE
═══════════════════════════════════════════════════════════════════════════════

To check if each addon/service is working, you have multiple options:

═══════════════════════════════════════════════════════════════════════════════
🚀 OPTION 1: Automated Health Check (Recommended)
═══════════════════════════════════════════════════════════════════════════════

Run the automated health check script:

    ./health-check.sh

This will automatically verify:
  ✅ Docker services status
  ✅ Port availability
  ✅ API connectivity
  ✅ Frontend responsiveness
  ✅ File system & storage
  ✅ Dependencies & packages
  ✅ Logs for errors
  ✅ Environment configuration
  ✅ Overall system health

The script provides a comprehensive report with clear ✅/❌ indicators.

═══════════════════════════════════════════════════════════════════════════════
📋 OPTION 2: Manual Verification (Detailed Control)
═══════════════════════════════════════════════════════════════════════════════

Check individual services one by one:

1️⃣  BACKEND API (Port 8000)
    
    curl http://localhost:8000
    curl http://localhost:8000/health
    docker-compose logs -f backend
    docker-compose ps backend

2️⃣  FRONTEND (Port 5173)
    
    curl http://localhost:5173
    docker-compose logs -f frontend
    docker-compose ps frontend
    
    Or open in browser: http://localhost:5173

3️⃣  DOCKER CONTAINERS
    
    docker-compose ps                    # Quick status
    docker ps                             # All containers
    docker stats                          # Resource usage

4️⃣  PORTS
    
    lsof -i :8000                        # Backend port
    lsof -i :5173                        # Frontend port
    netstat -tlnp | grep -E "8000|5173"  # Alternative

5️⃣  DATABASE
    
    ls -lh dna_stego.db                  # Check file exists
    sqlite3 dna_stego.db ".tables"       # List tables
    du -sh dna_stego.db                  # Check size

6️⃣  STORAGE
    
    ls -R storage/                       # View structure
    du -sh storage/                      # Disk usage
    ls -lh storage/fasta_files/          # FASTA files

7️⃣  LOGS
    
    docker-compose logs --tail=50        # Recent logs
    docker-compose logs backend          # Backend only
    docker-compose logs frontend         # Frontend only
    tail -f logs/dna-stego.log          # Application log

═══════════════════════════════════════════════════════════════════════════════
🔍 OPTION 3: Browser Testing
═══════════════════════════════════════════════════════════════════════════════

Open these URLs in your browser to test:

1. Frontend Application
   http://localhost:5173
   
   Check if:
   - Page loads without errors
   - UI is rendered correctly
   - No JavaScript console errors (F12 → Console)

2. API Swagger Documentation
   http://localhost:8000/docs
   
   Check if:
   - API documentation loads
   - All endpoints are listed
   - You can explore API methods

3. Alternative API Documentation
   http://localhost:8000/redoc
   
   Check if:
   - ReDoc documentation is accessible
   - Better formatted API reference

═══════════════════════════════════════════════════════════════════════════════
⚡ OPTION 4: Quick Commands for Each Addon
═══════════════════════════════════════════════════════════════════════════════

Backend API:
  docker ps | grep backend           # Is it running?
  curl -s http://localhost:8000      # Is it responding?
  docker-compose logs backend        # Check for errors

Frontend:
  docker ps | grep frontend          # Is it running?
  curl -s http://localhost:5173      # Is it responding?
  docker-compose logs frontend       # Check for errors

Database:
  [ -f dna_stego.db ] && echo "✅ DB exists" || echo "❌ DB missing"
  sqlite3 dna_stego.db "SELECT 1"   # Test connectivity

Storage:
  [ -d storage/fasta_files ] && echo "✅ Storage OK" || echo "❌ Storage missing"
  ls storage/fasta_files/            # Show files

Logs:
  grep -i error docker-compose logs  # Search for errors
  tail -20 logs/dna-stego.log        # Show latest entries

═══════════════════════════════════════════════════════════════════════════════
📈 OPTION 5: Comprehensive Verification Workflow
═══════════════════════════════════════════════════════════════════════════════

Follow this step-by-step workflow:

Step 1: Start services
  docker-compose up --build

Step 2: Wait 30 seconds (services need time to start)
  sleep 30

Step 3: Run automated health check
  ./health-check.sh

Step 4: Manually test critical services
  curl http://localhost:8000        # Backend
  curl http://localhost:5173        # Frontend
  
Step 5: View logs for any issues
  docker-compose logs --tail=100

Step 6: Access in browser
  Frontend: http://localhost:5173
  API Docs: http://localhost:8000/docs

Step 7: Check application logs
  tail -f logs/dna-stego.log

═══════════════════════════════════════════════════════════════════════════════
🎯 ADDON/SERVICE CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Use this checklist to verify everything:

  [ ] Docker daemon is running
      check: docker --version

  [ ] Backend container is running
      check: docker ps | grep dna-stego-backend

  [ ] Frontend container is running
      check: docker ps | grep dna-stego-frontend

  [ ] Port 8000 is listening
      check: lsof -i :8000 | grep LISTEN

  [ ] Port 5173 is listening
      check: lsof -i :5173 | grep LISTEN

  [ ] Backend API responds
      check: curl http://localhost:8000

  [ ] Frontend responds
      check: curl http://localhost:5173

  [ ] API health endpoint works
      check: curl http://localhost:8000/health

  [ ] Database file exists
      check: ls dna_stego.db

  [ ] Storage directory exists
      check: ls -d storage/fasta_files

  [ ] Logs directory exists
      check: ls -d logs

  [ ] No errors in logs
      check: docker-compose logs | grep -i error | wc -l

  [ ] Environment variables loaded
      check: cat .env | grep -c "="

═══════════════════════════════════════════════════════════════════════════════
❌ TROUBLESHOOTING - If Services Aren't Working
═══════════════════════════════════════════════════════════════════════════════

Issue: Services won't start
Solution:
  docker-compose down
  docker-compose up --build
  docker-compose logs

Issue: Port already in use
Solution:
  lsof -i :8000          # Find process
  kill -9 <PID>          # Kill it
  docker-compose restart # Restart services

Issue: "Cannot connect to Docker daemon"
Solution:
  sudo systemctl start docker
  docker ps              # Test connection

Issue: Database is corrupted
Solution:
  cp dna_stego.db dna_stego.db.backup
  rm dna_stego.db
  docker-compose restart # Will recreate

Issue: Build failures
Solution:
  docker-compose down -v  # Remove volumes
  docker system prune -a  # Clean Docker
  docker-compose up --build

═══════════════════════════════════════════════════════════════════════════════
📚 DOCUMENTATION FILES
═══════════════════════════════════════════════════════════════════════════════

For more detailed information, see:

  1. HEALTH_CHECK_GUIDE.md
     - Comprehensive health check procedures
     - Service-by-service verification
     - Automated health check script
     - Common issues & troubleshooting

  2. QUICK_VERIFICATION.md
     - Quick commands for each service
     - Fast verification workflows
     - Pro tips and tricks
     - Emergency commands

  3. README.md
     - Project overview
     - Architecture diagram
     - Setup instructions

  4. DEPLOYMENT_REPORT.md
     - Detailed deployment information
     - All configurations listed
     - Validation results

═══════════════════════════════════════════════════════════════════════════════
✨ SUMMARY
═══════════════════════════════════════════════════════════════════════════════

To quickly check if all addons are working:

  1. Run: ./health-check.sh
  2. Open: http://localhost:5173 (frontend)
  3. Open: http://localhost:8000/docs (API)
  4. Run: docker-compose logs (check for errors)

If everything shows ✅ in the health check, all systems are operational!

═══════════════════════════════════════════════════════════════════════════════
Generated: April 14, 2026
Last Updated: April 14, 2026
═══════════════════════════════════════════════════════════════════════════════
