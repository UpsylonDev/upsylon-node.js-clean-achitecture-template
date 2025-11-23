# API User - Domain-Driven Design

API Node.js + Express + TypeScript construite avec les principes du **Domain-Driven Design** et **Clean Architecture**.

## 🚀 Quick Start

### Option 1: Avec Docker (Recommandé)

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer tous les services (MongoDB, Redis, Grafana, Prometheus, Loki)
docker-compose up -d

# 3. Lancer le serveur
pnpm dev
```

**Services disponibles :**
- Application : http://localhost:3000
- Grafana : http://localhost:3001 (admin/admin)
- Prometheus : http://localhost:9090
- Loki : http://localhost:3100

### Option 2: Installation manuelle

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer MongoDB
mongod

# 3. Démarrer Redis
redis-server

# 4. Lancer le serveur
pnpm dev
```

Le serveur démarre sur **http://localhost:3000**

## 📝 Créer un utilisateur

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123"}'
```

## 📚 Documentation complète

Toute la documentation est disponible dans le dossier **[docs/](docs/)** :

### 🎯 Pour bien démarrer

1. **[QUICKSTART.md](docs/QUICKSTART.md)** - Démarrage en 5 minutes
2. **[README.md](docs/README.md)** - Documentation complète de l'API
3. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture DDD expliquée en détail

### 📖 Guides et références

- **[DIAGRAM.md](docs/DIAGRAM.md)** - Diagrammes visuels de l'architecture
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Guide pour contributeurs
- **[COMMANDS.md](docs/COMMANDS.md)** - Commandes utiles
- **[PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Résumé du projet

### 📊 Références techniques

- **[TREE.txt](docs/TREE.txt)** - Structure du projet
- **[FILES_CREATED.md](docs/FILES_CREATED.md)** - Liste complète des fichiers

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      PRESENTATION (API Layer)       │  ← Express, Controllers
├─────────────────────────────────────┤
│     APPLICATION (Use Cases)         │  ← Command Handlers
├─────────────────────────────────────┤
│     DOMAIN (Business Logic)         │  ← Entities, Value Objects
├─────────────────────────────────────┤
│   INFRASTRUCTURE (Technical)        │  ← MongoDB, Mongoose
└─────────────────────────────────────┘
```

## ✨ Fonctionnalités

- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture
- ✅ TypeScript strict
- ✅ MongoDB + Mongoose
- ✅ Redis (Cache-Aside Pattern)
- ✅ Monitoring (Grafana + Prometheus + Loki)
- ✅ Tests unitaires (Jest)
- ✅ Validation métier
- ✅ Sécurité (bcrypt)

## 📋 Configuration Redis

Redis est utilisé pour implémenter le pattern **Cache-Aside** et améliorer les performances.

**Avec Docker (inclus dans docker-compose.yml):**
```bash
docker-compose up -d
# Redis est accessible sur localhost:6379
```

**Installation manuelle:**
```bash
# macOS (Homebrew)
brew install redis && redis-server

# Linux (Debian/Ubuntu)
sudo apt-get install redis-server && redis-server

# Vérifier la connexion
redis-cli ping  # Devrait afficher PONG
```

**Variables d'environnement (.env):**
```env
REDIS_HOST=localhost      # Hôte Redis (par défaut)
REDIS_PORT=6379          # Port Redis (par défaut)
REDIS_PASSWORD=           # Mot de passe optionnel
REDIS_DB=0               # Base de données Redis (par défaut)
REDIS_TTL=3600           # TTL du cache en secondes (par défaut)
```

## 📊 Monitoring et Observabilité

Le projet inclut une stack complète de monitoring avec **Grafana**, **Prometheus** et **Loki**.

### Services de monitoring

**Avec Docker (inclus dans docker-compose.yml):**
```bash
docker-compose up -d
```

Cela démarre automatiquement :
- **Grafana** (http://localhost:3001) - Dashboards et visualisation
- **Prometheus** (http://localhost:9090) - Métriques et alertes
- **Loki** (http://localhost:3100) - Agrégation de logs
- **Promtail** - Collecte et envoi des logs vers Loki

### Accès à Grafana

1. Ouvrir http://localhost:3001
2. Se connecter avec :
   - **Username** : `admin`
   - **Password** : `admin`
3. Configurer les data sources :
   - **Prometheus** : `http://prometheus:9090`
   - **Loki** : `http://loki:3100`

### Métriques disponibles

L'application expose des métriques Prometheus sur `/metrics` :
- Métriques HTTP (requêtes, latence, codes de statut)
- Métriques système (CPU, mémoire)
- Métriques métier personnalisées

### Logs structurés

Les logs sont collectés automatiquement par Promtail et envoyés à Loki :
- Logs applicatifs (Pino)
- Logs des conteneurs Docker
- Requêtes HTTP avec timing

## 🧪 Tests

```bash
pnpm test
```

## 📄 Licence

MIT

---

**Pour la documentation complète, consultez le dossier [docs/](docs/)**
