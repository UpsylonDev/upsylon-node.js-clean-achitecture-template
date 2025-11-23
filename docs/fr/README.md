# API User - Domain-Driven Design (DDD) avec Clean Architecture

API Node.js + Express + TypeScript construite selon les principes du **Domain-Driven Design** et **Clean Architecture**.

## 📋 Table des matières

- [Caractéristiques](#caractéristiques)
- [Architecture DDD](#architecture-ddd)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Standards de Commit (Husky)](#-standards-de-commit-husky)
- [API Endpoints](#-api-endpoints)
- [Tests](#-tests)
- [Structure du projet](#-structure-du-projet)
- [Explication de l'architecture](#-explication-de-larchitecture)
- [Principes DDD appliqués](#-principes-ddd-appliqués)

---

## ✨ Caractéristiques

- ✅ **Domain-Driven Design (DDD)** - Séparation stricte des couches
- ✅ **Clean Architecture** - Dépendances inversées
- ✅ **CQRS** - Command Query Responsibility Segregation
- ✅ **TypeScript strict** - Type safety complet
- ✅ **Express.js** - Framework web minimaliste
- ✅ **MongoDB + Mongoose** - Base de données NoSQL
- ✅ **Tests unitaires** - Jest avec couverture complète
- ✅ **Validation métier** - Value Objects auto-validés
- ✅ **Sécurité** - Mots de passe hashés avec bcrypt
- ✅ **Gestion d'erreurs** - Middleware centralisé
- ✅ **Monitoring** - Grafana + Prometheus + Loki
- ✅ **Redis** - Cache-Aside Pattern avec rate limiting

---

## 🏛️ Architecture DDD

L'application est structurée en **4 couches distinctes** :

```
┌─────────────────────────────────────┐
│      PRESENTATION (API Layer)       │  ← Express Routes, Controllers
├─────────────────────────────────────┤
│     APPLICATION (Use Cases)         │  ← Command Handlers, DTOs
├─────────────────────────────────────┤
│     DOMAIN (Business Logic)         │  ← Entities, Value Objects, Interfaces
├─────────────────────────────────────┤
│   INFRASTRUCTURE (Technical)        │  ← MongoDB, Mongoose, Config
└─────────────────────────────────────┘
```

### Flux de données

```
HTTP Request → Controller → Command → Handler → Domain → Repository → Database
                  ↓           ↓         ↓         ↓          ↓
               Validation   DTO     Use Case   Entities   MongoDB
```

---

## 🔧 Prérequis

- **Node.js** >= 18.x
- **npm** ou **pnpm** ou **yarn**
- **MongoDB** >= 6.x (local ou Atlas)
- **TypeScript** >= 5.x

---

## 📦 Installation

### 1. Cloner le projet

```bash
cd a-ddd-from-scratch
```

### 2. Installer les dépendances

Avec **pnpm** (recommandé) :
```bash
pnpm install
```

Ou avec **npm** :
```bash
npm install
```

Ou avec **yarn** :
```bash
yarn install
```

---

## ⚙️ Configuration

### 1. Créer le fichier `.env`

Copier le fichier `.env.example` et le renommer en `.env` :

```bash
cp .env.example .env
```

### 2. Configurer les variables d'environnement

Éditer le fichier `.env` avec vos paramètres :

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB - Option 1 : Local
MONGODB_URI=mongodb://localhost:27017/ddd-user-api

# MongoDB - Option 2 : MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ddd-user-api

# Security
BCRYPT_SALT_ROUNDS=10

# Stripe (optionnel - pour future intégration)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 3. Installer MongoDB (si nécessaire)

#### Option A : MongoDB Local

**Windows** :
```bash
# Télécharger depuis https://www.mongodb.com/try/download/community
# Ou avec Chocolatey :
choco install mongodb
```

**macOS** :
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu)** :
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Option B : MongoDB Atlas (Cloud)

1. Créer un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster
3. Configurer l'accès réseau (IP Whitelist)
4. Créer un utilisateur de base de données
5. Copier la chaîne de connexion dans `.env`

---

## 🚀 Démarrage

### Mode développement (avec hot reload)

```bash
pnpm dev
# ou npm run dev
# ou yarn dev
```

Le serveur démarre sur `http://localhost:3000`

### Mode production

```bash
# 1. Build du projet
pnpm build

# 2. Démarrer le serveur
pnpm start
```

### Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📊 Monitoring et Observabilité

Le projet inclut une stack complète de monitoring et d'observabilité.

### Services de monitoring

Le fichier `docker-compose.yml` démarre automatiquement :

- **Grafana** (http://localhost:3001) - Dashboards et visualisation
- **Prometheus** (http://localhost:9090) - Métriques et alertes  
- **Loki** (http://localhost:3100) - Agrégation de logs
- **Promtail** - Collecte et envoi des logs vers Loki

### Démarrer la stack de monitoring

```bash
docker-compose up -d
```

### Accès à Grafana

1. Ouvrir http://localhost:3001
2. Se connecter avec :
   - **Username** : `admin`
   - **Password** : `admin` (vous serez invité à le changer)
3. Configurer les data sources :
   - **Prometheus** : `http://prometheus:9090`
   - **Loki** : `http://loki:3100`

### Métriques disponibles

L'application expose des métriques Prometheus sur `/metrics` :

- **Métriques HTTP** :
  - Nombre de requêtes par endpoint
  - Latence des requêtes (histogrammes)
  - Codes de statut HTTP
  
- **Métriques système** :
  - Utilisation CPU
  - Utilisation mémoire
  - Garbage collection
  
- **Métriques métier** :
  - Créations d'utilisateurs
  - Erreurs de validation
  - Cache hits/misses (Redis)

### Logs structurés

Les logs sont collectés automatiquement par Promtail et envoyés à Loki :

- **Logs applicatifs** (Pino) - Format JSON structuré
- **Logs HTTP** - Requêtes avec timing et métadonnées
- **Logs des conteneurs** - Tous les services Docker

Consulter les logs dans Grafana via l'explorateur Loki.

### Health checks

Tous les services incluent des health checks :

```bash
# Vérifier l'état de tous les services
docker-compose ps

# Vérifier l'application
curl http://localhost:3000/health

# Vérifier les métriques
curl http://localhost:3000/metrics
```

---

## 📝 Standards de Commit (Husky)

Ce projet utilise **Husky** avec **commitlint** pour maintenir des bonnes pratiques de commit.

### Format des commits (Conventional Commits)

```
<type>(<scope>): <subject>
```

**Types autorisés :**
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Modification de documentation
- `style` - Formatage du code (sans changement logique)
- `refactor` - Refactorisation du code
- `perf` - Amélioration de performance
- `test` - Modifications des tests
- `build` - Changements du système de build
- `ci` - Changements CI/CD
- `chore` - Tâches de maintenance
- `revert` - Revert d'un commit précédent
- `secu` - Améliorations de sécurité

**Exemples valides :**
```bash
feat(user): add email validation in value object
fix(auth): resolve password hashing issue
docs: update api documentation
refactor(domain): simplify entity creation
test(user): add email value object tests
secu(password): enhance complexity requirements
```

### Hooks automatiques

**Pre-commit hook** (avant chaque commit) :
- ✨ **ESLint** : Corrige les problèmes de qualité
- 💅 **Prettier** : Formate le code
- 🧪 **Jest** : Lance les tests des fichiers modifiés

**Commit-msg hook** (validation du message) :
- Vérifie le format Conventional Commits
- Force minuscules et limite de 100 caractères
- Rejette les commits invalides

Pour plus de détails, consultez [COMMIT_CONVENTION.md](../../COMMIT_CONVENTION.md).

---

## 🌐 API Endpoints

### Health Check

**GET** `/health`

Vérifie que le serveur est opérationnel.

```bash
curl http://localhost:3000/health
```

---

### Créer un utilisateur

**POST** `/user`

Crée un nouveau compte utilisateur.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Validations

- **Email** :
  - Format valide (regex)
  - Unique (non présent en base)

- **Password** :
  - Minimum 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 minuscule
  - Au moins 1 chiffre

#### Response Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "user@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "message": "Password must contain at least one uppercase letter",
    "statusCode": 400,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/user"
  }
}
```

#### Response Error (409 Conflict)

```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "statusCode": 409,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/user"
  }
}
```

#### Exemples cURL

**Succès** :
```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123"}'
```

**Email invalide** :
```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"ValidPass123"}'
```

**Password faible** :
```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak"}'
```

---

## 🧪 Tests

### Lancer tous les tests

```bash
pnpm test
```

### Lancer les tests en mode watch

```bash
pnpm test:watch
```

### Couverture de code

```bash
pnpm test
```

Le rapport de couverture est généré dans `coverage/`.

### Tests par couche

Les tests couvrent chaque couche de l'architecture :

- ✅ **Domain** : Email, Password, User
- ✅ **Application** : CreateUserCommandHandler
- ✅ **Infrastructure** : MongoUserRepository

---

## 📁 Structure du projet

```
a-ddd-from-scratch/
├── src/
│   ├── domain/                          # ⚠️ AUCUNE dépendance externe
│   │   ├── entities/
│   │   │   ├── User.ts                  # Entité User avec logique métier
│   │   │   └── User.spec.ts
│   │   ├── valueObjects/
│   │   │   ├── Email.ts                 # Value Object Email (validation)
│   │   │   ├── Email.spec.ts
│   │   │   ├── Password.ts              # Value Object Password (hachage)
│   │   │   └── Password.spec.ts
│   │   └── repositories/
│   │       └── IUserRepository.ts       # Interface du repository (abstraction)
│   │
│   ├── application/                     # Cas d'usage / Orchestration
│   │   ├── commands/
│   │   │   ├── CreateUserCommand.ts     # Command CQRS
│   │   │   ├── CreateUserCommandHandler.ts
│   │   │   └── CreateUserCommandHandler.spec.ts
│   │   └── dtos/
│   │       └── CreateUserDTO.ts         # Data Transfer Object
│   │
│   ├── infrastructure/                  # Détails techniques
│   │   ├── config/
│   │   │   └── environment.ts           # Variables d'environnement
│   │   └── persistence/
│   │       ├── MongoUserRepository.ts   # Implémentation MongoDB
│   │       ├── MongoUserRepository.spec.ts
│   │       └── mongoose/
│   │           ├── connection.ts        # Connexion MongoDB
│   │           └── userModel.ts         # Mongoose Schema + Model
│   │
│   ├── presentation/                    # API / Interface utilisateur
│   │   ├── routes/
│   │   │   └── userRoutes.ts            # Express Router
│   │   ├── controllers/
│   │   │   └── UserController.ts        # Controller Express
│   │   └── middlewares/
│   │       └── errorHandler.ts          # Gestion d'erreurs centralisée
│   │
│   ├── app.ts                           # Configuration Express
│   └── server.ts                        # Point d'entrée (démarrage serveur)
│
├── .env.example                         # Template variables d'environnement
├── .gitignore
├── jest.config.js                       # Configuration Jest
├── nodemon.json                         # Configuration Nodemon
├── package.json
├── tsconfig.json                        # Configuration TypeScript
└── README.md
```

---

## 🎓 Explication de l'architecture

### 1️⃣ DOMAIN (Cœur métier)

**Responsabilité** : Logique métier pure, indépendante de toute technologie.

#### Entités

- **User** : Représente un utilisateur avec son cycle de vie
- Contient la logique métier (ex: `verifyPassword`)
- Immuable (pas de setters)

#### Value Objects

- **Email** : Encapsule et valide un email
- **Password** : Encapsule, valide et hache un mot de passe
- Auto-validés (lancent des exceptions si invalides)
- Immuables

#### Repository Interface

- **IUserRepository** : Contrat d'abstraction pour la persistence
- Le domaine définit ce dont il a besoin
- L'infrastructure l'implémente (Inversion de Dépendances)

### 2️⃣ APPLICATION (Orchestration)

**Responsabilité** : Coordonne les cas d'usage métier.

#### Commands

- **CreateUserCommand** : Encapsule l'intention de créer un utilisateur
- Pattern CQRS (Command Query Responsibility Segregation)

#### Command Handlers

- **CreateUserCommandHandler** : Orchestre la création d'utilisateur
  1. Valide via les Value Objects
  2. Vérifie l'unicité de l'email
  3. Crée l'entité User
  4. Demande au repository de persister

#### DTOs

- **CreateUserDTO** : Objet de transfert de données
- Découple la présentation de l'application

### 3️⃣ INFRASTRUCTURE (Détails techniques)

**Responsabilité** : Implémente les détails techniques (base de données, APIs externes).

#### Repository Implementation

- **MongoUserRepository** : Implémente `IUserRepository` avec Mongoose
- Transforme les entités du domaine ↔ documents MongoDB
- Gère les erreurs de duplication (code 11000)

#### Mongoose

- **userModel** : Schéma et Model Mongoose
- **connection** : Singleton de connexion MongoDB

#### Configuration

- **environment** : Centralise les variables d'environnement
- Valide la présence des variables requises

### 4️⃣ PRESENTATION (API)

**Responsabilité** : Interface HTTP avec l'utilisateur.

#### Controllers

- **UserController** : Gère les requêtes HTTP
- Valide le format de la requête
- Délègue à la couche application
- Formate la réponse HTTP

#### Routes

- **userRoutes** : Configure le router Express
- Injection de dépendances manuelle

#### Middlewares

- **errorHandler** : Capture toutes les erreurs
- Transforme les erreurs métier en codes HTTP appropriés
- **notFoundHandler** : Gère les routes 404

---

## 🧩 Principes DDD appliqués

### 1. Séparation des couches (Layered Architecture)

Chaque couche a une responsabilité claire et ne dépend que des couches internes.

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓           ↓            ↓
   HTTP          Usecases    Business    Database
```

### 2. Inversion de Dépendances (DIP)

Le domaine définit les interfaces (`IUserRepository`), l'infrastructure les implémente (`MongoUserRepository`).

```typescript
// Domain définit ce dont il a besoin
interface IUserRepository {
  save(user: User): Promise<User>;
}

// Infrastructure implémente
class MongoUserRepository implements IUserRepository {
  async save(user: User): Promise<User> { ... }
}
```

### 3. Value Objects

Encapsulent les validations métier et sont immuables.

```typescript
const email = new Email('test@example.com'); // Auto-validé
const password = await Password.create('SecurePass123'); // Auto-validé et haché
```

### 4. Entités

Représentent des objets métier avec identité et cycle de vie.

```typescript
const user = new User(id, email, password);
user.getId(); // Pas de setter, immuable
```

### 5. Repository Pattern

Abstraction de la persistence, découple le domaine de la base de données.

```typescript
// Le domaine ne sait pas que c'est MongoDB
const user = await userRepository.save(user);
```

### 6. CQRS (Command Query Responsibility Segregation)

Séparation des commandes (écriture) et requêtes (lecture).

```typescript
// Command (écriture)
const command = new CreateUserCommand(email, password);
await handler.handle(command);
```

### 7. Injection de Dépendances

Les dépendances sont passées en paramètres, pas créées directement.

```typescript
const handler = new CreateUserCommandHandler(userRepository);
const controller = new UserController(handler);
```

---

## 📊 Avantages de cette architecture

✅ **Testabilité** - Chaque couche est testable indépendamment
✅ **Maintenabilité** - Code organisé et prévisible
✅ **Scalabilité** - Facile d'ajouter de nouvelles fonctionnalités
✅ **Flexibilité** - Changement de BDD ou framework sans impact sur le domaine
✅ **Lisibilité** - Structure claire et explicite
✅ **Type Safety** - TypeScript strict garantit la sécurité des types

---

## 🔐 Sécurité

- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ Variables sensibles dans `.env` (jamais commités)
- ✅ Validation stricte des entrées utilisateur
- ✅ Gestion d'erreurs centralisée (pas de leak d'infos)
- ✅ Index unique sur l'email (MongoDB)

---

## 🚧 Évolutions futures

- [ ] Authentification JWT
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Logging avancé (Winston)
- [ ] Intégration Stripe pour paiements
- [ ] Containerisation Docker
- [ ] CI/CD (GitHub Actions)
- [ ] Documentation OpenAPI/Swagger

---

## 📝 Licence

MIT

---

## 👨‍💻 Auteur

Projet créé comme démonstration d'une architecture **Clean DDD** en Node.js + TypeScript.
