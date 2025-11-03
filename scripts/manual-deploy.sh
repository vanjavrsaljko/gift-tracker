#!/bin/bash

# Manual deployment script
# Use this for manual deployments or troubleshooting

set -e

cd ~/gift-tracker

echo "🚀 Starting manual deployment..."

# Load environment variables
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    exit 1
fi

export $(cat .env.production | xargs)

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Run database migrations
echo "🔄 Running database migrations..."
docker run --rm \
    -e MONGODB_URI="${MONGODB_URI}" \
    -e NODE_ENV=production \
    ghcr.io/${GITHUB_REPOSITORY_OWNER}/gift-tracker-backend:latest \
    npm run migrate:build

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost:5000/api/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

if curl -f http://localhost:80/health; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Show running containers
echo ""
echo "📊 Running containers:"
docker ps

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://54.88.64.190"
echo "🔌 Backend: http://54.88.64.190:5000"
