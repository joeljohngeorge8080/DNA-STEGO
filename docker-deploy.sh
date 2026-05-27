#!/bin/bash

################################################################################
#                                                                              #
#                    🐳 DNA-Stego Docker Deployment Script                   #
#                                                                              #
#  This script automates Docker deployment for DNA-Stego project              #
#  Usage: ./docker-deploy.sh [local|prod|stop|logs]                          #
#                                                                              #
################################################################################

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_info "Docker is installed: $(docker --version)"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_info "Docker Compose is installed: $(docker-compose --version)"
}

# Deploy locally (development)
deploy_local() {
    print_header "🚀 Starting Local Docker Deployment (Development)"
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning ".env file not found, creating from .env.production"
        cp .env.production .env
    fi
    
    print_info "Building Docker images..."
    docker-compose build --no-cache
    
    print_info "Starting containers..."
    docker-compose up -d
    
    # Wait for containers to start
    sleep 3
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_info "Containers are running"
        echo ""
        echo "📋 Service URLs:"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://localhost:8000"
        echo "   Health:   http://localhost:8000/health"
        echo ""
        echo "📋 View logs with: docker-compose logs -f"
        echo "📋 Stop with: docker-compose down"
    else
        print_error "Failed to start containers"
        docker-compose logs
        exit 1
    fi
}

# Deploy to production
deploy_prod() {
    print_header "🚀 Starting Production Docker Deployment"
    
    # Check if .env.prod exists
    if [ ! -f .env.prod ]; then
        print_error ".env.prod file not found"
        echo "Create .env.prod from .env.production template:"
        echo "  cp .env.production .env.prod"
        echo "  nano .env.prod"
        exit 1
    fi
    
    # Check required environment variables
    if ! grep -q "DATABASE_URL" .env.prod; then
        print_error "DATABASE_URL not set in .env.prod"
        exit 1
    fi
    
    print_info "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    print_info "Starting containers in production mode..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for containers to start
    sleep 3
    
    # Check if containers are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_info "Production containers are running"
        echo ""
        echo "📋 Service URLs:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:8000"
        echo ""
        echo "📋 View logs with: docker-compose -f docker-compose.prod.yml logs -f"
        echo "📋 Stop with: docker-compose -f docker-compose.prod.yml down"
    else
        print_error "Failed to start production containers"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
}

# Stop containers
stop_containers() {
    print_header "⏹️  Stopping Docker Containers"
    
    # Determine which compose file to use
    if [ -f docker-compose.prod.yml ] && docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "dna-stego"; then
        print_info "Stopping production containers..."
        docker-compose -f docker-compose.prod.yml down
    else
        print_info "Stopping development containers..."
        docker-compose down
    fi
    
    print_info "Containers stopped successfully"
}

# View logs
view_logs() {
    print_header "📋 Docker Logs"
    
    if [ "$2" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f "$3"
    else
        docker-compose logs -f "$3"
    fi
}

# Test deployment
test_deployment() {
    print_header "🧪 Testing Deployment"
    
    echo "Testing backend health check..."
    if curl -s http://localhost:8000/health | grep -q "ok"; then
        print_info "Backend is responding"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    echo "Testing frontend..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_info "Frontend is responding"
    else
        print_error "Frontend is not responding"
        return 1
    fi
    
    print_info "All tests passed ✅"
}

# Show help
show_help() {
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  local              Deploy locally (development)"
    echo "  prod               Deploy to production"
    echo "  stop               Stop running containers"
    echo "  logs [service]     View logs (optional: backend, frontend)"
    echo "  test               Test deployment"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local           # Start development environment"
    echo "  $0 prod            # Start production environment"
    echo "  $0 stop            # Stop all containers"
    echo "  $0 logs backend    # View backend logs"
    echo "  $0 logs -f         # Follow all logs"
    echo ""
}

# Main script
main() {
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Handle commands
    case "$1" in
        local)
            deploy_local
            ;;
        prod)
            deploy_prod
            ;;
        stop)
            stop_containers
            ;;
        logs)
            view_logs "$@"
            ;;
        test)
            test_deployment
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
