# Architecture DDD - Documentation technique

## 📐 Vue d'ensemble

Cette application implémente une architecture **Domain-Driven Design (DDD)** stricte avec **Clean Architecture**.

### Principes fondamentaux

1. **Séparation des préoccupations** - Chaque couche a une responsabilité unique
2. **Inversion de dépendances** - Les couches externes dépendent des couches internes
3. **Indépendance des frameworks** - Le domaine ne dépend d'aucune technologie
4. **Testabilité** - Chaque composant peut être testé isolément

---

## 🏗️ Les 4 couches de l'architecture

### Règle de dépendance

```
┌──────────────────────────────────────────────┐
│           PRESENTATION LAYER                  │
│         (Express, Routes, Controllers)        │
├──────────────────────────────────────────────┤
│           APPLICATION LAYER                   │
│        (Use Cases, Commands, Handlers)        │
├──────────────────────────────────────────────┤
│           DOMAIN LAYER (CORE)                 │
│   (Entities, Value Objects, Domain Logic)     │
│         ⚠️ AUCUNE DÉPENDANCE EXTERNE          │
├──────────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER                  │
│      (Database, External APIs, Config)        │
└──────────────────────────────────────────────┘

Direction des dépendances : ↓ (vers le domaine)
```

---

## 1. DOMAIN LAYER (Cœur métier)

### Responsabilité

Le domaine contient toute la **logique métier** de l'application. Il est **totalement indépendant** des technologies externes.

### Composants

#### Entities (Entités)

**Fichier** : [src/domain/entities/User.ts](src/domain/entities/User.ts)

```typescript
class User {
  private readonly id: string;
  private readonly email: Email;
  private readonly password: Password;
  private readonly createdAt: Date;

  // Logique métier
  public async verifyPassword(plainPassword: string): Promise<boolean>
  public toPublicObject(): object
}
```

**Caractéristiques** :
- Possède une **identité unique** (id)
- Immuable (pas de setters, readonly)
- Contient la logique métier
- Cycle de vie complet

#### Value Objects

**Fichier** : [src/domain/valueObjects/Email.ts](src/domain/valueObjects/Email.ts)

```typescript
class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validate(email); // Auto-validation
    this.value = email.toLowerCase().trim();
  }

  private validate(email: string): void {
    // Validation stricte
  }
}
```

**Caractéristiques** :
- **Pas d'identité** (défini par sa valeur)
- **Immuable** (pas de setters)
- **Auto-validé** (lance exception si invalide)
- Encapsule la logique de validation

**Fichier** : [src/domain/valueObjects/Password.ts](src/domain/valueObjects/Password.ts)

```typescript
class Password {
  private readonly hashedValue: string;

  public static async create(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);
    const hashed = await bcrypt.hash(plainPassword, 10);
    return new Password(hashed);
  }

  public async compare(plainPassword: string): Promise<boolean>
}
```

**Caractéristiques** :
- Factory method pour création (`create`)
- Validation des règles métier (8 chars, majuscule, etc.)
- Hachage automatique avec bcrypt
- Comparaison sécurisée

#### Repository Interface

**Fichier** : [src/domain/repositories/IUserRepository.ts](src/domain/repositories/IUserRepository.ts)

```typescript
interface IUserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
}
```

**Principe** : **Dependency Inversion Principle (DIP)**

Le domaine définit **ce dont il a besoin** (interface), l'infrastructure **l'implémente**.

```
Domain (définit)  →  IUserRepository (interface)
                          ↑
Infrastructure (implémente)  →  MongoUserRepository
```

### Règles strictes du domaine

❌ **INTERDIT dans le domaine** :
- `import express`
- `import mongoose`
- `import axios`
- Tout framework ou librairie externe (sauf bcrypt pour Password)

✅ **AUTORISÉ dans le domaine** :
- TypeScript natif
- Logique métier pure
- Interfaces
- Exceptions

---

## 2. APPLICATION LAYER (Orchestration)

### Responsabilité

La couche application **orchestre** les cas d'usage métier. Elle coordonne les entités et services du domaine.

### Composants

#### Commands (CQRS)

**Fichier** : [src/application/commands/CreateUserCommand.ts](src/application/commands/CreateUserCommand.ts)

```typescript
class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}
```

**Principe** : **CQRS (Command Query Responsibility Segregation)**

- **Command** = Intention de modifier l'état (écriture)
- **Query** = Récupérer des données (lecture)

#### Command Handlers

**Fichier** : [src/application/commands/CreateUserCommandHandler.ts](src/application/commands/CreateUserCommandHandler.ts)

```typescript
class CreateUserCommandHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: CreateUserCommand): Promise<User> {
    // 1. Créer Value Objects (validation)
    const email = new Email(command.email);
    const password = await Password.create(command.password);

    // 2. Vérifier règles métier
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) throw new Error('Email already exists');

    // 3. Créer l'entité
    const user = new User(randomUUID(), email, password);

    // 4. Persister
    return await this.userRepository.save(user);
  }
}
```

**Flux** :
1. Recevoir la commande
2. Valider via Value Objects
3. Appliquer règles métier
4. Créer/modifier entités
5. Persister via repository

#### DTOs (Data Transfer Objects)

**Fichier** : [src/application/dtos/CreateUserDTO.ts](src/application/dtos/CreateUserDTO.ts)

```typescript
interface CreateUserDTO {
  email: string;
  password: string;
}
```

**Rôle** : Découpler la présentation de l'application

### Injection de dépendances

```typescript
// L'application reçoit ses dépendances en paramètres
const handler = new CreateUserCommandHandler(userRepository);
```

**Avantage** : Facilite les tests (on peut injecter des mocks)

---

## 3. INFRASTRUCTURE LAYER (Détails techniques)

### Responsabilité

Implémente les **détails techniques** : base de données, APIs externes, système de fichiers.

### Composants

#### Repository Implementation

**Fichier** : [src/infrastructure/persistence/MongoUserRepository.ts](src/infrastructure/persistence/MongoUserRepository.ts)

```typescript
class MongoUserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    const doc = new UserModel({
      _id: user.getId(),
      email: user.getEmail().getValue(),
      password: user.getPassword().getHash(),
    });
    await doc.save();
    return this.toDomain(doc);
  }

  private toDomain(doc: IUserDocument): User {
    // Transforme document MongoDB → Entité domaine
    const email = new Email(doc.email);
    const password = Password.fromHash(doc.password);
    return new User(doc._id, email, password, doc.createdAt);
  }
}
```

**Responsabilités** :
- Implémente `IUserRepository` (contrat du domaine)
- Transforme **Entités ↔ Documents MongoDB**
- Gère les erreurs de base de données
- Encapsule Mongoose

#### Mongoose Models

**Fichier** : [src/infrastructure/persistence/mongoose/userModel.ts](src/infrastructure/persistence/mongoose/userModel.ts)

```typescript
const userSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
```

**Singleton** : Le model est créé une seule fois

#### Database Connection

**Fichier** : [src/infrastructure/persistence/mongoose/connection.ts](src/infrastructure/persistence/mongoose/connection.ts)

```typescript
class MongoConnection {
  private static instance: MongoConnection;

  public static getInstance(): MongoConnection {
    if (!this.instance) this.instance = new MongoConnection();
    return this.instance;
  }

  public async connect(): Promise<void> {
    await mongoose.connect(Environment.MONGODB_URI);
  }
}
```

**Pattern Singleton** : Une seule connexion MongoDB active

#### Configuration

**Fichier** : [src/infrastructure/config/environment.ts](src/infrastructure/config/environment.ts)

```typescript
class Environment {
  public static readonly PORT = parseInt(process.env.PORT || '3000');
  public static readonly MONGODB_URI = process.env.MONGODB_URI;

  public static validate(): void {
    // Vérifie que toutes les variables requises sont présentes
  }
}
```

---

## 4. PRESENTATION LAYER (API)

### Responsabilité

Gère l'interface utilisateur (API HTTP dans notre cas).

### Composants

#### Controllers

**Fichier** : [src/presentation/controllers/UserController.ts](src/presentation/controllers/UserController.ts)

```typescript
class UserController {
  constructor(private readonly createUserHandler: CreateUserCommandHandler) {}

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validation HTTP
      this.validateRequest(req.body);

      // 2. Créer commande
      const command = new CreateUserCommand(req.body.email, req.body.password);

      // 3. Déléguer à l'application
      const user = await this.createUserHandler.handle(command);

      // 4. Formater réponse HTTP
      res.status(201).json({ success: true, data: user.toPublicObject() });
    } catch (error) {
      next(error); // Déléguer au middleware d'erreur
    }
  };
}
```

**Responsabilités** :
- Validation du format HTTP
- Extraction des données de la requête
- Délégation à la couche application
- Formatage de la réponse HTTP
- Gestion d'erreurs (via next)

#### Routes

**Fichier** : [src/presentation/routes/userRoutes.ts](src/presentation/routes/userRoutes.ts)

```typescript
export const createUserRouter = (): Router => {
  const router = Router();

  // Injection manuelle de dépendances
  const userRepository = new MongoUserRepository();
  const createUserHandler = new CreateUserCommandHandler(userRepository);
  const userController = new UserController(createUserHandler);

  router.post('/', userController.createUser);

  return router;
};
```

**Injection de dépendances** : Les dépendances sont créées ici et injectées

#### Middlewares

**Fichier** : [src/presentation/middlewares/errorHandler.ts](src/presentation/middlewares/errorHandler.ts)

```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Mapper les erreurs métier → Codes HTTP
  let statusCode = 500;

  if (error.message.includes('already exists')) statusCode = 409;
  else if (error.message.includes('Invalid')) statusCode = 400;

  res.status(statusCode).json({
    success: false,
    error: { message: error.message, statusCode },
  });
};
```

**Centralisation** : Toutes les erreurs passent par ce middleware

---

## 🔄 Flux complet d'une requête

### Exemple : POST /user

```
1. HTTP Request
   ↓
2. Express Router (/user)
   ↓
3. UserController.createUser()
   - Valide format HTTP
   - Crée CreateUserCommand
   ↓
4. CreateUserCommandHandler.handle()
   - Crée Email Value Object (validation)
   - Crée Password Value Object (validation + hash)
   - Vérifie unicité email (via repository)
   - Crée User Entity
   - Appelle repository.save()
   ↓
5. MongoUserRepository.save()
   - Transforme User → UserDocument
   - Sauvegarde via Mongoose
   - Transforme UserDocument → User
   - Retourne User
   ↓
6. UserController (suite)
   - Formate réponse HTTP
   - Retourne JSON
   ↓
7. HTTP Response (201 Created)
```

---

## 🧪 Stratégie de tests

### Tests par couche

#### Domain Layer

**Fichiers** : `*.spec.ts` dans `src/domain/`

```typescript
// Test Value Object
it('should throw error for invalid email', () => {
  expect(() => new Email('invalid')).toThrow('Invalid email format');
});

// Test Entity
it('should verify password correctly', async () => {
  const user = new User(id, email, password);
  const isValid = await user.verifyPassword('ValidPass123');
  expect(isValid).toBe(true);
});
```

**Pas de mocks** : Tests unitaires purs (pas de dépendances externes)

#### Application Layer

**Fichiers** : `*.spec.ts` dans `src/application/`

```typescript
// Mock du repository
const mockRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  existsByEmail: jest.fn(),
};

it('should create user successfully', async () => {
  mockRepository.existsByEmail.mockResolvedValue(false);
  mockRepository.save.mockImplementation(async (user) => user);

  const command = new CreateUserCommand('test@example.com', 'ValidPass123');
  const result = await handler.handle(command);

  expect(result).toBeInstanceOf(User);
});
```

**Mocks** : On mock le repository pour isoler le handler

#### Infrastructure Layer

**Fichiers** : `*.spec.ts` dans `src/infrastructure/`

```typescript
// Mock Mongoose
jest.mock('./mongoose/userModel');

it('should save user to database', async () => {
  const mockSave = jest.fn().mockResolvedValue(mockDocument);
  UserModel.mockImplementation(() => ({ save: mockSave }));

  await repository.save(user);

  expect(mockSave).toHaveBeenCalled();
});
```

**Mocks** : On mock Mongoose pour ne pas dépendre de MongoDB

---

## 🎯 Patterns appliqués

### 1. Repository Pattern

**Objectif** : Abstraire la persistence

```typescript
// Interface (domaine)
interface IUserRepository {
  save(user: User): Promise<User>;
}

// Implémentation (infrastructure)
class MongoUserRepository implements IUserRepository { ... }
class PostgresUserRepository implements IUserRepository { ... }
```

**Avantage** : On peut changer de BDD sans toucher au domaine

### 2. Dependency Inversion Principle (DIP)

**Objectif** : Les modules de haut niveau ne dépendent pas des modules de bas niveau

```
❌ AVANT (couplage fort)
UserService → MongoUserRepository (dépend de MongoDB)

✅ APRÈS (couplage faible)
UserService → IUserRepository ← MongoUserRepository
```

### 3. CQRS (Command Query Responsibility Segregation)

**Objectif** : Séparer les opérations d'écriture (Commands) et de lecture (Queries)

```typescript
// Command (écriture)
class CreateUserCommand { ... }
class CreateUserCommandHandler { ... }

// Query (lecture) - à implémenter
class GetUserByIdQuery { ... }
class GetUserByIdQueryHandler { ... }
```

### 4. Value Objects

**Objectif** : Encapsuler la validation métier

```typescript
// ❌ AVANT
if (email.indexOf('@') === -1) throw new Error('Invalid email');

// ✅ APRÈS
const email = new Email('test@example.com'); // Auto-validé
```

### 5. Factory Pattern

**Objectif** : Contrôler la création d'objets

```typescript
// Password ne peut être créé que via la factory
const password = await Password.create('plaintext'); // Validation + hash

// Ou depuis un hash existant
const password = Password.fromHash('$2b$10$...');
```

### 6. Singleton Pattern

**Objectif** : Garantir une seule instance

```typescript
const connection = MongoConnection.getInstance();
```

---

## ✅ Checklist Clean DDD

- [x] Le domaine ne dépend d'AUCUNE technologie externe
- [x] Les Value Objects sont immuables et auto-validés
- [x] Les Entités ont une identité et contiennent la logique métier
- [x] Le domaine définit les interfaces (IRepository)
- [x] L'infrastructure implémente les interfaces du domaine
- [x] L'application orchestre les cas d'usage
- [x] La présentation délègue à l'application
- [x] Les dépendances sont injectées
- [x] Chaque couche est testée indépendamment
- [x] Les erreurs métier sont explicites
- [x] Le code est typé strictement (TypeScript)

---

## 📚 Ressources

### Livres

- **Domain-Driven Design** - Eric Evans
- **Clean Architecture** - Robert C. Martin
- **Implementing Domain-Driven Design** - Vaughn Vernon

### Articles

- [DDD, Hexagonal, Onion, Clean, CQRS](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)
- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🤔 Questions fréquentes

### Pourquoi séparer en autant de couches ?

**Réponse** : Chaque couche a une responsabilité unique. Cela facilite :
- La maintenance (code organisé)
- Les tests (isoler les composants)
- L'évolution (changer une couche sans impacter les autres)

### Pourquoi le domaine ne peut-il pas importer Mongoose ?

**Réponse** : Le domaine représente le **cœur métier**, indépendant de toute technologie. Si demain on change MongoDB pour PostgreSQL, le domaine ne doit **pas changer**.

### C'est pas trop complexe pour une simple route POST /user ?

**Réponse** : Pour un projet jetable, oui. Mais pour une application **évolutive** et **maintenable**, cette architecture devient vite indispensable. Elle évite la "big ball of mud".

### Quand utiliser DDD ?

**Réponse** : Quand :
- Le domaine métier est complexe
- L'application doit évoluer sur le long terme
- Plusieurs développeurs travaillent dessus
- La logique métier change souvent

---

Cette documentation décrit l'architecture DDD appliquée dans ce projet. Elle doit être mise à jour au fur et à mesure de l'évolution du code.
