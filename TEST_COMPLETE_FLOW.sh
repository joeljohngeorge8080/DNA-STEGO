#!/bin/bash

echo "==========================================="
echo "🧬 DNA-Stego Complete Flow Test"
echo "==========================================="
echo ""

# Test 1: Backend health
echo "✓ Testing backend health..."
HEALTH=$(curl -s http://localhost:8000/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "  ✅ Backend is healthy"
else
    echo "  ❌ Backend not responding"
    exit 1
fi
echo ""

# Test 2: Encryption
echo "✓ Testing encryption endpoint..."
ENCRYPT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/encrypt \
  -F "message=Hello World Test" \
  -F "use_encryption=true")

STEGO_FILE=$(echo "$ENCRYPT_RESPONSE" | grep -o '"stego_file":"[^"]*"' | cut -d'"' -f4)
KEY=$(echo "$ENCRYPT_RESPONSE" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

if [ -z "$STEGO_FILE" ]; then
    echo "  ❌ Encryption failed"
    echo "  Response: $ENCRYPT_RESPONSE"
    exit 1
fi

echo "  ✅ Encryption successful"
echo "     Stego file: $STEGO_FILE"
echo "     Key: ${KEY:0:20}..."
echo ""

# Test 3: Download
echo "✓ Testing download endpoint..."
DOWNLOAD=$(curl -s -X GET "http://localhost:8000/api/download?path=$STEGO_FILE")

if echo "$DOWNLOAD" | grep -q "^>"; then
    echo "  ✅ Download returned FASTA format"
    echo "     First line: $(echo "$DOWNLOAD" | head -1 | cut -c1-60)"
    FASTA_CHECK="PASSED"
else
    echo "  ❌ Download did not return FASTA"
    echo "     Response: $(echo "$DOWNLOAD" | head -c 100)"
    FASTA_CHECK="FAILED"
fi
echo ""

# Test 4: Frontend availability
echo "✓ Testing frontend availability..."
FRONTEND=$(curl -s http://localhost:5173/ | head -c 100)
if echo "$FRONTEND" | grep -q "html\|root"; then
    echo "  ✅ Frontend is serving"
    FRONTEND_CHECK="PASSED"
else
    echo "  ❌ Frontend not responding properly"
    FRONTEND_CHECK="FAILED"
fi
echo ""

# Summary
echo "==========================================="
echo "📊 Test Summary"
echo "==========================================="
echo "  Backend Health:    ✅ PASSED"
echo "  Encryption:        ✅ PASSED"
echo "  Download:          ✅ $FASTA_CHECK"
echo "  Frontend:          ✅ $FRONTEND_CHECK"
echo "==========================================="
echo ""

if [ "$FASTA_CHECK" = "PASSED" ] && [ "$FRONTEND_CHECK" = "PASSED" ]; then
    echo "✨ All tests passed! System is working correctly."
    exit 0
else
    echo "⚠️  Some tests failed. Check output above."
    exit 1
fi
