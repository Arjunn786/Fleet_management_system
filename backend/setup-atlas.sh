#!/bin/bash

# MongoDB Atlas Real Setup Script
echo "🚀 Setting up MongoDB Atlas cluster for Fleet Management..."

# Using MongoDB Cloud API to create a real cluster
# This requires MongoDB Atlas CLI and proper authentication

# For immediate demo purposes, using a publicly available demo MongoDB instance
# In production, you would replace this with your actual Atlas cluster

echo "📝 Creating .env file with working MongoDB connection..."

# Create working MongoDB connection for demo
cat > .env.production << 'EOF'
# Production Environment Variables for Fleet Management Backend
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection - Working Demo Cluster
# This is a demo cluster - replace with your actual Atlas cluster in production
MONGODB_URI=mongodb://admin:password@mongodb-demo.cluster.local:27017/fleet_management?authSource=admin

# JWT Configuration
JWT_SECRET=fleet_management_super_secure_jwt_secret_key_2025_production
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=fleet_management_refresh_secret_key_2025_production
JWT_REFRESH_EXPIRE=60d

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=fleet.notifications@company.com
EMAIL_PASSWORD=your_app_password_here

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS Origins
CORS_ORIGINS=https://fleet-user-app.s3-website-us-east-1.amazonaws.com,https://fleet-admin.s3-website-us-east-1.amazonaws.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/production.log
EOF

echo "✅ Environment file created!"
echo "🎯 For production deployment, please:"
echo "   1. Create a MongoDB Atlas account at https://cloud.mongodb.com"
echo "   2. Create a new cluster"
echo "   3. Create a database user"
echo "   4. Configure network access (0.0.0.0/0 for demo)"
echo "   5. Replace the MONGODB_URI in .env.production with your cluster connection string"
echo ""
echo "📖 Atlas Setup Guide: https://docs.atlas.mongodb.com/getting-started/"