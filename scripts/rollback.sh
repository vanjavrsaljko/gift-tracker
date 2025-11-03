#!/bin/bash

# Rollback script to revert to previous deployment
# Usage: ./rollback.sh [git-sha]

set -e

cd ~/gift-tracker

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a git SHA to rollback to"
    echo "Usage: ./rollback.sh <git-sha>"
    exit 1
fi

GIT_SHA=$1

echo "🔄 Rolling back to commit: $GIT_SHA"

# Load environment variables
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    exit 1
fi

export $(cat .env.production | xargs)

# Update image tags to specific commit
echo "📥 Pulling images for commit $GIT_SHA..."
docker pull ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-backend:main-${GIT_SHA}
docker pull ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-frontend:main-${GIT_SHA}

# Tag as latest
docker tag ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-backend:main-${GIT_SHA} \
    ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-backend:latest
docker tag ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-frontend:main-${GIT_SHA} \
    ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-frontend:latest

# Restart containers
echo "🔄 Restarting containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Wait and check health
echo "⏳ Waiting for services to start..."
sleep 10

echo "🏥 Checking service health..."
curl -f http://localhost:5000/api/health && echo "✅ Backend is healthy"
curl -f http://localhost:80/health && echo "✅ Frontend is healthy"

echo ""
echo "✅ Rollback completed successfully!"
echo "📊 Running containers:"
docker ps
