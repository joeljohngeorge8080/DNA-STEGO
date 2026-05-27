#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  DNA-Stego: OAuth Implementation Verification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check 1: .env file exists
echo -e "${YELLOW}[1/8]${NC} Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check for required variables
    if grep -q "GOOGLE_CLIENT_ID=" .env; then
        echo -e "${GREEN}  ✓${NC} GOOGLE_CLIENT_ID set"
    else
        echo -e "${RED}  ✗${NC} GOOGLE_CLIENT_ID not set"
    fi
    
    if grep -q "GOOGLE_CLIENT_SECRET=" .env; then
        echo -e "${GREEN}  ✓${NC} GOOGLE_CLIENT_SECRET set"
    else
        echo -e "${RED}  ✗${NC} GOOGLE_CLIENT_SECRET not set"
    fi
    
    if grep -q "JWT_SECRET=" .env; then
        echo -e "${GREEN}  ✓${NC} JWT_SECRET set"
    else
        echo -e "${RED}  ✗${NC} JWT_SECRET not set"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
    echo "   Run: cp .env.example .env"
fi

echo ""

# Check 2: Backend files
echo -e "${YELLOW}[2/8]${NC} Checking backend files..."
if [ -f app/auth/auth.py ]; then
    echo -e "${GREEN}✓${NC} app/auth/auth.py exists"
else
    echo -e "${RED}✗${NC} app/auth/auth.py missing"
fi

if [ -f app/main.py ]; then
    echo -e "${GREEN}✓${NC} app/main.py exists"
else
    echo -e "${RED}✗${NC} app/main.py missing"
fi

echo ""

# Check 3: Frontend files
echo -e "${YELLOW}[3/8]${NC} Checking frontend files..."
if [ -f frontend/src/App.jsx ]; then
    echo -e "${GREEN}✓${NC} frontend/src/App.jsx exists"
else
    echo -e "${RED}✗${NC} frontend/src/App.jsx missing"
fi

if [ -f frontend/src/context/AuthContext.jsx ]; then
    echo -e "${GREEN}✓${NC} frontend/src/context/AuthContext.jsx exists"
else
    echo -e "${RED}✗${NC} frontend/src/context/AuthContext.jsx missing"
fi

if [ -f frontend/src/pages/LoginPage.jsx ]; then
    echo -e "${GREEN}✓${NC} frontend/src/pages/LoginPage.jsx exists"
else
    echo -e "${RED}✗${NC} frontend/src/pages/LoginPage.jsx missing"
fi

echo ""

# Check 4: Docker setup
echo -e "${YELLOW}[4/8]${NC} Checking Docker configuration..."
if [ -f docker-compose.yml ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml exists"
else
    echo -e "${RED}✗${NC} docker-compose.yml missing"
fi

if [ -f frontend/Dockerfile ]; then
    echo -e "${GREEN}✓${NC} frontend/Dockerfile exists"
else
    echo -e "${RED}✗${NC} frontend/Dockerfile missing"
fi

if [ -f Dockerfile ]; then
    echo -e "${GREEN}✓${NC} Dockerfile exists"
else
    echo -e "${RED}✗${NC} Dockerfile missing"
fi

echo ""

# Check 5: Dependencies
echo -e "${YELLOW}[5/8]${NC} Checking Python dependencies..."
if grep -q "authlib" requirements.txt; then
    echo -e "${GREEN}✓${NC} authlib in requirements.txt"
else
    echo -e "${RED}✗${NC} authlib not in requirements.txt"
fi

if grep -q "httpx" requirements.txt; then
    echo -e "${GREEN}✓${NC} httpx in requirements.txt"
else
    echo -e "${RED}✗${NC} httpx not in requirements.txt"
fi

echo ""

# Check 6: OAuth callback route
echo -e "${YELLOW}[6/8]${NC} Checking OAuth callback route..."
if grep -q "auth/callback" frontend/src/App.jsx; then
    echo -e "${GREEN}✓${NC} OAuth callback route in App.jsx"
else
    echo -e "${RED}✗${NC} OAuth callback route not in App.jsx"
fi

echo ""

# Check 7: Docker containers
echo -e "${YELLOW}[7/8]${NC} Checking Docker containers..."
if command -v docker-compose &> /dev/null; then
    RUNNING=$(docker-compose ps --services --filter "status=running" 2>/dev/null | wc -l)
    if [ "$RUNNING" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Docker containers running ($RUNNING services)"
        docker-compose ps --format "table {{.Service}}\t{{.Status}}"
    else
        echo -e "${YELLOW}⚠${NC} Docker containers not running"
        echo "   Run: docker-compose up -d --build"
    fi
else
    echo -e "${YELLOW}⚠${NC} docker-compose not found"
fi

echo ""

# Check 8: Backend health
echo -e "${YELLOW}[8/8]${NC} Checking backend health..."
if command -v curl &> /dev/null; then
    HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null | grep -o "ok" | head -1)
    if [ "$HEALTH" = "ok" ]; then
        echo -e "${GREEN}✓${NC} Backend health check passed"
    else
        echo -e "${YELLOW}⚠${NC} Backend not responding (containers might need time to start)"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not found"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Next Steps:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo "1. Ensure .env file is populated with Google OAuth credentials"
echo "2. Run: docker-compose down && docker-compose up -d --build"
echo "3. Wait 10 seconds for services to start"
echo "4. Visit: http://localhost:5173"
echo "5. Click 'Sign In' and test Google OAuth flow"
echo ""
echo "See OAUTH_IMPLEMENTATION_COMPLETE.md for detailed instructions"
echo ""
