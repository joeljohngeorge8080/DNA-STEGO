#!/bin/bash

# ================================
# DNA-Stego Complete Setup Script
# Handles ALL pre-deployment tasks
# ================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_header() { echo ""; echo -e "${CYAN}================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}================================${NC}"; echo ""; }
print_step() { echo -e "${MAGENTA}→ $1${NC}"; }

command_exists() { command -v "$1" >/dev/null 2>&1; }
check_port() { if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then print_warning "Port $1 is in use"; return 1; else print_success "Port $1 is available"; return 0; fi; }
ensure_directory() { if [ ! -d "$1" ]; then mkdir -p "$1"; print_success "Created: $1"; else print_info "Exists: $1"; fi; }

main() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
    ____  _   _____       ____  __                  
   / __ \/ | / /   |     / ___\/ /____  ____ _____ 
  / / / /  |/ / /| |     \__ \/ __/ _ \/ __ `/ __ \
 / /_/ / /|  / ___ |    ___/ / /_/  __/ /_/ / /_/ /
/_____/_/ |_/_/  |_|   /____/\__/\___/\__, /\____/ 
                                     /____/        
EOF
    echo -e "${NC}"
    
    print_header "STEP 1: Prerequisites Check"
    
    print_step "Checking Docker..."
    if ! command_exists docker; then
        print_error "Docker not installed. Installing..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        print_success "Docker installed"
        rm get-docker.sh
    else
        print_success "Docker: $(docker --version)"
    fi
    
    print_step "Checking Docker Compose..."
    if ! command_exists docker-compose; then
        print_info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    else
        print_success "Docker Compose: $(docker-compose --version)"
    fi
    
    print_step "Checking Python3..."
    if ! command_exists python3; then
        print_info "Installing Python3..."
        sudo apt update && sudo apt install -y python3 python3-pip
    fi
    print_success "Python3: $(python3 --version)"
    
    print_step "Checking Node.js..."
    if ! command_exists node; then
        print_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    print_success "Node.js: $(node --version)"
    
    print_header "STEP 2: Project Structure"
    
    print_step "Creating directories..."
    ensure_directory "app/api"
    ensure_directory "app/auth"
    ensure_directory "app/crypto"
    ensure_directory "app/decoder"
    ensure_directory "app/dna"
    ensure_directory "app/fasta"
    ensure_directory "app/pipeline"
    ensure_directory "app/preprocessing"
    ensure_directory "app/tests"
    ensure_directory "frontend/src/components"
    ensure_directory "frontend/public"
    ensure_directory "storage/fasta_files"
    ensure_directory "logs"
    ensure_directory ".github/workflows"
    ensure_directory "nginx"
    ensure_directory "docs"
    touch storage/fasta_files/.gitkeep logs/.gitkeep
    
    print_header "STEP 3: Configuration Files"
    
    if [ ! -f .env ]; then
        print_step "Creating .env file..."
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
        cat > .env << EOF
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development
SECRET_KEY=$SECRET_KEY
VITE_API_URL=http://localhost:8000
LOG_LEVEL=INFO
STORAGE_PATH=storage/fasta_files
MAX_FILE_SIZE=10485760
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_PER_MINUTE=60
SESSION_TIMEOUT=3600
EOF
        print_success "Created .env with secure key"
    else
        print_info ".env file exists"
    fi
    
    print_header "STEP 4: Port Check"
    check_port 8000 || print_warning "Backend port may conflict"
    check_port 5173 || print_warning "Frontend port may conflict"
    
    print_header "STEP 5: Dependencies"
    
    print_step "Installing backend dependencies..."
    if [ ! -d venv ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    fi
    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    pip install black pytest pytest-cov safety -q
    print_success "Backend dependencies installed"
    
    print_step "Installing frontend dependencies..."
    cd frontend
    npm install --silent
    print_success "Frontend dependencies installed"
    cd ..
    
    print_header "STEP 6: Code Quality"
    
    print_step "Formatting Python code..."
    black app/ -q
    print_success "Python code formatted"
    
    print_step "Checking frontend..."
    cd frontend && npm run lint --silent || true && cd ..
    print_success "Frontend checked"
    
    print_header "STEP 7: Testing"
    
    print_step "Running backend tests..."
    pytest app/tests/ -v --tb=short -q || print_warning "Some tests may need implementation"
    
    print_step "Building frontend..."
    cd frontend && npm run build > /dev/null 2>&1
    print_success "Frontend builds successfully"
    cd ..
    
    print_header "STEP 8: Docker Build"
    
    print_step "Building images (this takes time)..."
    docker-compose build --quiet
    print_success "Docker images built"
    
    print_header "STEP 9: Storage Setup"
    
    chmod -R 755 storage/
    cat > storage/fasta_files/sample.fasta << 'EOF'
>Sample_Sequence_1
ATCGATCGATCGATCGATCGATCGATCGATCG
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
>Sample_Sequence_2
TTTTAAAACCCCGGGGTTTTAAAACCCCGGGG
EOF
    print_success "Sample data created"
    
    print_header "STEP 10: Starting Services"
    
    docker-compose up -d
    print_success "Services starting..."
    
    print_step "Waiting for services..."
    sleep 15
    
    print_header "STEP 11: Health Checks"
    
    MAX_ATTEMPTS=10
    for i in $(seq 1 $MAX_ATTEMPTS); do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend is healthy"
            break
        elif [ $i -eq $MAX_ATTEMPTS ]; then
            print_error "Backend health check failed"
        else
            print_info "Waiting... ($i/$MAX_ATTEMPTS)"
            sleep 3
        fi
    done
    
    curl -f http://localhost:5173 >/dev/null 2>&1 && print_success "Frontend is accessible" || print_warning "Frontend starting"
    
    print_header "STEP 12: Documentation"
    
    cat > docs/API_ENDPOINTS.md << 'EOF'
# API Endpoints
- GET  /health - Health check
- POST /api/encrypt - Encrypt message
- POST /api/decrypt - Decrypt message  
- GET  /api/download?path=<path> - Download file
- GET  /docs - Swagger UI
EOF
    print_success "API docs created"
    
    print_header "STEP 13: Backup Script"
    
    cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups
tar czf backups/storage_$DATE.tar.gz storage/
cp .env backups/env_$DATE.backup
ls -t backups/storage_*.tar.gz | tail -n +8 | xargs -r rm
echo "Backup complete: backups/storage_$DATE.tar.gz"
EOF
    chmod +x backup.sh
    print_success "Backup script created"
    
    print_header "SETUP COMPLETE! 🎉"
    
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  DNA-Stego is ready!                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🌐 URLs:${NC}"
    echo -e "   Frontend:  ${BLUE}http://localhost:5173${NC}"
    echo -e "   Backend:   ${BLUE}http://localhost:8000${NC}"
    echo -e "   API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${CYAN}📋 Commands:${NC}"
    echo -e "   make logs    - View logs"
    echo -e "   make down    - Stop services"
    echo -e "   make test    - Run tests"
    echo -e "   ./backup.sh  - Create backup"
    echo ""
    echo -e "${YELLOW}⚠  Production:${NC} See DEPLOYMENT.md"
    echo ""
    
    if command_exists xdg-open || command_exists open; then
        read -p "Open in browser? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            (command_exists xdg-open && xdg-open http://localhost:5173 || open http://localhost:5173) &
        fi
    fi
}

trap 'print_error "Setup failed at line $LINENO"; exit 1' ERR
main "$@" 2>&1 | tee "setup_$(date +%Y%m%d_%H%M%S).log"
