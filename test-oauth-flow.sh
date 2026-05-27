#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DNA-Stego: OAuth & API Test Suite                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

# Check 1: Backend health
echo -e "${YELLOW}[1/5]${NC} Testing backend health..."
HEALTH=$(curl -s http://localhost:8000/health)
if echo "$HEALTH" | grep -q "healthy\|ok"; then
    echo -e "${GREEN}✓${NC} Backend is healthy"
else
    echo -e "${RED}✗${NC} Backend not responding"
    echo "Response: $HEALTH"
    exit 1
fi

# Check 2: Encryption endpoint (form data)
echo -e "\n${YELLOW}[2/5]${NC} Testing encryption endpoint..."
ENCRYPT=$(curl -s -X POST http://localhost:8000/api/encrypt \
  -F "message=Test message for DNA steganography" \
  -F "use_encryption=true")

if echo "$ENCRYPT" | grep -q "stego_file"; then
    echo -e "${GREEN}✓${NC} Encryption works"
    echo "Response: $ENCRYPT" | head -c 100
    echo "..."
    
    # Extract filename
    FILENAME=$(echo "$ENCRYPT" | grep -o '"stego_file":"[^"]*' | cut -d'"' -f4)
    echo "Created file: $FILENAME"
else
    echo -e "${RED}✗${NC} Encryption failed"
    echo "Response: $ENCRYPT"
fi

# Check 3: Download endpoint
echo -e "\n${YELLOW}[3/5]${NC} Testing download endpoint..."
if [ -n "$FILENAME" ]; then
    DOWNLOAD=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
      "http://localhost:8000/api/download?filename=$FILENAME" \
      -o /tmp/test_download.fasta)
    
    STATUS=$(echo "$DOWNLOAD" | grep "HTTP_STATUS" | cut -d':' -f2)
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✓${NC} Download endpoint works (HTTP $STATUS)"
        echo "File size: $(wc -c < /tmp/test_download.fasta) bytes"
        echo "First 3 lines:"
        head -3 /tmp/test_download.fasta
    else
        echo -e "${RED}✗${NC} Download failed (HTTP $STATUS)"
    fi
else
    echo -e "${YELLOW}⊘${NC} Skipped (no stego file from encryption)"
fi

# Check 4: Frontend availability
echo -e "\n${YELLOW}[4/5]${NC} Testing frontend availability..."
FRONTEND=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:5173 -o /dev/null)
STATUS=$(echo "$FRONTEND" | grep "HTTP_STATUS" | cut -d':' -f2)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} Frontend is serving (HTTP $STATUS)"
else
    echo -e "${YELLOW}⊘${NC} Frontend not responding (HTTP $STATUS)"
fi

# Check 5: OAuth endpoint (should redirect)
echo -e "\n${YELLOW}[5/5]${NC} Testing OAuth endpoints..."
LOGIN=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:8000/auth/google/login -o /dev/null)
STATUS=$(echo "$LOGIN" | grep "HTTP_STATUS" | cut -d':' -f2)
if [ "$STATUS" = "307" ] || [ "$STATUS" = "302" ]; then
    echo -e "${GREEN}✓${NC} OAuth login redirects correctly (HTTP $STATUS)"
else
    echo -e "${RED}✗${NC} OAuth endpoint failed (HTTP $STATUS)"
fi

echo -e "\n${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test Results                                           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✓ Basic API tests complete!${NC}"
echo ""
echo "Next: Test OAuth flow in browser:"
echo "  1. Open: http://localhost:5173"
echo "  2. Click: 'Sign In'"
echo "  3. Click: 'Continue with Google'"
echo "  4. Login with your Google account"
echo "  5. Should see dashboard with your profile"
echo ""
