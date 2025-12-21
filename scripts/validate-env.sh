#!/bin/bash

# Environment Validation Script for FleetX
# Checks that all required environment variables are properly set

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 FleetX Environment Validation${NC}"
echo "================================"
echo ""

# Function to check if a variable is set and not empty
check_var() {
    local var_name=$1
    local var_value=$2
    local required=${3:-true}
    
    if [ -z "$var_value" ]; then
        if [ "$required" = true ]; then
            echo -e "${RED}❌ $var_name is not set or empty${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  $var_name is not set (optional)${NC}"
            return 0
        fi
    else
        # Mask sensitive values
        if [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"TOKEN"* ]] || [[ "$var_name" == *"PASSWORD"* ]]; then
            local masked_value="${var_value:0:4}****"
            echo -e "${GREEN}✅ $var_name is set: $masked_value${NC}"
        else
            echo -e "${GREEN}✅ $var_name is set: $var_value${NC}"
        fi
        return 0
    fi
}

# Check backend environment
echo -e "${BLUE}📦 Backend Environment${NC}"
if [ -f "./backend/.env" ]; then
    echo "Loading backend/.env..."
    export $(grep -v '^#' ./backend/.env | xargs)
    
    check_var "MONGODB_URI" "$MONGODB_URI"
    check_var "JWT_ACCESS_SECRET" "$JWT_ACCESS_SECRET"
    check_var "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET"
    check_var "PORT" "$PORT"
    check_var "NODE_ENV" "$NODE_ENV"
    check_var "DOCKER_USER" "$DOCKER_USER"
    check_var "DOCKER_TOKEN" "$DOCKER_TOKEN"
    check_var "REDIS_URL" "$REDIS_URL" false
    check_var "CORS_ORIGIN" "$CORS_ORIGIN" false
else
    echo -e "${RED}❌ backend/.env not found${NC}"
fi

echo ""

# Check admin portal environment
echo -e "${BLUE}🏢 Admin Portal Environment${NC}"
if [ -f "./admin-portal/.env.local" ]; then
    echo "Loading admin-portal/.env.local..."
    export $(grep -v '^#' ./admin-portal/.env.local | xargs)
    
    check_var "VITE_API_URL" "$VITE_API_URL"
    check_var "VITE_NODE_ENV" "$VITE_NODE_ENV" false
else
    echo -e "${RED}❌ admin-portal/.env.local not found${NC}"
fi

echo ""

# Check user app environment
echo -e "${BLUE}👥 User App Environment${NC}"
if [ -f "./user-app/.env.local" ]; then
    echo "Loading user-app/.env.local..."
    export $(grep -v '^#' ./user-app/.env.local | xargs)
    
    check_var "NEXT_PUBLIC_API_URL" "$NEXT_PUBLIC_API_URL"
    check_var "NODE_ENV" "$NODE_ENV" false
else
    echo -e "${RED}❌ user-app/.env.local not found${NC}"
fi

echo ""

# Check Docker connectivity
echo -e "${BLUE}🐳 Docker Environment${NC}"
if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is running${NC}"
        
        # Test Docker login if credentials are available
        if [ -n "$DOCKER_USER" ] && [ -n "$DOCKER_TOKEN" ]; then
            echo -e "${YELLOW}Testing Docker Hub login...${NC}"
            if echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Docker Hub authentication successful${NC}"
            else
                echo -e "${RED}❌ Docker Hub authentication failed${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Docker is not running${NC}"
    fi
else
    echo -e "${RED}❌ Docker is not installed${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}📋 Summary${NC}"
echo "=========="

if [ -f "./backend/.env" ] && [ -f "./admin-portal/.env.local" ] && [ -f "./user-app/.env.local" ]; then
    echo -e "${GREEN}✅ All environment files present${NC}"
else
    echo -e "${RED}❌ Some environment files are missing${NC}"
    echo ""
    echo "To create missing files:"
    echo "cp backend/.env.example backend/.env"
    echo "cp admin-portal/.env.example admin-portal/.env.local"
    echo "cp user-app/.env.example user-app/.env.local"
fi

echo ""
echo "For security information, see: SECURITY.md"
echo "For Docker setup, run: ./scripts/setup-docker.sh"
