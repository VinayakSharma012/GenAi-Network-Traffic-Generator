#!/bin/bash

# GenAI Traffic Generator - Deployment Testing Script
# Tests all API endpoints and UI buttons

BASE_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:5173"

echo "=========================================="
echo "GenAI Traffic Generator - Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    test_count=$((test_count + 1))
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ PASS${NC} Test $test_count: $description"
        echo "  Endpoint: $method $endpoint"
        echo "  Status: $http_code"
        echo "  Response: $(echo $body | head -c 100)..."
        pass_count=$((pass_count + 1))
    else
        echo -e "${RED}✗ FAIL${NC} Test $test_count: $description"
        echo "  Endpoint: $method $endpoint"
        echo "  Status: $http_code"
        echo "  Response: $body"
        fail_count=$((fail_count + 1))
    fi
    echo ""
}

echo "Testing Backend API..."
echo "======================"
echo ""

# Test 1: Health Check
test_api "GET" "/api/health" "" "Health check endpoint"

# Test 2: Get Defaults
test_api "GET" "/api/defaults" "" "Get default configuration"

# Test 3: Get Initial Status
test_api "GET" "/api/traffic/status" "" "Get traffic status (before start)"

# Test 4: Start Traffic
test_api "POST" "/api/traffic/start" \
    '{"http_count": 2, "dns_count": 2, "smtp_count": 1, "ftp_count": 1}' \
    "Start traffic generation"

# Wait a bit for traffic to start
echo -e "${YELLOW}Waiting 2 seconds for traffic to start...${NC}"
sleep 2

# Test 5: Get Status (after start)
test_api "GET" "/api/traffic/status" "" "Get traffic status (while running)"

# Test 6: Get Metrics (after generation)
echo -e "${YELLOW}Waiting 3 seconds for traffic to generate metrics...${NC}"
sleep 3
test_api "GET" "/api/metrics" "" "Get traffic metrics"

# Test 7: Get Logs
test_api "GET" "/api/logs" "" "Get traffic logs"

# Test 8: Stop Traffic
test_api "POST" "/api/traffic/stop" "" "Stop traffic generation"

# Test 9: Verify Stopped
test_api "GET" "/api/traffic/status" "" "Verify traffic stopped"

# Test 10: Start Traffic Again (for UI testing)
test_api "POST" "/api/traffic/start" \
    '{"http_count": 3, "dns_count": 3}' \
    "Start traffic again (for UI testing)"

echo ""
echo "=========================================="
echo "Frontend Accessibility Check"
echo "=========================================="
echo ""

# Check if frontend is running
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$frontend_response" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible at $FRONTEND_URL${NC}"
else
    echo -e "${RED}✗ Frontend is not accessible at $FRONTEND_URL${NC}"
    echo "  Start frontend with: cd frontend && npm run dev"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open browser to $FRONTEND_URL"
    echo "2. Test UI button functions:"
    echo "   - Click 'LAUNCH TRAFFIC GENERATION' on Traffic Generator page"
    echo "   - Verify live data updates on Dashboard"
    echo "   - Click 'STOP' button in header"
    echo "   - Export config on Configuration page"
    echo "3. Check browser console (F12) for any errors"
else
    echo -e "${RED}Some tests failed. Check backend setup.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure backend is running: /Users/vinayaksharma/genai-project/.venv/bin/python backend/api.py"
    echo "2. Check if main.py exists in backend directory"
    echo "3. Verify Flask dependencies are installed"
    echo "4. Check for CORS errors in browser console"
fi

echo ""
echo "=========================================="
