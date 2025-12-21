# 🔐 Security and Environment Variables Guide

## ⚠️ IMPORTANT: Never Commit Secrets to Git!

This guide explains how to properly manage environment variables and secrets for the FleetX system.

## 🗂️ Environment File Structure

```
fleet-management/
├── backend/
│   ├── .env.example          # Template file (safe to commit)
│   └── .env                  # Your secrets (NEVER commit)
├── admin-portal/
│   ├── .env.example          # Template file (safe to commit)
│   └── .env.local            # Your secrets (NEVER commit)
├── user-app/
│   ├── .env.example          # Template file (safe to commit)
│   └── .env.local            # Your secrets (NEVER commit)
└── .gitignore                # Excludes all .env files
```

## 🛠️ Setup Instructions

### 1. Backend Environment
```bash
# Copy the template
cp backend/.env.example backend/.env

# Edit with your actual values
nano backend/.env
```

**Required variables:**
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
DOCKER_USER=your_docker_username
DOCKER_TOKEN=your_docker_access_token
```

### 2. Admin Portal Environment
```bash
# Copy the template
cp admin-portal/.env.example admin-portal/.env.local

# Edit with your values
nano admin-portal/.env.local
```

### 3. User App Environment
```bash
# Copy the template
cp user-app/.env.example user-app/.env.local

# Edit with your values
nano user-app/.env.local
```

## 🐳 Docker Commands with Environment Variables

### Using the Scripts (Recommended)
```bash
# Build image
./scripts/docker-build.sh

# Push to registry
./scripts/docker-push.sh

# Run container
./scripts/docker-run.sh
```

### Manual Commands
```bash
# Load environment variables
source backend/.env

# Login to Docker Hub
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin

# Build and push
docker build -t "$DOCKER_USER/fleet_management:latest" ./backend
docker push "$DOCKER_USER/fleet_management:latest"
```

## 🚀 GitHub Actions Setup

### Required Repository Secrets
Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Add these secrets:
```
DOCKER_HUB_USERNAME=arjun6111
DOCKER_HUB_ACCESS_TOKEN=dckr_pat_your_token_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### Environment Variables in Workflows
Our GitHub Actions workflows reference secrets safely:
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_HUB_USERNAME }}
    password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
```

## 🔒 Security Best Practices

### ✅ DO:
- Use `.env.example` files as templates
- Set appropriate file permissions: `chmod 600 .env`
- Use strong, randomly generated secrets
- Rotate credentials regularly
- Use GitHub repository secrets for CI/CD
- Use environment-specific configurations

### ❌ DON'T:
- Commit `.env` files to Git
- Share credentials in chat or email
- Use weak or default passwords
- Hardcode secrets in source code
- Use production credentials in development

## 🎯 Environment-Specific Configurations

### Development
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production
```bash
NODE_ENV=production
VITE_API_URL=https://your-production-api.com
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

### Testing
```bash
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/fleetx_test
```

## 🚨 What to Do If Secrets Are Compromised

1. **Immediately rotate all affected credentials**
2. **Remove from Git history if committed:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch path/to/file' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Update GitHub repository secrets**
4. **Redeploy all affected services**
5. **Monitor for unauthorized access**

## 🔍 Checking for Exposed Secrets

### GitHub Secret Scanning
GitHub automatically scans for exposed secrets. If you see warnings:
1. Immediately rotate the exposed credentials
2. Update repository secrets
3. The warning will be dismissed after rotation

### Local Scanning
```bash
# Check for potential secrets in code
grep -r "password\|secret\|token\|key" --exclude-dir=node_modules .

# Check git history for accidents
git log --all --grep="password\|secret\|token" --oneline
```

## 📋 Deployment Checklist

- [ ] All `.env.example` files are up to date
- [ ] No `.env` files committed to Git
- [ ] GitHub repository secrets configured
- [ ] Production credentials are different from development
- [ ] All team members have their own credentials
- [ ] Monitoring and logging configured
- [ ] Backup and recovery procedures tested

## 🆘 Troubleshooting

### "Error: Cannot find module 'dotenv'"
```bash
cd backend && npm install dotenv
```

### "Docker login failed"
```bash
# Check environment variables
echo $DOCKER_USER
echo $DOCKER_TOKEN  # Should show your token

# Test login manually
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
```

### "GitHub Actions secret not found"
1. Check secret name matches workflow exactly
2. Ensure you have admin access to repository
3. Verify secret value is not empty

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for help rather than taking shortcuts! 🛡️
