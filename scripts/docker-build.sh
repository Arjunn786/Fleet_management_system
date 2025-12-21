#!/bin/bash

# Docker Build Script for FleetX Backend
# Uses environment variables for secure credential management

# Load environment variables
if [ -f "./backend/.env" ]; then
    export $(grep -v '^#' ./backend/.env | xargs)
else
    echo "❌ backend/.env file not found"
    echo "Please create backend/.env from backend/.env.example"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐳 FleetX Docker Build${NC}"
echo "======================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Check required environment variables
if [ -z "$DOCKER_USER" ]; then
    echo -e "${RED}❌ DOCKER_USER not set in environment${NC}"
    exit 1
fi

IMAGE_NAME="${DOCKER_USER}/fleet_management"
VERSION=${1:-latest}
TAG="${IMAGE_NAME}:${VERSION}"

echo -e "${YELLOW}Building image: ${TAG}${NC}"
echo ""

# Build the Docker image
if docker build -t "$TAG" ./backend; then
    echo -e "${GREEN}✅ Build successful: ${TAG}${NC}"
    
    # Also tag as latest if building a version
    if [ "$VERSION" != "latest" ]; then
        docker tag "$TAG" "${IMAGE_NAME}:latest"
        echo -e "${GREEN}✅ Tagged as latest${NC}"
    fi
    
    # Show image info
    echo ""
    echo "Image details:"
    docker images | grep "$DOCKER_USER/fleet_management"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "Next steps:"
echo "- Test locally: docker run -p 5000:5000 ${TAG}"
echo "- Push to registry: ./scripts/docker-push.sh ${VERSION}"
