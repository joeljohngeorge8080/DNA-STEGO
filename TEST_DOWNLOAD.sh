#!/bin/bash

# Test script for DNA-Stego download functionality (no jq required)

echo "=========================================="
echo "🧬 DNA-Stego Download Test"
echo "=========================================="
echo ""

# Test 1: Check if backend is running
echo "✓ Testing backend health..."
HEALTH=$(curl -s http://localhost:8000/health)
echo "Health response: $HEALTH"
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend not responding properly"
fi
echo ""

# Test 2: Encrypt a message
echo "✓ Testing encryption..."
echo "Making request to: http://localhost:8000/api/encrypt"
ENCRYPT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/encrypt \
  -F "message=hello" \
  -F "use_encryption=true")

echo "Response length: ${#ENCRYPT_RESPONSE} chars"
echo "First 200 chars: ${ENCRYPT_RESPONSE:0:200}"
echo ""

# Check if response is HTML or JSON
if echo "$ENCRYPT_RESPONSE" | grep -q "<!doctype\|<html"; then
    echo "❌ CRITICAL: Backend returned HTML instead of JSON!"
    echo "   This means the encryption endpoint is not being reached"
    echo "   Full response:"
    echo "$ENCRYPT_RESPONSE" | head -20
    echo ""
    echo "Checking if backend container is running..."
    docker-compose ps | grep backend
    echo ""
    echo "Checking backend logs..."
    docker-compose logs backend 2>&1 | tail -20
    exit 1
fi

# Extract stego file path
STEGO_FILE=$(echo "$ENCRYPT_RESPONSE" | grep -o '"stego_file":"[^"]*"' | cut -d'"' -f4)
echo "Stego file path: $STEGO_FILE"
echo ""

if [ -z "$STEGO_FILE" ]; then
    echo "❌ Could not extract stego_file from response"
    echo "Full response:"
    echo "$ENCRYPT_RESPONSE"
    exit 1
fi

# Test 3: Check if stego file exists locally
echo "✓ Checking if stego file exists locally..."
if [ -f "$STEGO_FILE" ]; then
    echo "✅ File exists: $STEGO_FILE"
    echo "   Size: $(wc -c < "$STEGO_FILE") bytes"
    echo "   First 3 lines:"
    head -3 "$STEGO_FILE"
else
    echo "❌ File not found: $STEGO_FILE"
fi
echo ""

# Test 4: Test download endpoint
echo "✓ Testing download endpoint..."
echo "URL: http://localhost:8000/api/download?path=$(echo -n "$STEGO_FILE" | sed 's/ /%20/g')"
DOWNLOAD=$(curl -v http://localhost:8000/api/download?path=$(echo -n "$STEGO_FILE" | sed 's/ /%20/g') 2>&1)

if echo "$DOWNLOAD" | grep -q "application/octet-stream"; then
    echo "✅ Download endpoint returning correct media type"
else
    echo "❌ Wrong media type returned"
    echo "Headers:"
    echo "$DOWNLOAD" | grep -i "content-type\|content-disposition" | head -5
fi

echo ""
echo "=========================================="
echo "Test complete!"
echo "=========================================="

