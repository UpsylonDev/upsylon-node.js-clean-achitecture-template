# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js + Express + TypeScript API built following **Domain-Driven Design (DDD)** and **Clean Architecture** principles. It's a user management API with MongoDB persistence that demonstrates proper separation of concerns across architectural layers.

## Development Commands

### Package Manager
This project uses **pnpm** (specified in package.json: `"packageManager": "pnpm@10.16.1"`). Always use `pnpm` instead of npm or yarn.

### Common Commands
```bash
# Install dependencies
pnpm install

# Development server (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run all tests with coverage
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Format code
pnpm format
```

### Running Specific Tests
Jest is configured to find tests matching `**/__tests__/**/*.ts` or `**/?(*.)+(spec|test).ts`:
```bash
# Run a specific test file
pnpm test src/domain/valueObjects/Email.spec.ts

# Run tests matching a pattern
pnpm test --testPathPattern=Email

# Run tests in watch mode for specific file
pnpm test:watch Email
```

### Docker Setup (Recommended)
The easiest way to run the project locally with all dependencies:

**Prerequisites:**
- Ensure a `.env` file exists in the project root
- Docker Compose automatically loads environment variables from `.env`
- The `MONGODB_URI` is overridden in `docker-compose.yml` to use the containerized MongoDB

```bash
# Start all services (MongoDB + API) in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

**Services:**
- MongoDB: accessible on `localhost:27017`
- API: accessible on `localhost:3000` (configurable via PORT in `.env`)
- Health check: http://localhost:3000/health

**Environment Variables:**
- Variables are loaded from `.env` file
- `MONGODB_URI` is automatically set to `mongodb://mongodb:27017/ddd-user-api` for Docker
- You can override any variable in the `environment` section of `docker-compose.yml`

### MongoDB Setup (Manual)
If not using Docker, MongoDB must be running:
```bash
# Start MongoDB (command varies by OS/installation)
mongod

# Default connection: mongodb://localhost:27017/ddd-user-api
```

### Redis Setup
Redis is used for caching (Cache-Aside pattern). It's included in Docker Compose but can be run separately:

**With Docker:**
- Automatically started as part of `docker-compose up -d`
- Accessible on `localhost:6379` (from host machine)
- Uses volume `redis-data` for data persistence

**Manual Setup:**
```bash
# Start Redis locally (command varies by OS)
redis-server

# Or using Docker without Compose
docker run -d -p 6379:6379 --name ddd-redis redis:7-alpine

# Check Redis connection
redis-cli ping  # Should return PONG
```

**Redis CLI Commands:**
```bash
# Connect to Redis
redis-cli

# Get all keys
KEYS *

# Check value
GET user:email:example@test.com

# Delete cache
DEL user:email:example@test.com

# Clear all cache
FLUSHDB

# Monitor real-time commands
MONITOR
```

### Environment Configuration
Copy `.env.example` to `.env` before running (not needed for Docker):
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_DB`: Redis database number (default: 0)
- `REDIS_TTL`: Default cache TTL in seconds (default: 3600)
- `PORT`: Server port (default: 3000)
- `BCRYPT_SALT_ROUNDS`: Password hashing rounds (default: 10)
- `LOG_LEVEL`: Logging level (debug, info, warn, error) (default: debug in development, info in production)
- `NODE_ENV`: Environment mode (development, production) (default: development)

## Architecture Overview

### Four-Layer Clean Architecture

The codebase follows strict DDD layering with dependency inversion:

```
┌─────────────────────────────────────┐
│   PRESENTATION (API Layer)          │  Express controllers, routes, middlewares
├─────────────────────────────────────┤
│   APPLICATION (Use Cases)           │  Command handlers, DTOs, orchestration
├─────────────────────────────────────┤
│   DOMAIN (Business Logic)           │  Entities, Value Objects, Repository interfaces
├─────────────────────────────────────┤
│   INFRASTRUCTURE (Technical)        │  MongoDB, Mongoose models, repository implementations
└─────────────────────────────────────┘
```

### Dependency Rules (Critical)

**Dependencies flow inward only:**
- Domain has ZERO dependencies on other layers (pure business logic)
- Application depends only on Domain
- Infrastructure and Presentation depend on Domain and Application
- **Never** import infrastructure or presentation code into domain layer

### Key Architectural Patterns

#### 1. **Domain Layer** (`src/domain/`)
- **Entities** ([User.ts](src/domain/entities/User.ts)): Core business objects with identity and behavior
  - Encapsulates business rules
  - Uses Value Objects for typed properties
  - Provides `toPublicObject()` for safe serialization (excludes password)

- **Value Objects** ([Email.ts](src/domain/valueObjects/Email.ts), [Password.ts](src/domain/valueObjects/Password.ts)): Immutable, self-validating types
  - Validate in constructor (throw errors for invalid data)
  - No setters (immutable)
  - Provide `equals()` methods for comparison
  - Password automatically hashes on creation

- **Repository Interfaces** ([IUserRepository.ts](src/domain/repositories/IUserRepository.ts)): Define contracts for data access
  - Domain defines the interface
  - Infrastructure implements it (Dependency Inversion Principle)

#### 2. **Application Layer** (`src/application/`)
- **Commands**: Represent user intentions (e.g., [CreateUserCommand.ts](src/application/commands/CreateUserCommand.ts))
- **Command Handlers**: Orchestrate business logic ([CreateUserCommandHandler.ts](src/application/commands/CreateUserCommandHandler.ts))
  - Validate business rules (e.g., email uniqueness)
  - Create domain objects (Value Objects, Entities)
  - Coordinate with repositories
  - Handle use case flow
- **DTOs**: Data transfer objects for crossing layer boundaries

#### 3. **Infrastructure Layer** (`src/infrastructure/`)
- **Persistence**: MongoDB implementation ([MongoUserRepository.ts](src/infrastructure/persistence/MongoUserRepository.ts))
  - Implements `IUserRepository` interface from domain
  - Uses Mongoose for ODM
  - Translates between domain entities and database models
- **Cache**: Redis implementation ([RedisCacheRepository.ts](src/infrastructure/persistence/RedisCacheRepository.ts))
  - Generic cache interface `ICacheRepository` for all caching operations
  - Implements Cache-Aside pattern (lazy loading)
  - Supports custom TTL per cache operation
  - Automatic JSON serialization/deserialization
  - Used for caching read operations (findByEmail, findById, etc.)
- **Configuration**: Environment variables ([environment.ts](src/infrastructure/config/environment.ts))
- **Database Connection**: Mongoose connection singleton ([connection.ts](src/infrastructure/persistence/mongoose/connection.ts))
- **Cache Connection**: Redis connection singleton ([connection.ts](src/infrastructure/persistence/redis/connection.ts))
  - Handles Redis connection pooling
  - Automatic reconnection with retry strategy
  - Graceful shutdown handling

#### 4. **Presentation Layer** (`src/presentation/`)
- **Controllers** ([UserController.ts](src/presentation/controllers/UserController.ts)): HTTP request handling
  - Extract data into DTOs (validation is done by middleware)
  - Create commands
  - Delegate to command handlers
  - Format HTTP responses
  - Use `next(error)` to delegate to error middleware

- **Routes** ([userRoutes.ts](src/presentation/routes/userRoutes.ts)): Dependency injection and route configuration
  - Factory pattern: `createUserRouter()` instantiates dependencies
  - Wires up controllers with command handlers and repositories
  - Applies validation middleware before controllers

- **Middlewares**:
  - [validateRequest.ts](src/presentation/middlewares/validateRequest.ts): Request validation using Joi
    - Validates HTTP-level concerns (types, formats, required fields)
    - Transforms data (trim, lowercase for emails)
    - Returns structured error responses with field-level details
    - Rejects extra fields in strict mode
  - [errorHandler.ts](src/presentation/middlewares/errorHandler.ts): Global error handling
    - Handles Joi validation errors with detailed field messages
    - Maps domain errors to appropriate HTTP status codes

### Request Flow Example

Creating a user follows this flow:
1. **HTTP Request** → `POST /user` with `{email, password}`
2. **Route** → [userRoutes.ts](src/presentation/routes/userRoutes.ts) instantiates dependencies
3. **Validation Middleware** → [validateRequest.ts](src/presentation/middlewares/validateRequest.ts) validates and transforms request
   - Validates required fields, types, and formats using Joi schema
   - Transforms email (trim, lowercase)
   - Returns 400 with field-level errors if validation fails
   - Passes transformed data to controller if validation succeeds
4. **Controller** → [UserController.ts](src/presentation/controllers/UserController.ts) extracts data
5. **Command** → Creates `CreateUserCommand` from DTO
6. **Handler** → [CreateUserCommandHandler.ts](src/application/commands/CreateUserCommandHandler.ts) orchestrates:
   - Creates `Email` value object (validates format - defense in depth)
   - Checks uniqueness via repository
   - Creates `Password` value object (validates rules, hashes)
   - Creates `User` entity
   - Persists via repository
7. **Repository** → [MongoUserRepository.ts](src/infrastructure/persistence/MongoUserRepository.ts) saves to MongoDB
8. **Response** → Controller returns `user.toPublicObject()` as JSON

### Application Entry Point

- [server.ts](src/server.ts): Main entry point
  - Validates environment variables
  - Connects to MongoDB
  - Creates Express app
  - Starts HTTP server

- [app.ts](src/app.ts): Express app factory
  - Configures middlewares
  - Registers routes
  - Sets up error handlers
  - Separated for testability

## Development Guidelines

### Adding New Features

When adding new domain concepts (e.g., new entity):

1. **Domain First**: Start with entities, value objects, and repository interface
2. **Application**: Create commands and handlers for use cases
3. **Infrastructure**: Implement repository with database specifics
4. **Presentation**: Add controllers and routes
5. **Tests**: Write tests at each layer (see existing `.spec.ts` files)

### Value Objects
- Always validate in constructor
- Throw descriptive errors for invalid data
- Make immutable (readonly properties)
- Provide `getValue()` or `toString()` methods

### Repository Pattern
- Domain defines interface (what operations are needed)
- Infrastructure implements (how to persist)
- Always use domain entities and value objects in signatures, never DTOs or database models

### Input Validation
The project uses a **three-layer validation strategy** following DDD principles:

1. **HTTP Layer (Joi)** - [validateRequest.ts](src/presentation/middlewares/validateRequest.ts)
   - Validates HTTP-level concerns (types, required fields, basic formats)
   - Transforms data (trim, lowercase)
   - Returns structured 400 errors with field-level details
   - Applied as middleware before controllers
   - Example: email must be string, max 255 chars, valid email format

2. **Domain Layer (Value Objects)** - [Email.ts](src/domain/valueObjects/Email.ts), [Password.ts](src/domain/valueObjects/Password.ts)
   - Enforces business invariants (defense-in-depth)
   - Email: validates format, normalizes (trim, lowercase)
   - Password: min 8 chars, uppercase, lowercase, number required
   - Automatically hashes password on creation

3. **Application Layer (Handlers)** - [CreateUserCommandHandler.ts](src/application/commands/CreateUserCommandHandler.ts)
   - Business rules requiring database access
   - Example: email uniqueness constraint

### Error Handling
- Domain/Application: Throw descriptive errors
- Presentation: Use `next(error)` to pass to error middleware
- Joi validation errors: Automatically formatted with field details
- Error middleware ([errorHandler.ts](src/presentation/middlewares/errorHandler.ts)) formats responses

### Logging with Pino

The project uses **Pino** for structured JSON logging with excellent performance.

#### Logging Architecture
- **Infrastructure** ([src/infrastructure/logging/](src/infrastructure/logging/)):
  - `ILogger` interface for abstraction (DDD principle)
  - `PinoLogger` implementation with configuration
  - `createHttpLogger()` middleware for HTTP request/response logging
  - Support for pretty printing in development mode

#### Logging Levels
Configure via `LOG_LEVEL` environment variable (default: `debug` in development, `info` in production):
- `debug` - Detailed debug information (cache hits/misses, detailed operations)
- `info` - General informational messages (server startup, connections)
- `warn` - Warning messages (connection issues, reconnection attempts)
- `error` - Error messages (failed operations, exceptions)

#### Using the Logger

**In any class:**
```typescript
import { PinoLogger } from '../infrastructure/logging/PinoLogger';

export class MyService {
  private logger = new PinoLogger({ context: 'MyService' });

  async doSomething() {
    this.logger.info('Starting operation', { userId: 123 });
    try {
      // business logic
      this.logger.info('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', error, { userId: 123 });
    }
  }
}
```

#### Log Output Format
**Development** (pretty-printed with colors):
```
[timestamp] [level] [context] message
  { additionalData... }
```

**Production** (JSON format for log aggregation):
```json
{"level":20,"time":1234567890,"context":"MongoDB","msg":"Connected successfully","uri":"mongodb://..."}
```

#### Logging Locations
- **Infrastructure**: Database/cache connections, repository operations
- **Presentation**: Error handler logs all errors with context
- **Server**: Startup, shutdown, process handlers
- **HTTP**: All requests/responses logged automatically via middleware

#### Security Best Practices

**Never log sensitive information:**
- ❌ Database connection strings with credentials (passwords, URLs)
- ❌ API keys, tokens, or secrets
- ❌ User passwords or personal data
- ❌ Infrastructure details that could aid attacks (hostnames, IP addresses)
- ❌ Payment information or financial data

**What to log instead:**
- ✅ Operation success/failure status
- ✅ Timing and performance metrics
- ✅ Error names and generic error messages
- ✅ Non-sensitive context (user IDs, transaction IDs)
- ✅ Environment mode (development/production) and port numbers

Example - Don't log credentials:
```typescript
// ❌ BAD - Exposes password
this.logger.info('Connected to database', {
  uri: 'mongodb://user:password@localhost:27017/db'
});

// ✅ GOOD - No sensitive data
this.logger.info('Database connected successfully');
```

#### Performance Note
Pino is 5-10x faster than Winston and has minimal overhead on JSON serialization.

### Testing
- Unit tests colocated with source (`.spec.ts` files)
- Test domain logic independently (no database needed)
- Mock repositories for testing command handlers
- Test value object validation thoroughly

### TypeScript Configuration
The project uses TypeScript with the following key settings ([tsconfig.json](tsconfig.json)):
- **Module System**: CommonJS (`"module": "commonjs"`) - standard for Node.js
- **Module Resolution**: Node (`"moduleResolution": "node"`) - uses Node.js resolution algorithm
- **Target**: ES2020 for modern JavaScript features
- **Strict Mode**: Enabled with all strict checks
- **Important**: When using `"module": "commonjs"`, always use `"moduleResolution": "node"` (not "bundler")

## API Endpoints

### User Management
- `GET /health` - Health check endpoint
- `POST /users` - Create user (requires: `email`, `password`)

### External API Integration
- `GET /extra-api` - Fetch data from external API
  - No parameters required
  - Uses Cache-Aside pattern with Redis (1h TTL)
  - Returns external API response wrapped in success envelope
  - Configuration: Set `EXTRA_API_KEY` in `.env` to the complete external API URL
  - Example: `EXTRA_API_KEY=https://api.example.com/data`

### Response Format
Success responses:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses (Joi validation):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/users"
  }
}
```

Error responses (domain/application):
```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "statusCode": 409,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/users"
  }
}
```

### Git Commit Standards

This project enforces commit message standards using **Husky** and **commitlint**:

#### Commit Message Format (Conventional Commits)
```
<type>(<scope>): <subject>
```

**Allowed types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Revert previous commit
- `secu`: Security improvements

**Examples:**
```bash
feat(user): add email validation
fix(auth): resolve password hashing issue
docs: update api documentation
refactor(domain): simplify entity creation
test(user): add email value object tests
secu(password): enhance complexity requirements
```

#### Automated Hooks

**Pre-commit hook** (runs before each commit):
- ESLint: Fixes code quality issues
- Prettier: Formats code
- Jest: Runs tests for staged files

**Commit-msg hook** (validates commit message):
- Enforces Conventional Commits format
- Checks type, scope, and subject
- Ensures lowercase and length rules

See [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) for detailed guidelines.

### IMPORTANT NOTES
- always reply in French in the chat
- All comments in the code will be in English.
- always suggests good practices in a simple and clear way (juste some words)
- NEVER include Claude references in commit messages (no "Co-Authored-By: Claude" or Claude Code links)
- Always comment à minimum the code if necessery.

# How to contribute

## 🎯 Objectif
Brief description of the goal and purpose of this PR.

## 🔧 Changements Techniques
- Technical change 1
- Technical change 2
- Technical change 3

## ✅ Tests
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📋 Checklist
- [ ] Self code review completed
- [ ] No secrets or credentials in code
- [ ] Documentation updated if needed
- [ ] Follows project coding standards
```

### Development Workflow for Contributors

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following the project guidelines
4. **Test your changes** with `pnpm test`
5. **Create a PR** using the format above
6. **Wait for review** and address any feedback

## Next Steps

- Configure CI/CD pipeline with Docker
- Add integration tests with test containers
- Implement monitoring and logging
- Set up staging environment

