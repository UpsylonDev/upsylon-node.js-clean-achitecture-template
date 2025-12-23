# New REST API

This project is a REST API built with Node.js, Express, and TypeScript, following Clean Architecture and Domain-Driven Design (DDD) principles.

## 🚀 Quick Start

**Development** (with hot reload):
```bash
pnpm install
cp .env.development .env
pnpm docker:dev:db && pnpm dev
```

**Production** (with monitoring):
```bash
cp .env.production.example .env.production  # Edit with real values
pnpm docker:prod:build
```

📖 **Guides**: [Quick Start](QUICK_START.md) | [Deployment](DEPLOYMENT.md) | [Claude Guide](CLAUDE.md)

## Features

- **Clean Architecture**: Separation of concerns (Domain, Infrastructure, Presentation).
- **MongoDB**: NoSQL database with Mongoose ODM.
- **Redis**: Caching with Cache-Aside pattern.
- **Testing**: Jest for unit and integration tests.
- **Security**: Helmet, CORS, Rate Limiting, bcrypt password hashing.
- **Monitoring**: Prometheus, Grafana, Loki stack (production only).
- **Logging**: Pino for high-performance structured logging.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm
- Docker & Docker Compose
- Make (optional, for simplified commands)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables (see Environment Configuration below)

## Environment Configuration

The project supports two environments: **development** and **production**.

### Development Environment

Copy the development environment file:
```bash
cp .env.development .env
```

Or create your own `.env` with development settings.

### Production Environment

For production, create a `.env.production` file based on `.env.production.example`:
```bash
cp .env.production.example .env.production
```

**Important:** Never commit `.env.production` to version control!

## Running the Application

### Option 1: Using Make (Recommended)

```bash
# Development mode
make dev              # Start development environment
make dev-build        # Build and start development
make dev-logs         # View logs
make dev-down         # Stop development

# Production mode
make prod             # Start production environment
make prod-build       # Build and start production
make prod-logs        # View logs
make prod-down        # Stop production

# Utilities
make clean            # Remove all containers and volumes
make test             # Run tests
make help             # Show all commands
```

### Option 2: Using npm/pnpm scripts

```bash
# Development mode
pnpm docker:dev           # Start development
pnpm docker:dev:build     # Build and start
pnpm docker:dev:logs      # View logs
pnpm docker:dev:down      # Stop

# Production mode
pnpm docker:prod          # Start production
pnpm docker:prod:build    # Build and start
pnpm docker:prod:logs     # View logs
pnpm docker:prod:down     # Stop
```

### Option 3: Using docker-compose directly

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Local Development (without Docker)

If you want to run the app locally without Docker:

```bash
# 1. Start only databases with Docker
docker-compose -f docker-compose.dev.yml up mongodb redis -d

# 2. Run the app locally
pnpm dev
```

## Differences between Development and Production

| Feature | Development | Production |
|---------|-------------|-----------|
| Port | 3000 | 3002 |
| Hot Reload | ✅ Yes | ❌ No |
| Logging | Debug (pretty) | Info (JSON) |
| Source Maps | ✅ Yes | ❌ No |
| Redis TLS | ❌ Disabled | ⚙️ Configurable |
| Monitoring Stack | ❌ Not included | ✅ Prometheus, Grafana, Loki |
| Volume Mounting | Source code mounted | Only logs |

## Monitoring

The project now includes a full monitoring stack with Prometheus, Grafana, and Loki.

### Starting the monitoring stack
```bash
# Start all services including monitoring
docker-compose up -d
```

- **Prometheus** is available at `http://localhost:9090` and scrapes metrics from the `/metrics` endpoint of the application.
- **Grafana** is available at `http://localhost:3001`. Log in with the default credentials `admin / admin`.
- **Loki** is available at `http://localhost:3100` and aggregates logs from the application.

### Grafana dashboards
A basic dashboard is provisioned that shows:
- HTTP request duration histogram
- Process CPU and memory usage
- Logs from the application (via Loki)

You can explore additional metrics and logs in Grafana's **Explore** section.

### Accessing metrics directly
```bash
curl http://localhost:3000/metrics
```

### Logs
Application logs are written to the `logs` directory and are collected by Loki.

For more advanced configuration, edit the files in `monitoring/grafana/provisioning`.


#### Useful Commands

```bash
# Start services in background
docker-compose up mongodb redis -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f mongodb
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

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository** and clone your fork.
2. **Create a feature branch**: `git checkout -b feature/your-feature`.
3. **Install dependencies**: `pnpm install`.
4. **Run tests** to ensure everything works: `pnpm test`.
5. **Follow the coding style** enforced by ESLint and Prettier. Run `pnpm lint` to check.
6. **Commit messages** should follow the [Conventional Commits] format (see `COMMIT_CONVENTION.md`).
7. **Open a Pull Request** targeting the `recette` branch. Describe your changes and reference any related issues.

For major changes, please open an issue first to discuss the proposed modifications.

Thank you for helping improve this project!

## License

MIT
