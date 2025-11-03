# 🚀 Deployment Quick Start Guide

Fast track guide to deploy Gift Tracker to AWS EC2.

## ⚡ 5-Minute Setup

### 1. Server Setup (One-time)

SSH into your EC2 instance and run:

```bash
# Download and run setup script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p ~/gift-tracker
cd ~/gift-tracker

# Create environment file
nano .env.production
```

Paste this into `.env.production`:

```env
GITHUB_REPOSITORY_OWNER=YOUR_GITHUB_USERNAME
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gift-tracker?retryWrites=true&w=majority
JWT_SECRET=GENERATE_A_STRONG_RANDOM_STRING_HERE
CORS_ORIGIN=http://54.88.64.190
```

Save and exit (Ctrl+X, Y, Enter).

### 2. GitHub Secrets Setup

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these two secrets:

**SSH_PRIVATE_KEY**:
```bash
# On your local machine, copy your EC2 private key:
cat your-key.pem
# Paste the entire output into GitHub secret
```

**SERVER_IP**:
```
54.88.64.190
```

### 3. Make Packages Public

1. Push any commit to trigger the first build
2. Go to your GitHub profile → Packages
3. Find `gift-tracker-backend` and `gift-tracker-frontend`
4. Click each → Package settings → Change visibility → Public

### 4. Deploy!

```bash
git add .
git commit -m "feat: add CI/CD deployment"
git push origin main
```

Watch the deployment in GitHub Actions tab!

## ✅ Verify Deployment

After GitHub Actions completes:

```bash
# Check frontend
curl http://54.88.64.190/

# Check backend
curl http://54.88.64.190:5000/api/health

# Open in browser
open http://54.88.64.190
```

## 🔧 Common Commands

### On Server

```bash
# View logs
cd ~/gift-tracker
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Check status
docker-compose -f docker-compose.prod.yml ps

# Manual deployment
./scripts/manual-deploy.sh
```

### Troubleshooting

**Deployment failed?**
1. Check GitHub Actions logs
2. SSH to server and check: `docker-compose logs`
3. Verify `.env.production` has correct values
4. Ensure packages are public or add PAT

**Can't connect?**
1. Check AWS Security Group allows ports 22, 80, 5000
2. Verify server firewall: `sudo ufw status`
3. Check if containers are running: `docker ps`

## 📚 Full Documentation

For detailed information, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎯 What Happens on Each Push to Main

1. ✅ Run backend tests
2. 🐳 Build Docker images
3. 📦 Push to GitHub Container Registry
4. 🔄 Run database migrations
5. 🚀 Deploy to EC2
6. ✅ Health checks
7. 🎉 Done!

## 🔐 Security Checklist

- [ ] Strong JWT_SECRET (32+ random characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] SSH key kept secure
- [ ] .env.production never committed to git
- [ ] Firewall rules configured
- [ ] GitHub secrets added

## 📊 Monitoring

```bash
# Check service health
curl http://54.88.64.190:5000/api/health

# View resource usage
docker stats

# Check disk space
df -h
```

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed docs
2. Review GitHub Actions logs
3. Check server logs: `docker-compose logs`
4. Verify environment variables
