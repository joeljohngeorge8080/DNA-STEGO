#!/bin/bash

# ================================
# DNA-Stego EC2 Deployment Script
# ================================
# This script deploys DNA-Stego to AWS EC2

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}DNA-Stego EC2 Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if running on EC2
if ! grep -q "Amazon EC2" /sys/hypervisor/uuid 2>/dev/null; then
    echo -e "${YELLOW}⚠ Warning: Not running on EC2 instance${NC}"
fi

# Check prerequisites
echo -e "${BLUE}→ Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo -e "${GREEN}✓ Prerequisites installed${NC}"
echo ""

# Clone or update repository
echo -e "${BLUE}→ Setting up repository...${NC}"

REPO_PATH="${1:-.}"

if [ ! -d "$REPO_PATH/.git" ]; then
    echo "Cloning repository..."
    git clone "${REPO_URL:-.}" "$REPO_PATH"
else
    echo "Updating repository..."
    cd "$REPO_PATH"
    git pull origin main
fi

cd "$REPO_PATH"
echo -e "${GREEN}✓ Repository ready${NC}"
echo ""

# Environment setup
echo -e "${BLUE}→ Setting up environment...${NC}"

if [ ! -f ".env.production" ]; then
    echo "Creating .env.production from template..."
    cp .env.example .env.production
    echo -e "${YELLOW}⚠ Please edit .env.production with your configuration${NC}"
    echo "Edit: nano .env.production"
    exit 1
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Create required directories
echo -e "${BLUE}→ Creating directories...${NC}"

mkdir -p storage/fasta_files logs
chmod 755 storage logs

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Build and deploy
echo -e "${BLUE}→ Building Docker images...${NC}"

docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}✓ Images built${NC}"
echo ""

# Start services
echo -e "${BLUE}→ Starting services...${NC}"

docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for health checks
echo -e "${BLUE}→ Waiting for services to be healthy...${NC}"

for i in {1..30}; do
    if curl -f http://localhost:8000/health &> /dev/null; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

sleep 5

# Check services
echo -e "${BLUE}→ Verifying services...${NC}"

docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}✓ Services are running${NC}"
echo ""

# Verify API
echo -e "${BLUE}→ Testing API...${NC}"

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${RED}✗ Backend API is not responding${NC}"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Services:"
echo "  Backend:  http://$(hostname -I | awk '{print $1}'):8000"
echo "  Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Next steps:"
echo "  1. Configure your domain to point to this instance"
echo "  2. Setup SSL/TLS certificate"
echo "  3. Setup nginx reverse proxy"
echo "  4. Configure CloudWatch monitoring"
echo ""
echo "View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
