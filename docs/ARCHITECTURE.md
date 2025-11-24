# Architecture Documentation

[Architecture Diagram (English)](./en/architecture-diagram.md)

## Overview

This project follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to create a maintainable, testable, and scalable REST API.

## Layer Structure

```
src/
├── domain/              # Business logic (core)
│   ├── entities/        # Domain entities (User)
│   ├── valueObjects/    # Value objects (Email, Password)
│   ├── repositories/    # Repository interfaces
│   └── services/        # Domain service interfaces
├── application/         # Use cases & orchestration
│   ├── commands/        # Commands & Command Handlers
│   └── dtos/            # Data Transfer Objects
├── infrastructure/      # External implementations
│   ├── persistence/     # Database (TypeORM, Redis)
│   ├── config/          # Environment configuration
│   ├── logging/         # Logging (Pino)
│   ├── monitoring/      # Metrics (Prometheus)
│   ├── rateLimit/       # Rate limiting
│   └── services/        # External service implementations
└── presentation/        # HTTP layer
    ├── controllers/     # Request handlers
    ├── routes/          # Route definitions
    └── middlewares/     # Express middlewares
```

## Design Principles

### 1. Dependency Inversion Principle (DIP)

The **domain layer** defines interfaces (e.g., `IUserRepository`, `ICacheRepository`), and the **infrastructure layer** implements them. This ensures the business logic doesn't depend on external frameworks.

### 2. Single Responsibility Principle (SRP)

- **Controllers**: Handle HTTP requests/responses
- **Command Handlers**: Execute business logic
- **Repositories**: Manage data persistence
- **Value Objects**: Encapsulate validation rules

### 3. Separation of Concerns

Each layer has a clear responsibility:

- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates use cases, coordinates domain and infrastructure
- **Infrastructure**: Implements technical details (database, cache, external APIs)
- **Presentation**: HTTP interface, request validation, response formatting

## Key Components

### Domain Layer

#### Entities

- **User**: Core business entity with ID, email, password, and creation date

#### Value Objects

- **Email**: Validates email format
- **Password**: Handles password hashing and validation (min 8 chars, uppercase, lowercase, number)

#### Repository Interfaces

- **IUserRepository**: Defines user persistence operations
- **ICacheRepository**: Defines caching operations

### Application Layer

#### Commands

- **CreateUserCommand**: Encapsulates user creation data
- **FetchExternalDataCommand**: Triggers external data fetching

#### Command Handlers

- **CreateUserCommandHandler**:
  - Validates email uniqueness
  - Creates User entity
  - Persists to database
- **FetchExternalDataCommandHandler**:
  - Checks cache first
  - Fetches from external API if cache miss
  - Stores result in cache

#### DTOs

- **CreateUserDTO**: Data transfer object for user creation

### Infrastructure Layer

#### Persistence

- **TypeORM**: PostgreSQL connection and User repository
- **Redis**: Caching and rate limiting

#### Configuration

- **Environment**: Centralized environment variable management

#### Monitoring

- **Pino**: Structured logging
- **Prometheus**: Metrics collection

### Presentation Layer

#### Controllers

- **UserController**: Handles user-related HTTP requests
- **ExtraApiController**: Handles external API requests

#### Middlewares

- **Error Handler**: Global error handling
- **Rate Limiter**: Request rate limiting
- **Validation**: Request validation using Joi

## Data Flow

### Example: Create User

1. **HTTP Request** → `POST /user` with email and password
2. **Middleware** → Validates request body (Joi)
3. **Controller** → Extracts data, creates `CreateUserCommand`
4. **Command Handler** →
   - Creates `Email` and `Password` value objects (validation)
   - Checks email uniqueness via `IUserRepository`
   - Creates `User` entity
   - Saves via repository
5. **Repository** → Persists to PostgreSQL via TypeORM
6. **Controller** → Returns HTTP 201 with user data

## Testing Strategy

- **Unit Tests**: Domain entities and value objects
- **Integration Tests**: Command handlers with repository mocks
- **E2E Tests**: Full HTTP request/response cycle

## Database

- **PostgreSQL**: Primary database for user data
- **TypeORM**: ORM with entity mapping
- **Redis**: Caching layer for performance

## Security

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse
- **Password Hashing**: bcrypt with 10 salt rounds

## Development Environment

### Docker Compose Setup

The project uses Docker Compose to manage PostgreSQL and Redis services. This ensures consistent development environments across all team members.

#### Services

- **PostgreSQL** (port 5432): Primary database
- **Redis** (port 6379): Cache and rate limiting
- **App** (port 3000): Node.js application (production only)

#### Recommended Workflow

For optimal development experience, run databases in Docker and the app locally:

```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Run app locally with hot-reload
pnpm dev
```

**Benefits:**

- Fast hot-reload with nodemon
- Direct access to logs and debugging
- No need to rebuild Docker image for code changes
- Databases isolated in containers

#### Environment Configuration

**Local development** (`.env`):

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Docker production** (docker-compose.yml):

```env
POSTGRES_HOST=postgres
REDIS_HOST=redis
```

See [README.Docker.md](../README.Docker.md) for complete Docker documentation.

## Next Steps

To add new features:

1. **Define Domain**: Create entities, value objects, and repository interfaces in `domain/`
2. **Create Use Cases**: Add commands and handlers in `application/`
3. **Implement Infrastructure**: Add repository implementations in `infrastructure/`
4. **Expose API**: Create controllers and routes in `presentation/`
5. **Test**: Write unit and integration tests
