#!/bin/bash

# Setup script for AWS EC2 server
# Run this script once on your server to set up the environment

set -e

echo "🚀 Setting up Gift Tracker deployment environment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/gift-tracker
cd ~/gift-tracker

# Create .env.production file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📝 Creating .env.production file..."
    cat > .env.production << 'EOL'
# GitHub Container Registry
GITHUB_REPOSITORY_OWNER=your-github-username

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gift-tracker?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origin (your frontend URL)
CORS_ORIGIN=http://54.88.64.190
EOL
    echo "⚠️  Please edit ~/gift-tracker/.env.production with your actual values!"
else
    echo "✅ .env.production already exists"
fi

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (for future SSL)
sudo ufw allow 5000/tcp  # Backend API
sudo ufw --force enable

# Enable Docker service
echo "🔧 Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Create log directory
mkdir -p ~/gift-tracker/logs

echo ""
echo "✅ Server setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit ~/gift-tracker/.env.production with your actual values"
echo "2. Add your SSH public key to GitHub Actions secrets as SSH_PRIVATE_KEY"
echo "3. Add server IP (54.88.64.190) to GitHub Actions secrets as SERVER_IP"
echo "4. Make your GitHub Container Registry packages public or add authentication"
echo "5. Push to main branch to trigger deployment"
echo ""
echo "🔍 To verify setup:"
echo "  docker --version"
echo "  docker-compose --version"
echo "  cat ~/gift-tracker/.env.production"
