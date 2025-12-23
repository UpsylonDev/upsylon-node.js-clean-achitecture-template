# Quick Start Guide

Ce guide vous permet de démarrer rapidement en développement ou production.

## 🚀 Démarrage Rapide - Développement

Le mode développement démarre uniquement les bases de données (PostgreSQL + Redis) avec Docker, et l'application tourne localement avec hot reload.

```bash
# 1. Cloner le projet
git clone <repository-url>
cd <project-directory>

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.development .env

# 4. Démarrer les bases de données
pnpm docker:dev:db
# Attendre quelques secondes que les bases soient prêtes

# 5. Lancer l'application en mode développement (avec hot reload)
pnpm dev

# OU tout en une seule commande
pnpm dev:full

# 6. Accéder à l'application
# API: http://localhost:3000
# Health check: http://localhost:3000/health
```

## 🏭 Démarrage Rapide - Production

```bash
# 1. Configurer l'environnement de production
cp .env.production.example .env.production
# Éditer .env.production avec vos vraies valeurs

# 2. Démarrer l'environnement de production
make prod
# OU
pnpm docker:prod

# 3. Accéder à l'application
# API: http://localhost:3002
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

## 📋 Commandes Courantes

### Développement
```bash
pnpm docker:dev:db    # Démarrer les bases de données
pnpm dev              # Lancer l'app localement avec hot reload
pnpm dev:full         # Tout démarrer en une commande
pnpm docker:dev:down  # Arrêter les bases de données
pnpm docker:dev:logs  # Voir les logs des bases
```

### Production
```bash
pnpm docker:prod        # Démarrer (avec stack de monitoring)
pnpm docker:prod:build  # Reconstruire et démarrer
pnpm docker:prod:logs   # Voir les logs
pnpm docker:prod:down   # Arrêter
```

### Tests
```bash
pnpm test             # Lancer les tests
pnpm test:watch       # Tests en mode watch
pnpm lint             # Vérifier le code
pnpm format           # Formater le code
```

## 🔧 Configuration des Variables d'Environnement

### Variables Essentielles

#### Base de Données PostgreSQL
- `POSTGRES_HOST`: Hôte de la base (localhost en dev, hostname en prod)
- `POSTGRES_PORT`: Port (5432)
- `POSTGRES_USER`: Utilisateur
- `POSTGRES_PASSWORD`: Mot de passe
- `POSTGRES_DB`: Nom de la base

#### Redis
- `REDIS_HOST`: Hôte Redis
- `REDIS_PORT`: Port (6379)
- `REDIS_PASSWORD`: Mot de passe (vide en dev)
- `REDIS_USE_TLS`: Active TLS (false en dev, true en prod)

#### Stripe (Paiements)
- `STRIPE_SECRET_KEY`: Clé secrète (sk_test_... en dev, sk_live_... en prod)
- `STRIPE_WEBHOOK_SECRET`: Secret webhook (whsec_...)

#### Sécurité
- `ALLOWED_ORIGINS`: Origines CORS autorisées
- `BCRYPT_SALT_ROUNDS`: Rounds de hashing (10 en dev, 12+ en prod)

## 🐛 Dépannage

### L'API ne démarre pas
```bash
# Vérifier les logs
make dev-logs
# OU
docker-compose -f docker-compose.dev.yml logs app

# Vérifier que PostgreSQL et Redis sont healthy
docker-compose -f docker-compose.dev.yml ps
```

### Problème de connexion à la base de données
```bash
# Vérifier que PostgreSQL est démarré
docker-compose -f docker-compose.dev.yml ps postgres

# Tester la connexion
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d ddd-user-api
```

### Problème de connexion à Redis
```bash
# Vérifier que Redis est démarré
docker-compose -f docker-compose.dev.yml ps redis

# Tester la connexion
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
```

### Tout nettoyer et redémarrer
```bash
# Arrêter et supprimer tous les conteneurs et volumes
make clean

# Redémarrer en développement
make dev-build
```

## 📚 Ressources Supplémentaires

- [README.md](README.md) - Documentation complète
- [CLAUDE.md](CLAUDE.md) - Guide pour Claude Code
- [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) - Conventions de commit

## 🔐 Sécurité

### En Développement
- Utilisez des clés de test Stripe (sk_test_...)
- Gardez des mots de passe simples pour PostgreSQL local
- TLS désactivé pour Redis

### En Production
- **JAMAIS** commiter `.env.production`
- Utilisez des secrets forts et uniques
- Activez TLS pour Redis
- Utilisez des clés de production Stripe (sk_live_...)
- Changez les mots de passe par défaut de Grafana
