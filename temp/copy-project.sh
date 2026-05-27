#!/bin/bash

# ================================
# DNA-Stego Project Setup Master Script
# Copies all files to your project directory
# ================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}DNA-Stego Project Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Get target directory
read -p "Enter your project directory path (or press Enter for current directory): " PROJECT_DIR
PROJECT_DIR=${PROJECT_DIR:-.}

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Creating project directory: $PROJECT_DIR${NC}"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"
echo -e "${GREEN}Working in: $(pwd)${NC}"
echo ""

# Copy all project files
echo -e "${BLUE}Copying project files...${NC}"

# Backend files
cp /home/claude/Dockerfile .
cp /home/claude/docker-compose.yml .
cp /home/claude/docker-compose.prod.yml .
cp /home/claude/.dockerignore .
cp /home/claude/requirements.txt .
cp /home/claude/Makefile .
cp /home/claude/.env.example .
cp /home/claude/.gitignore .

# Documentation
cp /home/claude/README.md .
cp /home/claude/LICENSE .
cp /home/claude/DEPLOYMENT.md .
cp /home/claude/CONTRIBUTING.md .

# Scripts
cp /home/claude/setup.sh .
cp /home/claude/deploy.sh .
chmod +x setup.sh deploy.sh

# App directory
mkdir -p app/{api,auth,crypto,decoder,dna,fasta,pipeline,preprocessing,tests}
cp /home/claude/app/*.py app/ 2>/dev/null || true
cp /home/claude/app/api/*.py app/api/ 2>/dev/null || true
cp /home/claude/app/crypto/*.py app/crypto/ 2>/dev/null || true
cp /home/claude/app/decoder/*.py app/decoder/ 2>/dev/null || true
cp /home/claude/app/dna/*.py app/dna/ 2>/dev/null || true
cp /home/claude/app/fasta/*.py app/fasta/ 2>/dev/null || true
cp /home/claude/app/pipeline/*.py app/pipeline/ 2>/dev/null || true
cp /home/claude/app/preprocessing/*.py app/preprocessing/ 2>/dev/null || true
cp /home/claude/app/tests/*.py app/tests/ 2>/dev/null || true

# Frontend
mkdir -p frontend/src/{components,assets} frontend/public
cp -r /home/claude/frontend/* frontend/ 2>/dev/null || true

# GitHub
mkdir -p .github/{workflows,ISSUE_TEMPLATE}
cp /home/claude/.github/workflows/*.yml .github/workflows/ 2>/dev/null || true
cp /home/claude/.github/ISSUE_TEMPLATE/*.md .github/ISSUE_TEMPLATE/ 2>/dev/null || true

# Storage
mkdir -p storage/fasta_files logs docs
touch storage/fasta_files/.gitkeep logs/.gitkeep

echo -e "${GREEN}✓ All files copied successfully!${NC}"
echo ""
echo -e "${BLUE}Project structure:${NC}"
tree -L 2 -I 'node_modules|venv|__pycache__|dist' || ls -la

echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. cd $PROJECT_DIR"
echo "2. ./setup.sh"
echo "3. Access: http://localhost:5173"
echo ""
echo -e "${YELLOW}For production deployment:${NC}"
echo "./deploy.sh production"
echo ""
