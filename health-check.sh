#!/bin/bash

# DNA-Stego Health Check Script
# Automatically verifies all services and components

set +e  # Don't exit on errors

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Functions
check_mark() { echo -e "${GREEN}✅${NC}"; }
cross_mark() { echo -e "${RED}❌${NC}"; }
warning_mark() { echo -e "${YELLOW}⚠️${NC}"; }

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  $1"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo -e "${MAGENTA}→ $1${NC}"
}

# Colors for status
status_ok() { echo -e "${GREEN}✅ $1${NC}"; }
status_error() { echo -e "${RED}❌ $1${NC}"; }
status_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

clear
echo -e "${CYAN}"
cat << "EOF"
 ____  _   _____       ____  __            _ _   _   _
/ __ \/ | / /   |     / ___\/ /____  ___  / | | | | | |
/ / / /  |/ / /| |     \__ \/ __/ _ \/ __ `/ | | | | | |
/ /_/ / /|  / ___ |    ___/ / /_/  __/ /_/ / | | | |_| |
/_____/_/ |_/_/  |_|   /____/\__/\___/\__, /  |_|  \___/
                                     /____/
         HEALTH CHECK & VERIFICATION SUITE
EOF
echo -e "${NC}"

start_time=$(date +%s)

# ====== SECTION 1: Docker Status ======
print_header "1️⃣  DOCKER SERVICES STATUS"

print_section "Checking Docker daemon..."
if command -v docker &> /dev/null; then
    status_ok "Docker is installed"
    docker --version
else
    status_error "Docker is NOT installed"
    exit 1
fi

echo ""
print_section "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    status_ok "Docker Compose is installed"
    docker-compose --version
else
    status_error "Docker Compose is NOT installed"
    exit 1
fi

echo ""
print_section "Container Status"
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "dna-stego|NAMES" || status_error "No containers found"

echo ""
print_section "Detailed Container Health"
if docker inspect dna-stego-backend &> /dev/null; then
    backend_status=$(docker inspect --format='{{.State.Status}}' dna-stego-backend)
    [ "$backend_status" = "running" ] && status_ok "Backend container: RUNNING" || status_error "Backend container: $backend_status"
else
    status_error "Backend container not found"
fi

if docker inspect dna-stego-frontend &> /dev/null; then
    frontend_status=$(docker inspect --format='{{.State.Status}}' dna-stego-frontend)
    [ "$frontend_status" = "running" ] && status_ok "Frontend container: RUNNING" || status_error "Frontend container: $frontend_status"
else
    status_error "Frontend container not found"
fi

# ====== SECTION 2: Port Availability ======
print_header "2️⃣  PORT AVAILABILITY"

check_port() {
    if nc -z localhost $1 &> /dev/null; then
        status_ok "Port $1 is LISTENING"
        return 0
    else
        status_error "Port $1 is NOT listening"
        return 1
    fi
}

check_port 8000
check_port 5173

# ====== SECTION 3: API Connectivity ======
print_header "3️⃣  API CONNECTIVITY & HEALTH"

print_section "Backend API (http://localhost:8000)"
if timeout 5 curl -s http://localhost:8000 > /dev/null 2>&1; then
    status_ok "Backend is RESPONDING"
    
    # Try health endpoint
    if timeout 5 curl -s http://localhost:8000/health > /dev/null 2>&1; then
        status_ok "Health endpoint is WORKING"
        echo "   Response: $(curl -s http://localhost:8000/health)"
    else
        status_warning "Health endpoint not available"
    fi
    
    # Try API docs
    if timeout 5 curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        status_ok "API Swagger docs AVAILABLE at /docs"
    else
        status_warning "API docs not accessible"
    fi
else
    status_error "Backend is NOT responding"
    status_error "Is backend running? Check: docker-compose logs backend"
fi

echo ""
print_section "Frontend (http://localhost:5173)"
if timeout 5 curl -s http://localhost:5173 > /dev/null 2>&1; then
    status_ok "Frontend is RESPONDING"
    
    # Check if dist folder exists
    if docker exec dna-stego-frontend ls dist/ > /dev/null 2>&1; then
        status_ok "Frontend build artifacts FOUND"
    else
        status_warning "Frontend dist directory not found"
    fi
else
    status_error "Frontend is NOT responding"
    status_error "Is frontend running? Check: docker-compose logs frontend"
fi

# ====== SECTION 4: File System ======
print_header "4️⃣  FILE SYSTEM & STORAGE"

print_section "Required Directories"
[ -d "app" ] && status_ok "app/ directory exists" || status_error "app/ directory MISSING"
[ -d "frontend" ] && status_ok "frontend/ directory exists" || status_error "frontend/ directory MISSING"
[ -d "storage" ] && status_ok "storage/ directory exists" || status_error "storage/ directory MISSING"
[ -d "storage/fasta_files" ] && status_ok "storage/fasta_files/ exists" || status_error "storage/fasta_files/ MISSING"
[ -d "logs" ] && status_ok "logs/ directory exists" || status_error "logs/ directory MISSING"

echo ""
print_section "Database Files"
if [ -f "dna_stego.db" ]; then
    status_ok "Database file EXISTS"
    db_size=$(du -h dna_stego.db | cut -f1)
    echo "   Size: $db_size"
else
    status_warning "Database file NOT FOUND (will be created on first use)"
fi

echo ""
print_section "Configuration Files"
[ -f ".env" ] && status_ok ".env file exists" || status_error ".env file MISSING"
[ -f "docker-compose.yml" ] && status_ok "docker-compose.yml exists" || status_error "docker-compose.yml MISSING"
[ -f "Dockerfile" ] && status_ok "Dockerfile exists" || status_error "Dockerfile MISSING"
[ -f "requirements.txt" ] && status_ok "requirements.txt exists" || status_error "requirements.txt MISSING"

# ====== SECTION 5: Dependencies ======
print_header "5️⃣  DEPENDENCIES & PACKAGES"

print_section "Python Backend Dependencies"
if docker exec dna-stego-backend pip list &> /dev/null; then
    status_ok "Python packages INSTALLED"
    package_count=$(docker exec dna-stego-backend pip list | wc -l)
    echo "   Total packages: $package_count"
else
    status_warning "Cannot verify Python packages"
fi

echo ""
print_section "Node Frontend Dependencies"
if docker exec dna-stego-frontend ls node_modules &> /dev/null; then
    status_ok "Node packages INSTALLED"
    npm_count=$(docker exec dna-stego-frontend ls node_modules | wc -l)
    echo "   Total packages: $npm_count"
else
    status_warning "Cannot verify Node packages"
fi

# ====== SECTION 6: Logs ======
print_header "6️⃣  LOGS & MONITORING"

print_section "Application Logs"
if [ -f "logs/dna-stego.log" ]; then
    status_ok "Log file EXISTS"
    log_size=$(du -h logs/dna-stego.log | cut -f1)
    echo "   Size: $log_size"
    
    # Check for errors
    error_count=$(grep -ci "error\|exception" logs/dna-stego.log || true)
    if [ $error_count -gt 0 ]; then
        status_warning "Found $error_count ERROR/EXCEPTION entries in logs"
    else
        status_ok "No errors in log file"
    fi
else
    status_warning "Log file NOT YET CREATED"
fi

echo ""
print_section "Docker Container Logs"
backend_errors=$(docker-compose logs backend 2>/dev/null | grep -ci "error\|exception\|failed" || true)
frontend_errors=$(docker-compose logs frontend 2>/dev/null | grep -ci "error\|exception\|failed" || true)

[ $backend_errors -eq 0 ] && status_ok "Backend: No errors in logs" || status_warning "Backend: $backend_errors error entries found"
[ $frontend_errors -eq 0 ] && status_ok "Frontend: No errors in logs" || status_warning "Frontend: $frontend_errors error entries found"

# ====== SECTION 7: Environment ======
print_header "7️⃣  ENVIRONMENT CONFIGURATION"

print_section "Environment Variables"
if [ -f ".env" ]; then
    var_count=$(grep -v "^#" .env | grep -c "=" || true)
    status_ok "Found $var_count environment variables"
    
    # Check critical variables
    grep -q "API_PORT" .env && status_ok "API_PORT configured" || status_error "API_PORT NOT configured"
    grep -q "DATABASE_URL" .env && status_ok "DATABASE_URL configured" || status_error "DATABASE_URL NOT configured"
else
    status_error ".env file NOT FOUND"
fi

# ====== SECTION 8: Summary ======
end_time=$(date +%s)
duration=$((end_time - start_time))

print_header "📊 SUMMARY"

echo -e "${BLUE}Check Duration: ${duration}s${NC}"
echo ""

# Count checks
backend_running=0
frontend_running=0
api_responding=0
storage_ok=0

docker ps | grep -q "dna-stego-backend" && backend_running=1
docker ps | grep -q "dna-stego-frontend" && frontend_running=1
timeout 2 curl -s http://localhost:8000 > /dev/null 2>&1 && api_responding=1
[ -d "storage/fasta_files" ] && storage_ok=1

total_checks=$((backend_running + frontend_running + api_responding + storage_ok))

echo -e "${BLUE}Critical Components Status:${NC}"
echo ""
[ $backend_running -eq 1 ] && status_ok "Backend Container: RUNNING" || status_error "Backend Container: STOPPED"
[ $frontend_running -eq 1 ] && status_ok "Frontend Container: RUNNING" || status_error "Frontend Container: STOPPED"
[ $api_responding -eq 1 ] && status_ok "API Response: WORKING" || status_error "API Response: NOT WORKING"
[ $storage_ok -eq 1 ] && status_ok "Storage: READY" || status_error "Storage: NOT READY"

echo ""
if [ $total_checks -eq 4 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}   ✨ ALL SYSTEMS OPERATIONAL! ✨${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "🌐 Access Points:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
elif [ $total_checks -ge 2 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC}   ⚠️  SOME SYSTEMS NEED ATTENTION${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Check the sections above for details."
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}   ❌ CRITICAL ISSUES DETECTED${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Try the following:"
    echo "   1. docker-compose up --build"
    echo "   2. docker-compose logs"
    echo "   3. Check ports: lsof -i :8000 and lsof -i :5173"
fi

echo ""
echo -e "${CYAN}Report Generated: $(date)${NC}"
echo ""
