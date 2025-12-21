# Use official Node.js LTS image
FROM node:18-alpine

# Install Redis
RUN apk add --no-cache redis

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of ci for dev environment)
RUN npm install --omit=dev

# Copy app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Set production environment variables with MongoDB Atlas connection
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGODB_URI=mongodb+srv://fleetuser:FleetDemo2025!@fleet-cluster.6yxojag.mongodb.net/fleet_management?retryWrites=true&w=majority&appName=fleet-cluster
ENV JWT_SECRET=fleet_management_super_secure_jwt_secret_key_2025_production
ENV JWT_EXPIRE=30d
ENV BCRYPT_ROUNDS=12

# Expose port
EXPOSE 5000

# Create a startup script
RUN echo '#!/bin/sh' > /usr/src/app/start.sh && \
    echo 'redis-server --daemonize yes' >> /usr/src/app/start.sh && \
    echo 'node src/server.js' >> /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# Start Redis and Node app
CMD ["/usr/src/app/start.sh"]
