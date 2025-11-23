# Docker Setup Guide

This guide explains how to run the DDD User API using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+

Check your installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Configure environment variables

The project uses a `.env` file for configuration. Docker Compose automatically loads this file.

**Important:** Your `.env` file should contain environment variables. The `MONGODB_URI` will be automatically overridden to use the Docker MongoDB container.

```bash
# Your .env file should look like this:
NODE_ENV=production
PORT=3000
BCRYPT_SALT_ROUNDS=10
MONGODB_URI=mongodb://localhost:27017/ddd-user-api  # Will be overridden for Docker
```

**Note:** For Docker, the `MONGODB_URI` is automatically set to `mongodb://mongodb:27017/ddd-user-api` in docker-compose.yml to use the containerized MongoDB.

### 2. Start the application

```bash
docker-compose up -d
```

This command will:
- Load environment variables from `.env` file
- Pull the MongoDB image
- Build the Node.js application image
- Start both containers
- Create a persistent volume for MongoDB data

### 3. Verify services are running

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### 4. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'
```

## Common Commands

### Stop services
```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down
```

### Clean restart
```bash
# Remove everything including database data
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Rebuild after code changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100
```

### Execute commands in containers
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh ddd-user-api

# Access application container shell
docker-compose exec app sh

# Run tests in container
docker-compose exec app pnpm test
```

## Container Details

### Application Container
- **Name**: `ddd-app`
- **Port**: 3000 (mapped to host:3000, configurable via PORT env var)
- **Base Image**: node:20-alpine
- **User**: Non-root user (nodejs:1001)
- **Environment**: Loaded from `.env` file, with Docker-specific overrides
- **Health Check**: HTTP GET to /health every 30s

### MongoDB Container
- **Name**: `ddd-mongodb`
- **Port**: 27017 (mapped to host:27017)
- **Image**: mongo:7-jammy
- **Database**: ddd-user-api
- **Volumes**:
  - `mongodb_data`: Database files
  - `mongodb_config`: Configuration files

## Development Workflow

### Local development with Docker

1. **Start services in detached mode:**
   ```bash
   docker-compose up -d
   ```

2. **Make code changes** on your local machine

3. **Rebuild and restart:**
   ```bash
   docker-compose up -d --build
   ```

### Alternative: Hybrid approach

Run MongoDB in Docker, but run the app locally for faster iteration:

```bash
# Start only MongoDB
docker-compose up -d mongodb

# Make sure your .env file uses localhost for MongoDB
# MONGODB_URI=mongodb://localhost:27017/ddd-user-api

# Run app locally with pnpm
pnpm dev
```

**Important:** When running the app locally (not in Docker), make sure your `.env` file has `MONGODB_URI=mongodb://localhost:27017/ddd-user-api` to connect to the Docker MongoDB container.

## Troubleshooting

### Containers won't start

Check logs:
```bash
docker-compose logs
```

Common issues:
- **Port already in use**: Change ports in docker-compose.yml or `.env` file (PORT variable)
- **MongoDB fails to start**: Check available disk space
- **Build fails**: Try `docker-compose build --no-cache`
- **Environment variables not loaded**: Ensure `.env` file exists in the project root
- **TypeScript compilation errors**:
  - Error `TS5095: Option 'bundler' can only be used when...`: Use `"moduleResolution": "node"` in tsconfig.json with CommonJS
  - Ensure tsconfig.json has correct module resolution for Node.js projects

### Clean everything

```bash
# Stop and remove containers, volumes, and networks
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

### Connection issues

If the app can't connect to MongoDB:
1. Check MongoDB is healthy: `docker-compose ps`
2. Check logs: `docker-compose logs mongodb`
3. Verify network: `docker network inspect a-ddd-from-scratch_ddd-network`

### Build errors

If you encounter TypeScript compilation errors during build:

```bash
# Common error: TS5095 about moduleResolution
# Solution: Ensure tsconfig.json uses "moduleResolution": "node" with CommonJS
```

**Fix:**
1. Open `tsconfig.json`
2. Check that `"module": "commonjs"` is paired with `"moduleResolution": "node"`
3. Never use `"moduleResolution": "bundler"` with CommonJS modules

### Performance on Windows/Mac

Docker Desktop uses virtualization which can be slower. For better performance:
- Allocate more resources to Docker Desktop
- Use WSL2 backend on Windows
- Consider running services natively for development

## Production Considerations

The current setup is optimized for **development**. For production:

1. **Use environment variables properly:**
   - Don't hardcode credentials
   - Use Docker secrets or external secret management

2. **Security hardening:**
   - Enable MongoDB authentication
   - Use TLS/SSL for connections
   - Run containers with minimal privileges

3. **Monitoring:**
   - Add logging aggregation
   - Implement metrics collection
   - Set up alerts for health checks

4. **Scaling:**
   - Use orchestration (Kubernetes, Docker Swarm)
   - Add load balancer
   - Configure MongoDB replica set

5. **Backups:**
   - Implement automated MongoDB backups
   - Test restore procedures
   - Store backups off-site

## Architecture

```
┌─────────────────────────────────────┐
│   Host Machine (Windows/Mac/Linux)  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Docker Network: ddd-network │ │
│  │                               │ │
│  │  ┌────────────────────────┐  │ │
│  │  │  App Container         │  │ │
│  │  │  - Node.js 20 Alpine   │  │ │
│  │  │  - Port: 3000          │  │ │
│  │  │  - Multi-stage build   │  │ │
│  │  └────────────────────────┘  │ │
│  │             ↓                 │ │
│  │  ┌────────────────────────┐  │ │
│  │  │  MongoDB Container     │  │ │
│  │  │  - MongoDB 7           │  │ │
│  │  │  - Port: 27017         │  │ │
│  │  │  - Persistent volumes  │  │ │
│  │  └────────────────────────┘  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Next Steps

- Configure CI/CD pipeline with Docker
- Add integration tests with test containers
- Implement monitoring and logging
- Set up staging environment
