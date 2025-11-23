# 🤝 Guide de Contribution

Merci de vouloir contribuer à ce projet ! Ce guide vous aidera à respecter l'architecture DDD mise en place.

---

## 🎯 Principes à respecter ABSOLUMENT

### 1. Le domaine ne dépend de RIEN

❌ **INTERDIT dans src/domain/** :
```typescript
import express from 'express';        // ❌ NO
import mongoose from 'mongoose';      // ❌ NO
import axios from 'axios';           // ❌ NO
import { Request } from 'express';   // ❌ NO
```

✅ **AUTORISÉ dans src/domain/** :
```typescript
import { Email } from '../valueObjects/Email';  // ✅ YES (domaine interne)
import * as bcrypt from 'bcrypt';              // ✅ YES (exception pour Password)
```

### 2. Les Value Objects sont immuables

❌ **MAUVAIS** :
```typescript
class Email {
  private value: string;

  setValue(email: string) {  // ❌ NO - pas de setter
    this.value = email;
  }
}
```

✅ **BON** :
```typescript
class Email {
  private readonly value: string;  // ✅ YES - readonly

  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase();
  }
}
```

### 3. Les Value Objects se valident eux-mêmes

❌ **MAUVAIS** :
```typescript
const email = new Email('test@example.com');
if (!isValidEmail(email)) {  // ❌ Validation externe
  throw new Error('Invalid');
}
```

✅ **BON** :
```typescript
const email = new Email('test@example.com');  // ✅ Lance exception si invalide
```

### 4. Pas de new() direct - Injection de Dépendances

❌ **MAUVAIS** :
```typescript
class CreateUserHandler {
  async handle(command: CreateUserCommand) {
    const repo = new MongoUserRepository();  // ❌ Couplage fort
    await repo.save(user);
  }
}
```

✅ **BON** :
```typescript
class CreateUserHandler {
  constructor(private readonly userRepo: IUserRepository) {}  // ✅ Injection

  async handle(command: CreateUserCommand) {
    await this.userRepo.save(user);
  }
}
```

### 5. Le domaine définit les interfaces, l'infrastructure les implémente

✅ **BON** :
```
src/domain/repositories/IUserRepository.ts     ← Interface (domaine)
src/infrastructure/MongoUserRepository.ts      ← Implémentation (infra)
```

---

## 📝 Comment ajouter une nouvelle fonctionnalité

### Exemple : Ajouter la récupération d'un utilisateur par ID

#### 1. Commencer par le domaine

**src/domain/repositories/IUserRepository.ts** :
```typescript
export interface IUserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;  // ← Nouvelle méthode
}
```

#### 2. Créer la Query (CQRS)

**src/application/queries/GetUserByIdQuery.ts** :
```typescript
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}
```

**src/application/queries/GetUserByIdQueryHandler.ts** :
```typescript
export class GetUserByIdQueryHandler {
  constructor(private readonly userRepo: IUserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<User | null> {
    return this.userRepo.findById(query.userId);
  }
}
```

#### 3. Implémenter dans l'infrastructure

**src/infrastructure/persistence/MongoUserRepository.ts** :
```typescript
public async findById(id: string): Promise<User | null> {
  const doc = await UserModel.findById(id).exec();
  if (!doc) return null;
  return this.toDomain(doc);
}
```

#### 4. Ajouter le controller

**src/presentation/controllers/UserController.ts** :
```typescript
public getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = new GetUserByIdQuery(req.params.id);
    const user = await this.getUserHandler.handle(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', statusCode: 404 }
      });
    }

    res.status(200).json({
      success: true,
      data: user.toPublicObject()
    });
  } catch (error) {
    next(error);
  }
};
```

#### 5. Ajouter la route

**src/presentation/routes/userRoutes.ts** :
```typescript
router.get('/:id', userController.getUserById);
```

#### 6. Ajouter les tests

**src/application/queries/GetUserByIdQueryHandler.spec.ts** :
```typescript
describe('GetUserByIdQueryHandler', () => {
  it('should return user when found', async () => {
    mockRepo.findById.mockResolvedValue(mockUser);
    const result = await handler.handle(new GetUserByIdQuery('user-id'));
    expect(result).toEqual(mockUser);
  });

  it('should return null when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const result = await handler.handle(new GetUserByIdQuery('unknown'));
    expect(result).toBeNull();
  });
});
```

---

## 🧪 Tests obligatoires

### Pour chaque nouveau Value Object

```typescript
describe('MonValue Object', () => {
  it('should create valid value object');
  it('should throw error for invalid input');
  it('should be immutable');
  it('should implement equality');
});
```

### Pour chaque nouveau Handler

```typescript
describe('MonHandler', () => {
  it('should execute use case successfully');
  it('should throw error on validation failure');
  it('should call repository with correct params');
});
```

### Pour chaque nouveau Repository

```typescript
describe('MonRepository', () => {
  it('should save entity');
  it('should find entity by criteria');
  it('should return null when not found');
  it('should transform domain ↔ persistence correctly');
});
```

---

## 🎨 Style de code

### Conventions de nommage

```typescript
// Classes : PascalCase
class CreateUserCommand {}
class UserController {}

// Interfaces : IPascalCase
interface IUserRepository {}
interface IEmailService {}

// Variables/Functions : camelCase
const userId = '123';
function getUserById() {}

// Constants : UPPER_SNAKE_CASE
const MAX_PASSWORD_LENGTH = 128;
const DEFAULT_PAGE_SIZE = 20;

// Fichiers : PascalCase.ts
User.ts
CreateUserCommand.ts
IUserRepository.ts
```

### JSDoc obligatoire

```typescript
/**
 * Crée un nouvel utilisateur.
 *
 * @param {CreateUserCommand} command - La commande de création
 * @returns {Promise<User>} L'utilisateur créé
 * @throws {Error} Si l'email existe déjà
 */
public async handle(command: CreateUserCommand): Promise<User> {
  // ...
}
```

### Gestion d'erreurs

✅ **BON** :
```typescript
if (!email) {
  throw new Error('Email cannot be empty');
}
```

❌ **MAUVAIS** :
```typescript
if (!email) {
  console.log('Email is empty');  // ❌ Ne pas logger, lancer exception
  return null;
}
```

---

## 📂 Où placer mon code ?

### Nouvelle validation métier
→ **src/domain/valueObjects/**

### Nouvelle entité métier
→ **src/domain/entities/**

### Nouveau cas d'usage
→ **src/application/commands/** ou **src/application/queries/**

### Nouvelle intégration externe (API, BDD)
→ **src/infrastructure/**

### Nouvelle route HTTP
→ **src/presentation/routes/**

---

## 🔍 Checklist avant commit

- [ ] Mon code respecte la séparation des couches
- [ ] Le domaine ne dépend d'aucune lib externe
- [ ] J'ai ajouté des tests unitaires
- [ ] Tous les tests passent (`pnpm test`)
- [ ] TypeScript compile sans erreur (`pnpm build`)
- [ ] J'ai ajouté JSDoc sur mes classes/méthodes
- [ ] J'ai formaté mon code (`pnpm format`)
- [ ] Mon code respecte ESLint (`pnpm lint`)
- [ ] J'ai mis à jour la documentation si nécessaire

---

## 🚫 Anti-patterns à éviter

### 1. God Objects

❌ **MAUVAIS** :
```typescript
class UserService {
  createUser() {}
  updateUser() {}
  deleteUser() {}
  sendEmail() {}
  processPayment() {}
  generateReport() {}
  // ... 50 méthodes
}
```

✅ **BON** :
```typescript
class CreateUserHandler {}
class UpdateUserHandler {}
class SendEmailService {}
class PaymentProcessor {}
```

### 2. Anemic Domain Model

❌ **MAUVAIS** :
```typescript
class User {
  id: string;
  email: string;
  password: string;
  // Pas de méthodes, juste des données
}

// Logique métier dans un service
class UserService {
  verifyPassword(user: User, password: string) {
    return bcrypt.compare(password, user.password);
  }
}
```

✅ **BON** :
```typescript
class User {
  private readonly password: Password;

  // Logique métier dans l'entité
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }
}
```

### 3. Transaction Script

❌ **MAUVAIS** :
```typescript
async function createUser(email: string, password: string) {
  // Tout dans une fonction procédurale
  if (!email.includes('@')) throw new Error('Invalid email');
  const hash = await bcrypt.hash(password, 10);
  await db.users.insert({ email, password: hash });
}
```

✅ **BON** :
```typescript
// Séparation des responsabilités
const email = new Email(emailStr);  // Validation
const password = await Password.create(passwordStr);  // Validation + hash
const user = new User(id, email, password);  // Création entité
await userRepository.save(user);  // Persistence
```

---

## 💬 Questions fréquentes

### Q: Puis-je utiliser Mongoose dans le domaine ?

**R:** Non ! Le domaine ne doit dépendre d'AUCUNE technologie externe. Mongoose doit rester dans `src/infrastructure/`.

### Q: Où mettre la validation de l'email ?

**R:** Dans le Value Object `Email` (domaine). La validation métier appartient toujours au domaine.

### Q: Puis-je avoir un service dans le domaine ?

**R:** Oui, pour la logique métier qui ne rentre pas dans une entité ou VO. Exemple : `DuplicateEmailChecker` (service du domaine).

### Q: Comment tester un repository ?

**R:** Mocker Mongoose dans les tests. Ne pas dépendre d'une vraie base de données pour les tests unitaires.

---

## 📚 Ressources recommandées

### Livres
- **Domain-Driven Design** - Eric Evans
- **Clean Architecture** - Robert C. Martin
- **Implementing Domain-Driven Design** - Vaughn Vernon

### Articles
- [DDD, Hexagonal, Clean Architecture](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)
- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🎉 Merci !

Votre contribution respectueuse de l'architecture DDD est appréciée ! 🙏

Pour toute question, ouvrez une issue sur GitHub.
