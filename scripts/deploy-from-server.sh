#!/bin/bash

# Deploy by building on the remote server
# This script SSHs into the server, pulls the repo, and builds images there

set -e

# Configuration
REMOTE_USER="ubuntu"
REMOTE_HOST="54.88.64.190"
REMOTE_DIR="/home/ubuntu/gift-tracker"
REPO_URL="https://github.com/vanjavrsaljko/gift-tracker.git"
BRANCH="main"

echo "🚀 Deploying to $REMOTE_HOST..."

# SSH into server and execute deployment commands
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
set -e

echo "📂 Setting up directory..."
cd /home/ubuntu

# Clone or pull repository
if [ -d "gift-tracker" ]; then
  echo "📥 Pulling latest changes..."
  cd gift-tracker
  git fetch origin
  git reset --hard origin/main
  git pull origin main
else
  echo "📥 Cloning repository..."
  git clone https://github.com/vanjavrsaljko/gift-tracker.git
  cd gift-tracker
fi

echo "🏗️  Building Docker images..."

# Build backend image
echo "📦 Building backend..."
docker build -t gift-tracker-backend:latest -f server/Dockerfile server/

# Build frontend image  
echo "📦 Building frontend..."
docker build -t gift-tracker-frontend:latest -f client/Dockerfile client/

echo "🗄️  Running database migrations..."
# Stop containers if running
docker-compose -f docker-compose.prod.yml down || true

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ Error: .env.production file not found!"
  echo "Please create .env.production with required variables:"
  echo "  MONGODB_URI=your_mongodb_connection_string"
  echo "  JWT_SECRET=your_jwt_secret"
  echo "  CORS_ORIGIN=http://54.88.64.190"
  exit 1
fi

# Run migrations (loads env vars from .env.production)
docker run --rm \
  --network host \
  --env-file .env.production \
  gift-tracker-backend:latest \
  node dist/scripts/migrate.js

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://54.88.64.190"
echo "🔧 Backend: http://54.88.64.190:5000"

ENDSSH

echo "✅ Deployment finished successfully!"
