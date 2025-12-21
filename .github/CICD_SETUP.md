# FleetX CI/CD Setup Guide

This guide explains how to set up the CI/CD pipeline for the FleetX system using GitHub Actions, Docker Hub, and AWS.

## Docker Hub Configuration

### 1. Docker Hub Repository
- **Repository Name**: `fleet_management`
- **Full Image Path**: `arjun6111/fleet_management`
- **Visibility**: Public (appears in Docker Hub search results)

### 2. Required Docker Hub Secrets
Add these secrets in your GitHub repository settings (`Settings` > `Secrets and variables` > `Actions`):

```
DOCKER_HUB_USERNAME=arjun6111
DOCKER_HUB_ACCESS_TOKEN=<your-docker-hub-access-token>
```

To create a Docker Hub access token:
1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token and add it to GitHub secrets

## AWS Configuration (Optional)

If you want to deploy to AWS ECS and S3, add these secrets:

```
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
USER_APP_DISTRIBUTION_ID=<cloudfront-distribution-id-for-user-app>
ADMIN_PORTAL_DISTRIBUTION_ID=<cloudfront-distribution-id-for-admin>
```

## Environment Variables

The following environment variables are configured in the workflows:

### Docker Configuration
- `DOCKER_REGISTRY`: docker.io
- `DOCKER_REPOSITORY`: arjun6111/fleet_management

### AWS Configuration (if using AWS deployment)
- `AWS_REGION`: us-east-1
- `ECS_CLUSTER`: fleetx-cluster
- `ECS_SERVICE`: fleetx-backend-service
- `USER_APP_BUCKET`: fleetx-user-app
- `ADMIN_PORTAL_BUCKET`: fleetx-admin-portal

## Workflow Files

### 1. `docker.yml` - Docker Hub Operations
- Builds and pushes Docker images to Docker Hub
- Supports multi-platform builds (linux/amd64, linux/arm64)
- Runs on: push to main/master, tags, and pull requests
- Tags: latest, branch name, SHA, semantic versions

### 2. `deploy.yml` - Full Deployment Pipeline
- Deploys backend to ECS (using Docker image from Docker Hub)
- Deploys user app to S3 (static Next.js build)
- Deploys admin portal to S3 (static React build)
- Invalidates CloudFront distributions

## Manual Docker Commands

You can also manually push images using these commands:

```bash
# Build the image
docker build -t arjun6111/fleet_management:latest ./backend

# Tag with specific version
docker tag arjun6111/fleet_management:latest arjun6111/fleet_management:v1.0.0

# Push to Docker Hub
docker push arjun6111/fleet_management:latest
docker push arjun6111/fleet_management:v1.0.0
```

## ECS Task Definition

If using AWS ECS, update your task definition to use the Docker Hub image:

```json
{
  "family": "fleetx-backend",
  "containerDefinitions": [
    {
      "name": "fleetx-backend",
      "image": "arjun6111/fleet_management:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "/fleetx/mongodb-uri"
        },
        {
          "name": "JWT_ACCESS_SECRET",
          "valueFrom": "/fleetx/jwt-access-secret"
        },
        {
          "name": "JWT_REFRESH_SECRET",
          "valueFrom": "/fleetx/jwt-refresh-secret"
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "memory": "512",
  "cpu": "256"
}
```

## Triggering Deployments

### Automatic Triggers
- Push to `main` or `master` branch
- Creating version tags (e.g., `v1.0.0`)
- Manual trigger via GitHub Actions UI

### Manual Deployment
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy FleetX System" workflow
4. Click "Run workflow"

## Monitoring

After deployment, you can monitor:
- **Docker Hub**: Check image builds and download stats
- **GitHub Actions**: View build logs and deployment status
- **AWS CloudWatch**: Monitor ECS service health and logs
- **AWS S3**: Verify static file deployments

## Troubleshooting

### Common Issues

1. **Docker Hub authentication failed**
   - Verify `DOCKER_HUB_USERNAME` and `DOCKER_HUB_ACCESS_TOKEN` secrets
   - Ensure access token has write permissions

2. **AWS deployment failed**
   - Check AWS credentials and permissions
   - Verify ECS cluster and service names exist

3. **Build failed**
   - Check backend Dockerfile syntax
   - Verify all dependencies are properly defined

### Debug Commands

```bash
# Test Docker build locally
docker build -t test-image ./backend

# Test image run
docker run -p 5000:5000 test-image

# Check image layers
docker history arjun6111/fleet_management:latest
```
