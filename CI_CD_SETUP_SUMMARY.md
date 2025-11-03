# CI/CD Setup Summary

## ✅ What Was Created

### 1. Docker Configuration
- **`server/Dockerfile`**: Multi-stage Node.js backend image
- **`client/Dockerfile`**: Multi-stage React app with Nginx
- **`docker-compose.prod.yml`**: Production orchestration
- **`.dockerignore`**: Optimize build context for both services
- **`client/nginx.conf`**: Nginx configuration with React Router support

### 2. GitHub Actions Workflow
- **`.github/workflows/deploy.yml`**: Complete CI/CD pipeline
  - Runs tests on every push/PR
  - Builds and pushes Docker images to GHCR
  - Deploys to AWS EC2 on main branch
  - Runs database migrations automatically
  - Performs health checks
  - Provides deployment notifications

### 3. Database Migration System
- **`server/src/scripts/migrate.ts`**: Migration framework
  - Tracks applied migrations in MongoDB
  - Idempotent (safe to run multiple times)
  - Automatic execution during deployment
  - Includes existing migrations (multi-wishlist, sharedWith)
  - Easy to add new migrations

### 4. Deployment Scripts
- **`scripts/setup-server.sh`**: One-time server setup
- **`scripts/manual-deploy.sh`**: Manual deployment option
- **`scripts/rollback.sh`**: Rollback to previous version

### 5. Documentation
- **`DEPLOYMENT.md`**: Complete deployment guide (6000+ words)
- **`DEPLOYMENT_QUICKSTART.md`**: Quick start guide
- **`CI_CD_SETUP_SUMMARY.md`**: This file
- Updated **`README.md`** with deployment section

### 6. Configuration Files
- **`.env.production.example`**: Production environment template
- Updated **`.gitignore`**: Protect sensitive files
- Updated **`server/package.json`**: Add migration scripts
- Updated **`server/src/server.ts`**: Add health check endpoints

## 🔧 What You Need to Do

### Step 1: Server Setup (One-time)

SSH into your EC2 instance (54.88.64.190):

```bash
ssh -i your-key.pem ubuntu@54.88.64.190
```

Run the setup script:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

mkdir -p ~/gift-tracker
cd ~/gift-tracker
```

Create `.env.production` file:

```bash
nano .env.production
```

Paste and update these values:

```env
GITHUB_REPOSITORY_OWNER=your-github-username
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gift-tracker?retryWrites=true&w=majority
JWT_SECRET=generate-a-strong-random-string-here-32-chars-minimum
CORS_ORIGIN=http://54.88.64.190
```

**Important**: 
- Replace `your-github-username` with your actual GitHub username
- Get MongoDB URI from Atlas dashboard
- Generate a strong JWT secret: `openssl rand -base64 32`

### Step 2: GitHub Secrets

Go to your GitHub repository:
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these two secrets:

#### SSH_PRIVATE_KEY
```bash
# On your local machine
cat your-key.pem
# Copy the ENTIRE output including BEGIN and END lines
```

#### SERVER_IP
```
54.88.64.190
```

### Step 3: Make GitHub Packages Public

After the first push (which will create the packages):

1. Go to your GitHub profile → `Packages`
2. Click on `gift-tracker-backend`
3. Click `Package settings`
4. Scroll to `Danger Zone` → `Change visibility` → `Public`
5. Repeat for `gift-tracker-frontend`

### Step 4: Push to Trigger Deployment

```bash
git push origin main
```

Watch the deployment in the `Actions` tab of your GitHub repository!

## 🎯 How It Works

### On Every Push to Main:

1. **Test Phase**
   - Runs all backend tests (35 tests)
   - Uploads coverage reports

2. **Build Phase**
   - Builds Docker images for frontend and backend
   - Tags with commit SHA and 'latest'
   - Pushes to GitHub Container Registry

3. **Deploy Phase**
   - SSHs into your EC2 instance
   - Copies deployment files
   - Logs into GHCR
   - Pulls latest images
   - **Runs database migrations** (automatic!)
   - Stops old containers
   - Starts new containers
   - Performs health checks
   - Cleans up old images

4. **Verify Phase**
   - Checks container status
   - Shows recent logs
   - Reports success/failure

## 🗄️ Database Migrations

### How Migrations Work

1. **Tracking**: Each migration is tracked in the `migrations` collection
2. **Idempotent**: Safe to run multiple times (checks if already applied)
3. **Automatic**: Runs during every deployment
4. **Versioned**: Each migration has a version number

### Current Migrations

- **001**: Multi-wishlist migration (already applied in dev)
- **002**: Add sharedWith field to wishlists

### Adding New Migrations

When you change the database schema:

1. Edit `server/src/scripts/migrate.ts`
2. Add a new migration object:

```typescript
{
  version: '003',
  description: 'Your migration description',
  up: async () => {
    // Migration logic
    const User = mongoose.model('User');
    await User.updateMany(
      { newField: { $exists: false } },
      { $set: { newField: 'default' } }
    );
  },
  down: async () => {
    // Rollback logic
    const User = mongoose.model('User');
    await User.updateMany({}, { $unset: { newField: '' } });
  },
}
```

3. Commit and push
4. CI/CD will automatically run the migration during deployment

### Manual Migration

If needed:

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

## 🔍 Monitoring

### Health Check Endpoints

- **Frontend**: http://54.88.64.190/health
- **Backend**: http://54.88.64.190:5000/api/health

### View Logs

```bash
# SSH to server
ssh -i your-key.pem ubuntu@54.88.64.190

# View all logs
cd ~/gift-tracker
docker-compose -f docker-compose.prod.yml logs -f

# View backend only
docker-compose -f docker-compose.prod.yml logs -f backend

# View frontend only
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Check Container Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Common Operations

### Manual Deployment

```bash
# On the server
cd ~/gift-tracker
./scripts/manual-deploy.sh
```

### Rollback

```bash
# On the server
cd ~/gift-tracker
./scripts/rollback.sh <commit-sha>

# Example:
./scripts/rollback.sh abc123def456
```

### Restart Services

```bash
# On the server
cd ~/gift-tracker
docker-compose -f docker-compose.prod.yml restart
```

### View Resource Usage

```bash
docker stats
```

## 🐛 Troubleshooting

### Deployment Failed in GitHub Actions

1. Check the Actions tab for error logs
2. Common issues:
   - SSH key incorrect → Verify `SSH_PRIVATE_KEY` secret
   - Can't connect to server → Check Security Group allows port 22
   - `.env.production` not found → Create it on the server

### Containers Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80
```

### Database Connection Failed

```bash
# Verify MongoDB URI
cat .env.production | grep MONGODB_URI

# Check MongoDB Atlas:
# - Is IP whitelist configured? (Allow 0.0.0.0/0 for testing)
# - Is the password correct?
# - Is the cluster running?
```

### Can't Access Application

1. Check AWS Security Group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 5000 (API)

2. Check server firewall:
```bash
sudo ufw status
```

3. Check if containers are running:
```bash
docker ps
```

## 🔐 Security Checklist

- [x] `.env.production` added to `.gitignore`
- [x] SSH keys protected (not in git)
- [x] GitHub secrets configured
- [ ] Strong JWT_SECRET generated (you need to do this)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] MongoDB strong password set
- [ ] Consider adding HTTPS (Let's Encrypt)

## 📊 What's Deployed

### Frontend (Port 80)
- React application
- Served by Nginx
- Gzip compression enabled
- Static asset caching
- React Router support

### Backend (Port 5000)
- Node.js/Express API
- All API endpoints
- JWT authentication
- MongoDB Atlas connection
- Health check endpoint

### Database
- MongoDB Atlas (cloud)
- Automatic migrations
- Connection pooling
- Replica set (Atlas default)

## 🎉 Success Indicators

After deployment, you should see:

1. ✅ GitHub Actions workflow completes successfully
2. ✅ Frontend accessible at http://54.88.64.190
3. ✅ Backend API at http://54.88.64.190:5000/api/health
4. ✅ Can register and login
5. ✅ All features working

## 📚 Next Steps

1. **Test the deployment**: Register, create wishlists, test features
2. **Set up monitoring**: Consider adding Sentry or similar
3. **Add HTTPS**: Use Let's Encrypt for SSL certificate
4. **Custom domain**: Point a domain to your EC2 IP
5. **Backups**: Configure MongoDB Atlas backup schedule
6. **Scaling**: Consider load balancer for multiple instances

## 🆘 Need Help?

1. Check **DEPLOYMENT.md** for detailed documentation
2. Check **DEPLOYMENT_QUICKSTART.md** for quick reference
3. Review GitHub Actions logs
4. Check server logs: `docker-compose logs`
5. Verify environment variables
6. Check AWS Security Group settings

## 📝 Files Created

```
gift-tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD workflow
├── scripts/
│   ├── setup-server.sh               # Server setup script
│   ├── manual-deploy.sh              # Manual deployment
│   └── rollback.sh                   # Rollback script
├── server/
│   ├── Dockerfile                    # Backend Docker image
│   ├── .dockerignore                 # Docker ignore rules
│   └── src/
│       └── scripts/
│           └── migrate.ts            # Migration system
├── client/
│   ├── Dockerfile                    # Frontend Docker image
│   ├── .dockerignore                 # Docker ignore rules
│   └── nginx.conf                    # Nginx configuration
├── docker-compose.prod.yml           # Production orchestration
├── .env.production.example           # Environment template
├── DEPLOYMENT.md                     # Complete guide
├── DEPLOYMENT_QUICKSTART.md          # Quick start
└── CI_CD_SETUP_SUMMARY.md           # This file
```

## 🎯 Summary

You now have a complete CI/CD pipeline that:

- ✅ Automatically tests your code
- ✅ Builds Docker images
- ✅ Runs database migrations
- ✅ Deploys to AWS EC2
- ✅ Performs health checks
- ✅ Supports rollbacks
- ✅ Provides monitoring

**All you need to do is push to main!** 🚀
