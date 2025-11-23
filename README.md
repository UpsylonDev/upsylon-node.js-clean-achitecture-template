# New REST API

This project is a REST API built with Node.js, Express, and TypeScript, following Clean Architecture and Domain-Driven Design (DDD) principles.

## Features

- **Clean Architecture**: Separation of concerns (Domain, Infrastructure, Presentation).
- **PostgreSQL**: Relational database with TypeORM.
- **Testing**: Jest for unit and integration tests.
- **Security**: Helmet, CORS, Rate Limiting.
- **Monitoring**: Prometheus metrics and Pino logging.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm
- PostgreSQL
- Redis (optional, for rate limiting)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and update the values.

### Development with Docker Compose

The project uses Docker Compose to run PostgreSQL and Redis. **You need to start these services before running the application in development mode.**

#### Quick Start

```bash
# 1. Start PostgreSQL and Redis
docker-compose up postgres redis -d

# 2. Verify services are running
docker-compose ps

# 3. Run the application in development mode
pnpm dev
```

#### Environment Configuration

Your `.env` file should point to the Docker containers:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ddd-user-api

REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Docker Compose Services

- **`postgres`**: PostgreSQL database (port 5432)
- **`redis`**: Redis cache (port 6379)
- **`app`**: Node.js application (port 3000) - **used only for production deployment**

#### Useful Commands

```bash
# Start services in background
docker-compose up postgres redis -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Reset database (removes all data)
docker-compose down -v

# Full production deployment (all services)
docker-compose up -d
```

### Running the Application

- **Development**:
  ```bash
  pnpm dev
  ```
- **Production**:
  ```bash
  pnpm build
  pnpm start
  ```

### Testing

- Run tests:
  ```bash
  pnpm test
  ```

## Architecture

The project is organized into three main layers:

1.  **Domain**: Business logic, entities, and interfaces. Independent of external frameworks.
2.  **Infrastructure**: Implementation of interfaces (repositories, database, external services).
3.  **Presentation**: API endpoints, controllers, and request handling.

## License

MIT
