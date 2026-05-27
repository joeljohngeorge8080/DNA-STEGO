# ================================
# DNA-Stego Makefile
# ================================

.PHONY: help install dev build up down logs test clean

# Default target
help:
	@echo "DNA-Stego - Available Commands:"
	@echo ""
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development environment"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - View logs"
	@echo "  make test        - Run all tests"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make prod        - Deploy production environment"
	@echo ""

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Dependencies installed"

# Start development environment
dev:
	@echo "Starting development environment..."
	docker-compose up --build

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "✓ Services started"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down
	@echo "✓ Services stopped"

# View logs
logs:
	docker-compose logs -f

# Run tests
test:
	@echo "Running backend tests..."
	pytest app/tests/ -v --cov=app
	@echo "Running frontend tests..."
	cd frontend && npm run test
	@echo "✓ All tests completed"

# Clean up
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f
	@echo "✓ Cleanup completed"

# Production deployment
prod:
	@echo "Deploying production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "✓ Production deployed"

# Backend only
backend:
	@echo "Starting backend..."
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only
frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Format code
format:
	@echo "Formatting code..."
	black app/
	cd frontend && npm run lint -- --fix
	@echo "✓ Code formatted"

# Database migrations (for future use)
migrate:
	@echo "Running database migrations..."
	# alembic upgrade head
	@echo "✓ Migrations completed"
