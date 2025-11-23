# Docker Setup Guide

This guide explains how to run the REST API using Docker with PostgreSQL and Redis.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+

Check your installation:

```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Configure environment variables (Optional for Docker)

For Docker deployment, most settings are pre-configured in `docker-compose.yml`. You can optionally create a `.env` file to override defaults:

```bash
# Optional .env file for Docker
EXTRA_API_KEY=your_extra_api_key_here
LOG_LEVEL=info
```

**Note:** PostgreSQL and Redis connection settings are automatically configured in `docker-compose.yml` to use the containerized services.

### 2. Start all services (Production)

```bash
docker-compose up -d
```

This command will:

- Pull PostgreSQL and Redis images
- Build the Node.js application image
- Start all three containers (app, postgres, redis)
- Create persistent volumes for database data

### 3. Verify services are running

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific services
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 4. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Metrics
curl http://localhost:3000/metrics

# Create a user
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123"}'
```

## Development Workflow

### Recommended: Hybrid Approach

**Run PostgreSQL and Redis in Docker, but run the app locally for faster development:**

```bash
# 1. Start only PostgreSQL and Redis
docker-compose up postgres redis -d

# 2. Verify services are running
docker-compose ps

# 3. Configure your .env file for local development
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# REDIS_HOST=localhost
# REDIS_PORT=6379

# 4. Run the app locally with hot-reload
pnpm dev
```

**Benefits:**

- Fast hot-reload with nodemon
- No need to rebuild Docker image for code changes
- Direct access to logs and debugging
- Database and cache still isolated in containers

### Alternative: Full Docker Development

Run everything in Docker:

```bash
# Start all services
docker-compose up -d

# Make code changes

# Rebuild and restart
docker-compose up -d --build
```

## Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start only database services (recommended for dev)
docker-compose up postgres redis -d

# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down
```

### Clean Restart

```bash
# Remove everything including database data
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands in Containers

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d ddd-user-api

# Access Redis CLI
docker-compose exec redis redis-cli

# Access application container shell
docker-compose exec app sh

# Run tests in container
docker-compose exec app pnpm test
```

## Container Details

### Application Container

- **Name**: `upsylon-api`
- **Port**: 3000 (mapped to host:3000)
- **Base Image**: node:20-alpine
- **User**: Non-root user (node)
- **Environment**: Configured in docker-compose.yml
- **Health Check**: HTTP GET to /health every 30s

### PostgreSQL Container

- **Name**: `upsylon-postgres`
- **Port**: 5432 (mapped to host:5432)
- **Image**: postgres:16-alpine
- **Database**: ddd-user-api
- **User**: postgres
- **Password**: postgres (change in production!)
- **Volumes**: `postgres_data` - Database files
- **Health Check**: `pg_isready` every 10s

### Redis Container

- **Name**: `upsylon-redis`
- **Port**: 6379 (mapped to host:6379)
- **Image**: redis:7-alpine
- **Volumes**: `redis_data` - Persistence files
- **Health Check**: `redis-cli ping` every 10s

## Environment Configuration

### For Docker (Production)

Settings are in `docker-compose.yml`. The app service uses:

- `POSTGRES_HOST=postgres` (container name)
- `REDIS_HOST=redis` (container name)

### For Local Development

Your `.env` file should use:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ddd-user-api

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Troubleshooting

### Containers won't start

Check logs:

```bash
docker-compose logs
```

Common issues:

- **Port already in use**: Change ports in docker-compose.yml
- **PostgreSQL fails to start**: Check available disk space
- **Build fails**: Try `docker-compose build --no-cache`
- **Environment variables not loaded**: Check docker-compose.yml configuration

### Clean Everything

```bash
# Stop and remove containers, volumes, and networks
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

### Connection Issues

If the app can't connect to PostgreSQL:

1. Check PostgreSQL is healthy: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify network: `docker network ls`

If the app can't connect to Redis:

1. Check Redis is healthy: `docker-compose ps`
2. Check logs: `docker-compose logs redis`
3. Test connection: `docker-compose exec redis redis-cli ping`

### Performance on Windows/Mac

Docker Desktop uses virtualization which can be slower. For better performance:

- Allocate more resources to Docker Desktop (Settings → Resources)
- Use WSL2 backend on Windows
- Use the hybrid approach (databases in Docker, app locally)

## Production Considerations

The current setup is optimized for **development**. For production:

### 1. Security Hardening

- **Change default passwords** in docker-compose.yml
- Enable PostgreSQL authentication and TLS
- Use Docker secrets for sensitive data
- Run containers with minimal privileges
- Enable Redis authentication

### 2. Environment Variables

- Don't hardcode credentials
- Use Docker secrets or external secret management (AWS Secrets Manager, HashiCorp Vault)
- Set `NODE_ENV=production`

### 3. Monitoring

- Add logging aggregation (ELK, Loki)
- Implement metrics collection (Prometheus already included)
- Set up alerts for health checks
- Monitor database performance

### 4. Scaling

- Use orchestration (Kubernetes, Docker Swarm)
- Add load balancer (Nginx, Traefik)
- Configure PostgreSQL replication
- Use Redis Cluster for high availability

### 5. Backups

- Implement automated PostgreSQL backups
- Test restore procedures regularly
- Store backups off-site (S3, Azure Blob)
- Backup Redis persistence files

## Architecture

```
┌─────────────────────────────────────────────┐
│   Host Machine (Windows/Mac/Linux)          │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   Docker Network: default             │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  App Container (upsylon-api)    │ │ │
│  │  │  - Node.js 20 Alpine            │ │ │
│  │  │  - Port: 3000                   │ │ │
│  │  │  - Multi-stage build            │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │             ↓              ↓          │ │
│  │  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  PostgreSQL  │  │    Redis     │ │ │
│  │  │  Container   │  │  Container   │ │ │
│  │  │  - PG 16     │  │  - Redis 7   │ │ │
│  │  │  - Port 5432 │  │  - Port 6379 │ │ │
│  │  │  - Volume    │  │  - Volume    │ │ │
│  │  └──────────────┘  └──────────────┘ │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Next Steps

- Configure CI/CD pipeline with Docker
- Add integration tests with test containers
- Implement database migrations
- Set up staging environment
- Configure monitoring and alerting
