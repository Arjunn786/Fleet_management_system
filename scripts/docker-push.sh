#!/bin/bash

# Docker Push Script for FleetX Backend
# Uses environment variables for secure credential management

# Load environment variables
if [ -f "./backend/.env" ]; then
    export $(grep -v '^#' ./backend/.env | xargs)
else
    echo "❌ backend/.env file not found"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 FleetX Docker Push${NC}"
echo "===================="

# Check required environment variables
if [ -z "$DOCKER_USER" ] || [ -z "$DOCKER_TOKEN" ]; then
    echo -e "${RED}❌ Docker credentials not found in environment${NC}"
    echo "Please set DOCKER_USER and DOCKER_TOKEN in backend/.env"
    exit 1
fi

IMAGE_NAME="${DOCKER_USER}/fleet_management"
VERSION=${1:-latest}
TAG="${IMAGE_NAME}:${VERSION}"

# Check if image exists
if ! docker images | grep -q "$DOCKER_USER/fleet_management"; then
    echo -e "${RED}❌ Image not found. Build it first with: ./scripts/docker-build.sh${NC}"
    exit 1
fi

# Login to Docker Hub
echo -e "${YELLOW}Logging into Docker Hub...${NC}"
if echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

# Push the image
echo -e "${YELLOW}Pushing ${TAG}...${NC}"
if docker push "$TAG"; then
    echo -e "${GREEN}✅ Push successful: ${TAG}${NC}"
    
    # Also push latest if pushing a version
    if [ "$VERSION" != "latest" ] && docker images | grep -q "${IMAGE_NAME}.*latest"; then
        echo -e "${YELLOW}Pushing ${IMAGE_NAME}:latest...${NC}"
        if docker push "${IMAGE_NAME}:latest"; then
            echo -e "${GREEN}✅ Push successful: ${IMAGE_NAME}:latest${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Image successfully pushed to Docker Hub!${NC}"
echo "View at: https://hub.docker.com/r/${DOCKER_USER}/fleet_management"
