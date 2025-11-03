# Gift Tracker - Deployment Guide

Complete guide for deploying Gift Tracker to AWS EC2 with CI/CD using GitHub Actions.

## 🏗️ Architecture Overview

- **Frontend**: React app served by Nginx (Port 80)
- **Backend**: Node.js/Express API (Port 5000)
- **Database**: MongoDB Atlas (Cloud)
- **Container Registry**: GitHub Container Registry (GHCR)
- **CI/CD**: GitHub Actions
- **Server**: AWS EC2 (Ubuntu)

## 📋 Prerequisites

1. AWS EC2 instance running Ubuntu (t2.micro or larger)
2. MongoDB Atlas cluster (free tier works)
3. GitHub repository with Actions enabled
4. SSH key pair for server access
5. Docker installed on EC2 instance

## 🚀 Initial Server Setup

### 1. Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@54.88.64.190
```

### 2. Run Setup Script

```bash
# Download and run the setup script
curl -o setup-server.sh https://raw.githubusercontent.com/YOUR_USERNAME/gift-tracker/main/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

Or manually:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p ~/gift-tracker
cd ~/gift-tracker

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable
```

### 3. Configure Environment Variables

Create `.env.production` file on the server:

```bash
cd ~/gift-tracker
nano .env.production
```

Add the following content:

```env
# GitHub Container Registry
GITHUB_REPOSITORY_OWNER=your-github-username

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gift-tracker?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origin (your frontend URL)
CORS_ORIGIN=http://54.88.64.190
```

**Important**: Replace all placeholder values with your actual credentials.

## 🔐 GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

2. Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Your EC2 SSH private key | Contents of your `.pem` file |
| `SERVER_IP` | Your EC2 instance IP | `54.88.64.190` |

### Getting Your SSH Private Key

```bash
# On your local machine
cat your-key.pem
# Copy the entire output including BEGIN and END lines
```

## 📦 GitHub Container Registry Setup

### 1. Make Packages Public (Recommended for simplicity)

1. Go to your GitHub profile → `Packages`
2. Find `gift-tracker-backend` and `gift-tracker-frontend`
3. Click on each package → `Package settings`
4. Scroll down to `Danger Zone` → `Change visibility` → `Public`

### 2. Alternative: Use Personal Access Token (PAT)

If you prefer private packages:

1. Create a PAT with `read:packages` scope
2. Add it as a GitHub secret: `GHCR_TOKEN`
3. Update the workflow to use this token instead of `GITHUB_TOKEN`

## 🔄 Database Migration Strategy

### How Migrations Work

The system uses a migration tracking approach:

1. **Migration Files**: Located in `server/src/scripts/migrate.ts`
2. **Migration Tracking**: Stored in MongoDB `migrations` collection
3. **Automatic Execution**: Runs during deployment before starting the app
4. **Idempotent**: Safe to run multiple times

### Adding New Migrations

When you change the database schema:

1. Edit `server/src/scripts/migrate.ts`
2. Add a new migration object:

```typescript
{
  version: '003',
  description: 'Add new field to users',
  up: async () => {
    const User = mongoose.model('User');
    await User.updateMany(
      { newField: { $exists: false } },
      { $set: { newField: 'default value' } }
    );
  },
  down: async () => {
    const User = mongoose.model('User');
    await User.updateMany(
      {},
      { $unset: { newField: '' } }
    );
  },
}
```

3. Commit and push to main
4. CI/CD will automatically run the migration during deployment

### Manual Migration Execution

If needed, you can run migrations manually:

```bash
# On the server
cd ~/gift-tracker
export $(cat .env.production | xargs)

docker run --rm \
  -e MONGODB_URI="${MONGODB_URI}" \
  -e NODE_ENV=production \
  ghcr.io/your-username/gift-tracker-backend:latest \
  npm run migrate:build
```

## 🚢 Deployment Process

### Automatic Deployment (Recommended)

Every push to `main` branch triggers automatic deployment:

1. **Test**: Runs backend tests
2. **Build**: Builds Docker images for frontend and backend
3. **Push**: Pushes images to GitHub Container Registry
4. **Migrate**: Runs database migrations
5. **Deploy**: Deploys to EC2 server
6. **Verify**: Checks health endpoints

### Manual Deployment

If you need to deploy manually:

```bash
# On the server
cd ~/gift-tracker
./scripts/manual-deploy.sh
```

## 🔍 Monitoring and Troubleshooting

### Check Service Status

```bash
# On the server
cd ~/gift-tracker
docker-compose -f docker-compose.prod.yml ps
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Backend only
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend only
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Health Check Endpoints

- **Frontend**: http://54.88.64.190/health
- **Backend**: http://54.88.64.190:5000/api/health

```bash
# Check from server
curl http://localhost:80/health
curl http://localhost:5000/api/health
```

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check if port is in use
sudo netstat -tulpn | grep :5000
```

#### 2. Database Connection Failed

```bash
# Verify MongoDB URI
cat .env.production | grep MONGODB_URI

# Test connection
docker run --rm -e MONGODB_URI="your-uri" \
  ghcr.io/your-username/gift-tracker-backend:latest \
  node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

#### 3. GitHub Actions Deployment Failed

- Check GitHub Actions logs in your repository
- Verify SSH key is correct
- Ensure `.env.production` exists on server
- Check server firewall rules

## 🔄 Rollback Procedure

If a deployment causes issues:

```bash
# On the server
cd ~/gift-tracker

# Find the commit SHA you want to rollback to
# (Check GitHub commits or Actions history)

# Run rollback script
./scripts/rollback.sh abc123def456
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env.production` to git
2. **SSH Keys**: Keep your private keys secure
3. **JWT Secret**: Use a strong random string (32+ characters)
4. **MongoDB**: Use strong passwords and IP whitelist in Atlas
5. **Firewall**: Only open necessary ports
6. **HTTPS**: Consider adding SSL certificate (Let's Encrypt)

## 📊 Performance Optimization

### Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com

# Update docker-compose.prod.yml to expose port 443
```

### Database Indexing

Ensure indexes are created for optimal performance:

```javascript
// Already implemented in models
User: email (unique), wishlists._id
Friend: userId + friendId (compound, unique)
```

## 🧪 Testing the Deployment

### 1. Smoke Tests

```bash
# Frontend
curl http://54.88.64.190/

# Backend API
curl http://54.88.64.190:5000/api/health

# Test registration
curl -X POST http://54.88.64.190:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'
```

### 2. Full Integration Test

1. Open http://54.88.64.190 in browser
2. Register a new account
3. Create a wishlist
4. Add items
5. Test friend system
6. Verify all features work

## 📝 Maintenance Tasks

### Update Dependencies

```bash
# Locally
cd server && npm update
cd ../client && npm update

# Test locally
npm test

# Commit and push to trigger deployment
git add .
git commit -m "chore: update dependencies"
git push origin main
```

### Database Backup

```bash
# MongoDB Atlas provides automatic backups
# To create manual backup:
# 1. Go to Atlas dashboard
# 2. Select your cluster
# 3. Click "Backup" tab
# 4. Create on-demand snapshot
```

### Clean Up Old Docker Images

```bash
# On the server (runs automatically in CI/CD)
docker image prune -af --filter "until=24h"
```

## 🎯 Next Steps

1. **Domain Name**: Point a domain to your EC2 IP
2. **HTTPS**: Set up SSL certificate with Let's Encrypt
3. **Monitoring**: Add application monitoring (e.g., Sentry, DataDog)
4. **Backups**: Set up automated database backups
5. **Scaling**: Consider load balancer for multiple instances
6. **CDN**: Use CloudFront for static assets

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check GitHub Actions workflow logs
4. Review this documentation
5. Check MongoDB Atlas connection

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
