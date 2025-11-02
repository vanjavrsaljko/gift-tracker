# Docker MongoDB Setup Guide

## 🐳 What's Included

This setup provides:
- **MongoDB 7.0** - Database server
- **Mongo Express** - Web-based MongoDB admin interface (optional)
- **Persistent Storage** - Data survives container restarts
- **Network Isolation** - Containers communicate on private network

## 📋 Prerequisites

1. **Docker Desktop** installed on your machine
   - [Download for Mac](https://www.docker.com/products/docker-desktop)
   - [Download for Windows](https://www.docker.com/products/docker-desktop)
   - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

2. Verify Docker is installed:
   ```bash
   docker --version
   docker-compose --version
   ```

## 🚀 Quick Start

### 1. Start MongoDB

From the project root directory:

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Check if containers are running
docker-compose ps
```

You should see:
```
NAME                          STATUS    PORTS
gift-tracker-mongodb          Up        0.0.0.0:27017->27017/tcp
gift-tracker-mongo-express    Up        0.0.0.0:8081->8081/tcp
```

### 2. Create .env File

```bash
cd server
cp .env.example .env
```

The `.env` file should contain:
```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/gifttracker?authSource=admin
JWT_SECRET=your_jwt_secret_here_change_in_production
PORT=5000
NODE_ENV=development
```

### 3. Start the Backend

```bash
cd server
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### 4. Access Mongo Express (Optional)

Open your browser and go to: `http://localhost:8081`

**Login credentials:**
- Username: `admin`
- Password: `admin123`

You can view and manage your database through this web interface.

## 🛠️ Docker Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs visible
docker-compose up
```

### Stop Services
```bash
# Stop containers (data persists)
docker-compose stop

# Stop and remove containers (data persists in volumes)
docker-compose down

# Stop and remove everything including volumes (⚠️ deletes all data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service
docker-compose logs mongodb
docker-compose logs mongo-express
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart mongodb
```

### Check Status
```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats
```

## 🔧 Configuration

### MongoDB Credentials

Default credentials (change in production):
- **Username**: `admin`
- **Password**: `admin123`
- **Database**: `gifttracker`
- **Port**: `27017`

### Connection Strings

**From Host Machine (your app):**
```
mongodb://admin:admin123@localhost:27017/gifttracker?authSource=admin
```

**From Another Docker Container:**
```
mongodb://admin:admin123@mongodb:27017/gifttracker?authSource=admin
```

### Mongo Express

- **URL**: `http://localhost:8081`
- **Username**: `admin`
- **Password**: `admin123`

## 📊 Data Persistence

Data is stored in Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - Configuration files

**To backup data:**
```bash
# Export database
docker exec gift-tracker-mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --db gifttracker --out /backup

# Copy backup to host
docker cp gift-tracker-mongodb:/backup ./mongodb-backup
```

**To restore data:**
```bash
# Copy backup to container
docker cp ./mongodb-backup gift-tracker-mongodb:/backup

# Restore database
docker exec gift-tracker-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --db gifttracker /backup/gifttracker
```

## 🐛 Troubleshooting

### Port Already in Use

If port 27017 is already in use:

1. Check what's using the port:
   ```bash
   lsof -i :27017
   ```

2. Stop the conflicting service or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "27018:27017"  # Use different host port
   ```

3. Update your `.env` file:
   ```env
   MONGO_URI=mongodb://admin:admin123@localhost:27018/gifttracker?authSource=admin
   ```

### Container Won't Start

```bash
# Check logs
docker-compose logs mongodb

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Connection Refused

1. Verify MongoDB is running:
   ```bash
   docker-compose ps
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Test connection:
   ```bash
   docker exec -it gift-tracker-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
   ```

### Reset Everything

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Start fresh
docker-compose up -d
```

## 🔒 Security Notes

### For Development
The current setup is fine for local development.

### For Production
1. **Change credentials** in `docker-compose.yml`
2. **Use environment variables** instead of hardcoded values
3. **Enable SSL/TLS** for MongoDB connections
4. **Remove Mongo Express** or secure it properly
5. **Use Docker secrets** for sensitive data
6. **Restrict network access**

## 📝 Testing the Setup

### 1. Test MongoDB Connection

```bash
# Connect to MongoDB shell
docker exec -it gift-tracker-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Inside MongoDB shell:
use gifttracker
db.test.insertOne({message: "Hello from Docker!"})
db.test.find()
exit
```

### 2. Test Backend Connection

```bash
cd server
npm run dev
```

Look for: `MongoDB Connected: localhost`

### 3. Test Mongo Express

Open `http://localhost:8081` in your browser and verify you can see the `gifttracker` database.

## 🎯 Next Steps

1. ✅ Start MongoDB with Docker
2. ✅ Create `.env` file
3. ✅ Start backend server
4. ✅ Verify connection
5. 🚀 Start frontend and test the app!

## 📚 Additional Resources

- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Mongo Express Docker Hub](https://hub.docker.com/_/mongo-express)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)
