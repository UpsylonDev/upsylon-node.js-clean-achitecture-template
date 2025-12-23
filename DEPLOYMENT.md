# Guide de Déploiement

Ce guide explique comment passer facilement entre développement local et production.

## 📁 Structure des Fichiers de Configuration

```
.
├── .env                        # Non versionné - Votre config locale
├── .env.development            # Template pour le développement
├── .env.production.example     # Template pour la production
├── docker-compose.yml          # Configuration Docker principale (legacy)
├── docker-compose.dev.yml      # Bases de données pour développement
├── docker-compose.prod.yml     # Stack complète de production
├── Dockerfile                  # Image de production
└── Dockerfile.dev              # Image de développement (non utilisé actuellement)
```

## 🔄 Basculer entre Environnements

### De Développement → Production

```bash
# 1. Arrêter l'environnement de développement
pnpm docker:dev:down

# 2. Créer la configuration de production
cp .env.production.example .env.production
# Éditer .env.production avec vos vraies valeurs

# 3. Démarrer la production
pnpm docker:prod:build
```

### De Production → Développement

```bash
# 1. Arrêter la production
pnpm docker:prod:down

# 2. S'assurer que .env pointe vers dev
cp .env.development .env

# 3. Démarrer le développement
pnpm docker:dev:db
pnpm dev
```

## 🎯 Différences Clés

| Aspect | Développement | Production |
|--------|---------------|-----------|
| **Commande** | `pnpm dev` | `pnpm docker:prod` |
| **Port API** | 3000 | 3002 |
| **Bases Docker** | ✅ PostgreSQL + Redis | ✅ PostgreSQL + Redis |
| **App Docker** | ❌ Tourne localement | ✅ Containerisée |
| **Hot Reload** | ✅ Oui (nodemon) | ❌ Non |
| **Logs** | Pretty (colorés) | JSON |
| **Monitoring** | ❌ Non | ✅ Prometheus + Grafana + Loki |
| **TLS Redis** | ❌ Désactivé | ⚙️ Configurable via `REDIS_USE_TLS` |
| **Build** | ❌ Pas de build | ✅ TypeScript compilé |
| **Node Modules** | Locaux | Dans l'image Docker |

## 🌍 Variables d'Environnement par Environnement

### Développement (.env)

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
POSTGRES_HOST=localhost
REDIS_HOST=localhost
REDIS_USE_TLS=false
STRIPE_SECRET_KEY=sk_test_...
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
POSTGRES_HOST=your-db-host
REDIS_HOST=your-redis-host
REDIS_USE_TLS=true
STRIPE_SECRET_KEY=sk_live_...
```

## 🚀 Scénarios de Déploiement

### Scénario 1: Développement Local

**Besoin**: Coder avec hot reload

```bash
pnpm docker:dev:db  # Bases de données
pnpm dev            # App locale
```

**Avantages**:
- ✅ Hot reload instantané
- ✅ Debugging facile
- ✅ Logs en couleur
- ✅ Pas de rebuild nécessaire

### Scénario 2: Test de Production Locale

**Besoin**: Tester l'environnement de production

```bash
pnpm docker:prod:build
```

**Avantages**:
- ✅ Environnement identique à la prod
- ✅ Stack de monitoring complète
- ✅ Test des performances réelles

### Scénario 3: CI/CD

**Besoin**: Tests automatisés

```bash
# Dans votre pipeline CI/CD
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
# Exécuter les tests
docker-compose -f docker-compose.prod.yml down
```

### Scénario 4: Déploiement Cloud

**Options**:

1. **Docker Compose** (VPS simple)
   ```bash
   scp .env.production server:/app/.env
   ssh server "cd /app && docker-compose -f docker-compose.prod.yml up -d"
   ```

2. **Kubernetes** (voir section suivante)

3. **Cloud providers** (AWS ECS, Google Cloud Run, etc.)
   - Utiliser le `Dockerfile` comme base
   - Configurer les variables d'environnement via le provider

## ☁️ Migration vers Kubernetes (optionnel)

Si vous souhaitez déployer sur Kubernetes:

```bash
# Créer les manifests k8s à partir du docker-compose
kompose convert -f docker-compose.prod.yml
```

Ou utiliser Helm pour un déploiement plus avancé.

## 🔐 Bonnes Pratiques de Sécurité

### En Développement
- ✅ Utiliser des clés Stripe de test (`sk_test_`)
- ✅ Mots de passe simples pour DB locale
- ✅ Ne pas activer TLS pour Redis local

### En Production
- 🔒 **JAMAIS** commiter `.env.production`
- 🔒 Utiliser des secrets managers (AWS Secrets, Vault, etc.)
- 🔒 Clés Stripe de production (`sk_live_`)
- 🔒 Activer TLS pour Redis
- 🔒 Mots de passe forts et uniques
- 🔒 Changer les credentials Grafana par défaut
- 🔒 Configurer un reverse proxy (nginx, traefik)
- 🔒 Activer HTTPS avec Let's Encrypt

## 📊 Monitoring en Production

Une fois en production, accédez à:

- **Grafana**: http://localhost:3001
  - User: `admin` (à changer!)
  - Password: `admin` (à changer!)
  - Dashboards préconfiguré pour l'API

- **Prometheus**: http://localhost:9090
  - Métriques brutes de l'application

- **API Metrics**: http://localhost:3002/metrics
  - Endpoint Prometheus de l'API

## 🔄 Mise à Jour de Production

```bash
# 1. Pull les dernières modifications
git pull origin main

# 2. Rebuild et redémarrer
pnpm docker:prod:build

# 3. Vérifier les logs
pnpm docker:prod:logs
```

## 🐛 Troubleshooting

### Les bases de données ne démarrent pas

```bash
# Nettoyer et redémarrer
pnpm docker:dev:down
docker volume prune
pnpm docker:dev:db
```

### Changement de config non pris en compte

```bash
# Rebuild complet
pnpm docker:prod:down
pnpm docker:prod:build
```

### Problème de permissions Docker

```bash
# Ajouter votre user au groupe docker
sudo usermod -aG docker $USER
# Se déconnecter et reconnecter
```

## 📝 Checklist de Déploiement

Avant de déployer en production:

- [ ] `.env.production` créé avec vraies valeurs
- [ ] Clés Stripe de production configurées
- [ ] Credentials de DB sécurisés
- [ ] TLS activé pour Redis
- [ ] Mots de passe Grafana changés
- [ ] ALLOWED_ORIGINS configuré correctement
- [ ] Logs testés et fonctionnels
- [ ] Backup de la base de données configuré
- [ ] Monitoring testé
- [ ] Health check accessible
