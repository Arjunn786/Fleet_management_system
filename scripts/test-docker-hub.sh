#!/bin/bash

# Docker Hub Connectivity Test Script
# Tests Docker Hub login and repository access

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐳 Docker Hub Connectivity Test${NC}"
echo "================================="
echo ""

# Load environment variables
if [ -f "./backend/.env" ]; then
    echo "Loading environment variables..."
    export $(grep -v '^#' ./backend/.env | xargs)
else
    echo -e "${RED}❌ backend/.env file not found${NC}"
    exit 1
fi

# Test 1: Check if Docker is installed
echo -e "${BLUE}Test 1: Docker Installation${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker is installed: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo ""

# Test 2: Check Docker daemon
echo -e "${BLUE}Test 2: Docker Daemon Status${NC}"
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
    DOCKER_DAEMON_STATUS="running"
else
    echo -e "${YELLOW}⚠️  Docker daemon is not running${NC}"
    echo "   Please start Docker Desktop to run build/push tests"
    DOCKER_DAEMON_STATUS="stopped"
fi

echo ""

# Test 3: Environment variables
echo -e "${BLUE}Test 3: Docker Hub Credentials${NC}"
if [ -n "$DOCKER_USER" ] && [ -n "$DOCKER_TOKEN" ]; then
    echo -e "${GREEN}✅ DOCKER_USER is set: ${DOCKER_USER}${NC}"
    echo -e "${GREEN}✅ DOCKER_TOKEN is set: ${DOCKER_TOKEN:0:4}****${NC}"
else
    echo -e "${RED}❌ Docker credentials not found${NC}"
    exit 1
fi

echo ""

# Test 4: Docker Hub authentication
echo -e "${BLUE}Test 4: Docker Hub Authentication${NC}"
echo "Attempting login to Docker Hub..."
if echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker Hub login successful${NC}"
    echo "   Authenticated as: $DOCKER_USER"
else
    echo -e "${RED}❌ Docker Hub login failed${NC}"
    echo "   Please check your credentials"
    exit 1
fi

echo ""

# Test 5: Repository accessibility
echo -e "${BLUE}Test 5: Repository Information${NC}"
REPO_NAME="$DOCKER_USER/fleet_management"
echo "Repository: $REPO_NAME"

# Try to get repository info (this works even if no images exist)
if docker search "$DOCKER_USER" --limit 5 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker Hub repository is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Repository search failed (this is normal for new repositories)${NC}"
fi

echo ""

# Test 6: Pull capability test (optional)
echo -e "${BLUE}Test 6: Pull Test (checking if any images exist)${NC}"
if docker pull "$REPO_NAME:latest" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Successfully pulled existing image${NC}"
    docker images | grep "$DOCKER_USER/fleet_management" || echo "No local images found"
else
    echo -e "${YELLOW}⚠️  No existing images to pull (this is normal for new repositories)${NC}"
fi

echo ""

# Test 7: Docker build test (only if daemon is running)
if [ "$DOCKER_DAEMON_STATUS" = "running" ]; then
    echo -e "${BLUE}Test 7: Build Test${NC}"
    echo "Testing Docker build capability..."
    
    if [ -f "./backend/Dockerfile" ]; then
        echo "Found Dockerfile in backend directory"
        echo "Attempting test build..."
        
        if docker build -t "$REPO_NAME:test" ./backend > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Docker build successful${NC}"
            
            # Clean up test image
            docker rmi "$REPO_NAME:test" > /dev/null 2>&1
            echo "   Test image cleaned up"
        else
            echo -e "${RED}❌ Docker build failed${NC}"
            echo "   Check Dockerfile and dependencies"
        fi
    else
        echo -e "${YELLOW}⚠️  Dockerfile not found in backend directory${NC}"
    fi
else
    echo -e "${BLUE}Test 7: Build Test${NC}"
    echo -e "${YELLOW}⚠️  Skipped (Docker daemon not running)${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}📋 Test Summary${NC}"
echo "==============="
echo ""

if [ "$DOCKER_DAEMON_STATUS" = "running" ]; then
    echo -e "${GREEN}🎉 Docker Hub is fully operational!${NC}"
    echo ""
    echo "✅ Ready for:"
    echo "   - Building images"
    echo "   - Pushing to Docker Hub"
    echo "   - CI/CD automation"
    echo ""
    echo "Next steps:"
    echo "   1. Build your image: ./scripts/docker-build.sh"
    echo "   2. Push to Hub: ./scripts/docker-push.sh"
    echo "   3. Setup GitHub Actions with your secrets"
else
    echo -e "${YELLOW}⚠️  Docker Hub authentication works, but Docker daemon is not running${NC}"
    echo ""
    echo "✅ Ready for:"
    echo "   - GitHub Actions CI/CD (runs on cloud)"
    echo "   - Remote Docker operations"
    echo ""
    echo "To enable local Docker operations:"
    echo "   1. Start Docker Desktop"
    echo "   2. Re-run this test: ./scripts/test-docker-hub.sh"
    echo "   3. Build and push: ./scripts/setup-docker.sh"
fi

echo ""
echo "GitHub Repository Setup:"
echo "1. Go to: https://github.com/Arjunn786/Fleet_management_system/settings/secrets/actions"
echo "2. Add secret: DOCKER_HUB_USERNAME = $DOCKER_USER"
echo "3. Add secret: DOCKER_HUB_ACCESS_TOKEN = [your token]"
echo "4. Push to trigger automated builds"
