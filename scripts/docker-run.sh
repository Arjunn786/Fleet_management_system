#!/bin/bash

# Docker Run Script for FleetX Backend
# Uses environment variables for configuration

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

echo -e "${BLUE}🐳 FleetX Docker Run${NC}"
echo "==================="

IMAGE_NAME="${DOCKER_USER}/fleet_management"
VERSION=${1:-latest}
TAG="${IMAGE_NAME}:${VERSION}"
CONTAINER_NAME="fleetx-backend"

# Stop existing container if running
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${YELLOW}Stopping existing container...${NC}"
    docker stop "$CONTAINER_NAME"
fi

# Remove existing container
if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo -e "${YELLOW}Removing existing container...${NC}"
    docker rm "$CONTAINER_NAME"
fi

# Check if image exists locally
if ! docker images | grep -q "$DOCKER_USER/fleet_management"; then
    echo -e "${YELLOW}Image not found locally. Pulling from Docker Hub...${NC}"
    docker pull "$TAG"
fi

echo -e "${YELLOW}Starting container: ${TAG}${NC}"
echo ""

# Run the container
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 5000:5000 \
    -e NODE_ENV="${NODE_ENV:-production}" \
    -e MONGODB_URI="$MONGODB_URI" \
    -e JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET" \
    -e JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
    -e REDIS_URL="$REDIS_URL" \
    -e PORT="${PORT:-5000}" \
    -e CORS_ORIGIN="$CORS_ORIGIN" \
    "$TAG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    echo ""
    echo "Container details:"
    docker ps | grep "$CONTAINER_NAME"
    echo ""
    echo "Useful commands:"
    echo "- View logs: docker logs $CONTAINER_NAME"
    echo "- Stop container: docker stop $CONTAINER_NAME"
    echo "- Access container: docker exec -it $CONTAINER_NAME sh"
    echo "- API health check: curl http://localhost:5000"
else
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi
