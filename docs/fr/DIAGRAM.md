# 📊 Diagrammes d'Architecture

## 🏗️ Architecture en couches (Layered Architecture)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  PRESENTATION LAYER                     ┃
┃  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  ┃
┃  │  Routes      │→ │ Controllers │→ │ Middlewares  │  ┃
┃  │ userRoutes.ts│  │UserController│  │errorHandler  │  ┃
┃  └──────────────┘  └─────────────┘  └──────────────┘  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                          ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  APPLICATION LAYER                      ┃
┃  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  ┃
┃  │  Commands    │→ │   Handlers  │→ │     DTOs     │  ┃
┃  │CreateUserCmd │  │CreateUserHdl│  │CreateUserDTO │  ┃
┃  └──────────────┘  └─────────────┘  └──────────────┘  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                          ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              DOMAIN LAYER (CORE BUSINESS)               ┃
┃  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  ┃
┃  │  Entities    │  │ Value Objs  │  │ Repositories │  ┃
┃  │    User      │  │Email/Passwrd│  │IUserRepository│ ┃
┃  └──────────────┘  └─────────────┘  └──────────────┘  ┃
┃          ⚠️  AUCUNE DÉPENDANCE EXTERNE                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                          ↑
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 INFRASTRUCTURE LAYER                    ┃
┃  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  ┃
┃  │  Repository  │  │  Mongoose   │  │    Config    │  ┃
┃  │MongoUserRepo │  │ Models/Conn │  │ environment  │  ┃
┃  └──────────────┘  └─────────────┘  └──────────────┘  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔄 Flux de données - POST /user

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTP REQUEST                                             │
│    POST /user { email, password }                           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION - UserController                            │
│    ✓ Validate HTTP request format                          │
│    ✓ Extract data from request                             │
│    ✓ Create Command                                         │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. APPLICATION - CreateUserCommandHandler                   │
│    ✓ Create Email Value Object (validate format)           │
│    ✓ Check email uniqueness                                │
│    ✓ Create Password Value Object (validate + hash)        │
│    ✓ Create User Entity                                    │
│    ✓ Call repository.save()                                │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DOMAIN - User Entity + Value Objects                     │
│    ✓ Email validates format (regex)                        │
│    ✓ Password validates rules (8 chars, uppercase, etc.)   │
│    ✓ Password hashes with bcrypt                           │
│    ✓ User entity created with validated data               │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. INFRASTRUCTURE - MongoUserRepository                     │
│    ✓ Transform User Entity → MongoDB Document              │
│    ✓ Save to MongoDB via Mongoose                          │
│    ✓ Transform MongoDB Document → User Entity              │
│    ✓ Return User Entity                                    │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DATABASE - MongoDB                                       │
│    ✓ Persist user document                                 │
│    ✓ Return saved document                                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. HTTP RESPONSE                                            │
│    201 Created                                              │
│    { success: true, data: { id, email, createdAt } }       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Dépendances entre composants

```
┌─────────────────────────────────────────────────────────────┐
│                         DEPENDENCIES                        │
└─────────────────────────────────────────────────────────────┘

UserController
    ↓ depends on
CreateUserCommandHandler
    ↓ depends on
IUserRepository (interface - defined in DOMAIN)
    ↑ implemented by
MongoUserRepository


┌─────────────────────────────────────────────────────────────┐
│                    INVERSION OF CONTROL                     │
└─────────────────────────────────────────────────────────────┘

                    IUserRepository
                    (interface)
                         ↑
        ┌────────────────┴────────────────┐
        │                                 │
CreateUserHandler              MongoUserRepository
(depends on interface)      (implements interface)

✅ Handler doesn't know about MongoDB
✅ We can swap MongoDB → PostgreSQL without touching the handler
```

---

## 📦 Structure des fichiers

```
src/
├── 📁 domain/                     ← CORE (no external dependencies)
│   ├── 📁 entities/
│   │   ├── 📄 User.ts            ← Business entity
│   │   └── 🧪 User.spec.ts
│   ├── 📁 valueObjects/
│   │   ├── 📄 Email.ts           ← Self-validating value object
│   │   ├── 🧪 Email.spec.ts
│   │   ├── 📄 Password.ts        ← Self-validating + hashing
│   │   └── 🧪 Password.spec.ts
│   └── 📁 repositories/
│       └── 📄 IUserRepository.ts ← Repository interface (abstraction)
│
├── 📁 application/                ← Use cases orchestration
│   ├── 📁 commands/
│   │   ├── 📄 CreateUserCommand.ts
│   │   ├── 📄 CreateUserCommandHandler.ts
│   │   └── 🧪 CreateUserCommandHandler.spec.ts
│   └── 📁 dtos/
│       └── 📄 CreateUserDTO.ts
│
├── 📁 infrastructure/             ← Technical details
│   ├── 📁 config/
│   │   └── 📄 environment.ts
│   └── 📁 persistence/
│       ├── 📄 MongoUserRepository.ts
│       ├── 🧪 MongoUserRepository.spec.ts
│       └── 📁 mongoose/
│           ├── 📄 connection.ts
│           └── 📄 userModel.ts
│
├── 📁 presentation/               ← HTTP API
│   ├── 📁 routes/
│   │   └── 📄 userRoutes.ts
│   ├── 📁 controllers/
│   │   └── 📄 UserController.ts
│   └── 📁 middlewares/
│       └── 📄 errorHandler.ts
│
├── 📄 app.ts                      ← Express app configuration
└── 📄 server.ts                   ← Server startup

Legend:
📁 Folder
📄 TypeScript file
🧪 Test file
```

---

## 🎯 Patterns appliqués

### Repository Pattern

```
┌──────────────────────────────────────────────────────┐
│              REPOSITORY PATTERN                      │
└──────────────────────────────────────────────────────┘

Application Layer:
    CreateUserCommandHandler
            ↓ uses
    IUserRepository (interface)
            ↑ implements
Infrastructure Layer:
    MongoUserRepository

Benefits:
✅ Abstraction of data access
✅ Easy to swap data sources
✅ Testable (mock the interface)
```

### CQRS (Command Query Responsibility Segregation)

```
┌──────────────────────────────────────────────────────┐
│                     CQRS                             │
└──────────────────────────────────────────────────────┘

COMMANDS (Write operations)
    CreateUserCommand
        ↓
    CreateUserCommandHandler
        ↓
    Modifies system state

QUERIES (Read operations) - to be implemented
    GetUserByIdQuery
        ↓
    GetUserByIdQueryHandler
        ↓
    Returns data without modification
```

### Dependency Injection

```
┌──────────────────────────────────────────────────────┐
│              DEPENDENCY INJECTION                    │
└──────────────────────────────────────────────────────┘

// Dependencies are injected, not created

const userRepository = new MongoUserRepository();
                ↓ injected
const handler = new CreateUserCommandHandler(userRepository);
                ↓ injected
const controller = new UserController(handler);

Benefits:
✅ Loose coupling
✅ Easy testing (inject mocks)
✅ Flexibility (swap implementations)
```

---

## 🔐 Sécurité - Password hashing

```
┌──────────────────────────────────────────────────────┐
│              PASSWORD LIFECYCLE                      │
└──────────────────────────────────────────────────────┘

User input:
    "ValidPass123" (plain text)
        ↓
Password.create():
    ✓ Validate length >= 8
    ✓ Validate has uppercase
    ✓ Validate has lowercase
    ✓ Validate has number
        ↓
bcrypt.hash():
    ✓ Generate salt (10 rounds)
    ✓ Hash password
        ↓
Stored in DB:
    "$2b$10$..." (hashed - 60 chars)
        ↓
Never returned to client:
    toPublicObject() excludes password
```

---

## 📊 Error Flow

```
┌──────────────────────────────────────────────────────┐
│                  ERROR HANDLING                      │
└──────────────────────────────────────────────────────┘

Any layer throws error
        ↓
Controller catches error
        ↓
next(error)
        ↓
Error Handler Middleware
        ↓
Map error message → HTTP status code
    - "already exists" → 409 Conflict
    - "Invalid..." → 400 Bad Request
    - "not found" → 404 Not Found
        ↓
Return JSON error response
    {
        success: false,
        error: {
            message: "...",
            statusCode: 400,
            timestamp: "...",
            path: "/user"
        }
    }
```

---

## 🧪 Test Strategy

```
┌──────────────────────────────────────────────────────┐
│                 TESTING LAYERS                       │
└──────────────────────────────────────────────────────┘

DOMAIN LAYER (Unit Tests - No mocks)
    Email.spec.ts
    Password.spec.ts
    User.spec.ts
    ✓ Pure business logic
    ✓ No external dependencies

APPLICATION LAYER (Unit Tests - Mock repository)
    CreateUserCommandHandler.spec.ts
    ✓ Mock IUserRepository
    ✓ Test use case logic

INFRASTRUCTURE LAYER (Integration Tests - Mock Mongoose)
    MongoUserRepository.spec.ts
    ✓ Mock Mongoose models
    ✓ Test data transformation

PRESENTATION LAYER (e2e Tests - To be implemented)
    ✓ Test HTTP endpoints
    ✓ Test complete flow
```

---

## 🚀 Request/Response Examples

### Success - Create User

```
REQUEST:
POST /user
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

↓ ↓ ↓

RESPONSE:
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error - Weak Password

```
REQUEST:
POST /user
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "weak"
}

↓ ↓ ↓

RESPONSE:
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Password must be at least 8 characters long",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/user"
  }
}
```

### Error - Duplicate Email

```
REQUEST:
POST /user
Content-Type: application/json

{
  "email": "existing@example.com",
  "password": "ValidPass123"
}

↓ ↓ ↓

RESPONSE:
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Email already exists",
    "statusCode": 409,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/user"
  }
}
```

---

Cette documentation visuelle aide à comprendre l'architecture DDD et les flux de données dans l'application.
