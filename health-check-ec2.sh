#!/bin/bash

# ================================
# DNA-Stego Health Check Script
# ================================

set -e

API_URL="${1:-http://localhost:8000}"
FRONTEND_URL="${2:-http://localhost:3000}"

echo "🏥 DNA-Stego Health Check"
echo "=========================="
echo ""

# Check Backend
echo "🔍 Checking Backend..."
if curl -s -f "$API_URL/health" > /dev/null; then
    HEALTH=$(curl -s "$API_URL/health" | grep -o '"status":"[^"]*"')
    echo "✅ Backend: HEALTHY ($HEALTH)"
else
    echo "❌ Backend: UNHEALTHY or unreachable"
    exit 1
fi

# Check Frontend
echo ""
echo "🔍 Checking Frontend..."
if curl -s -f "$FRONTEND_URL" > /dev/null; then
    echo "✅ Frontend: HEALTHY"
else
    echo "❌ Frontend: UNHEALTHY or unreachable"
    exit 1
fi

# Check API endpoints
echo ""
echo "🔍 Checking API Endpoints..."

# Check if API docs are accessible (dev mode only)
if curl -s -f "$API_URL/docs" > /dev/null 2>&1; then
    echo "✅ API Docs: ACCESSIBLE (Development mode)"
fi

# Check storage
echo ""
echo "🔍 Checking Storage..."
if [ -d "./storage" ]; then
    STORAGE_SIZE=$(du -sh ./storage | cut -f1)
    echo "✅ Storage: ACCESSIBLE ($STORAGE_SIZE)"
else
    echo "⚠️  Storage: Directory not found"
fi

# Check Docker containers
echo ""
echo "🔍 Checking Docker Containers..."
if command -v docker &> /dev/null; then
    BACKEND_STATUS=$(docker-compose ps backend 2>/dev/null | grep -o "Up\|Exited" || echo "Not found")
    FRONTEND_STATUS=$(docker-compose ps frontend 2>/dev/null | grep -o "Up\|Exited" || echo "Not found")
    
    echo "  Backend:  $BACKEND_STATUS"
    echo "  Frontend: $FRONTEND_STATUS"
fi

echo ""
echo "✅ All systems operational!"
echo ""
