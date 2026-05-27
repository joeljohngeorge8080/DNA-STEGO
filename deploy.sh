#!/bin/bash

# ================================
# DNA-Stego Deployment Script
# ================================

set -e  # Exit on error

echo "================================"
echo "DNA-Stego Deployment Script"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# Parse arguments
ENVIRONMENT=${1:-development}

echo "Deployment Environment: $ENVIRONMENT"
echo ""

# Create necessary directories
echo "Creating directories..."
mkdir -p storage/fasta_files
mkdir -p logs
echo "✓ Directories created"
echo ""

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠ Please update .env file with your configuration"
    echo ""
fi

# Build and deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Building production images..."
    docker-compose -f docker-compose.prod.yml build
    
    echo "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    echo ""
    echo "================================"
    echo "Production Deployment Complete!"
    echo "================================"
    echo "Backend: http://localhost:8000"
    echo "Frontend: http://localhost:80"
    echo "API Docs: http://localhost:8000/docs"
else
    echo "Building development images..."
    docker-compose build
    
    echo "Starting development services..."
    docker-compose up -d
    
    echo ""
    echo "================================"
    echo "Development Deployment Complete!"
    echo "================================"
    echo "Frontend: http://localhost:5173"
    echo "Backend: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
fi

echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
