#!/bin/bash

# Complete FleetX Development Setup Script
# Sets up the entire development environment with proper security

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🚀 FleetX Development Environment Setup"
echo "======================================"
echo -e "${NC}"

# Function to create environment file from example
setup_env_file() {
    local example_file=$1
    local target_file=$2
    local description=$3
    
    echo -e "${YELLOW}Setting up $description...${NC}"
    
    if [ -f "$target_file" ]; then
        echo "✅ $target_file already exists"
    else
        if [ -f "$example_file" ]; then
            cp "$example_file" "$target_file"
            echo "✅ Created $target_file from template"
            echo -e "${YELLOW}⚠️  Please edit $target_file with your actual values${NC}"
        else
            echo -e "${RED}❌ Template file $example_file not found${NC}"
            return 1
        fi
    fi
}

echo "📁 Setting up environment files..."
echo ""

# Setup backend environment
setup_env_file "backend/.env.example" "backend/.env" "Backend Environment"

# Setup admin portal environment
setup_env_file "admin-portal/.env.example" "admin-portal/.env.local" "Admin Portal Environment"

# Setup user app environment
setup_env_file "user-app/.env.example" "user-app/.env.local" "User App Environment"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
if cd backend && npm install; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    cd ..
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
fi

# Install admin portal dependencies
echo "Installing admin portal dependencies..."
if cd admin-portal && npm install; then
    echo -e "${GREEN}✅ Admin portal dependencies installed${NC}"
    cd ..
else
    echo -e "${RED}❌ Failed to install admin portal dependencies${NC}"
fi

# Install user app dependencies
echo "Installing user app dependencies..."
if cd user-app && npm install; then
    echo -e "${GREEN}✅ User app dependencies installed${NC}"
    cd ..
else
    echo -e "${RED}❌ Failed to install user app dependencies${NC}"
fi

echo ""
echo "🔍 Validating environment..."
echo ""

# Run environment validation
if [ -f "./scripts/validate-env.sh" ]; then
    ./scripts/validate-env.sh
else
    echo -e "${RED}❌ Environment validation script not found${NC}"
fi

echo ""
echo "🔒 Security Setup"
echo "=================="
echo ""

echo -e "${YELLOW}Important Security Notes:${NC}"
echo "1. ✅ .gitignore is configured to exclude .env files"
echo "2. ⚠️  Edit your .env files with real credentials"
echo "3. 🔐 Never commit .env files to Git"
echo "4. 📖 Read SECURITY.md for detailed security guidelines"
echo ""

echo "📋 Next Steps"
echo "============="
echo ""
echo -e "${BLUE}1. Edit Environment Files:${NC}"
echo "   - backend/.env (MongoDB URI, JWT secrets, Docker credentials)"
echo "   - admin-portal/.env.local (API URL)"
echo "   - user-app/.env.local (API URL)"
echo ""

echo -e "${BLUE}2. Start Development Servers:${NC}"
echo "   Backend:      cd backend && npm run dev"
echo "   Admin Portal: cd admin-portal && npm run dev"
echo "   User App:     cd user-app && npm run dev"
echo ""

echo -e "${BLUE}3. Docker Setup (optional):${NC}"
echo "   - Start Docker Desktop"
echo "   - Run: ./scripts/setup-docker.sh"
echo ""

echo -e "${BLUE}4. GitHub Setup:${NC}"
echo "   - Add secrets to GitHub repository"
echo "   - See .github/CICD_SETUP.md for details"
echo ""

echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Your FleetX development environment is ready."
echo "Remember to keep your secrets secure! 🔐"
echo ""
echo "Need help? Check these files:"
echo "- README.md - Project overview"
echo "- SECURITY.md - Security guidelines"
echo "- DOCKER_SETUP.md - Docker configuration"
echo "- .github/CICD_SETUP.md - CI/CD setup"
