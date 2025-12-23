# 🎯 Résumé de la Configuration Dev/Prod

## ✅ Ce qui a été mis en place

### 1. **Fichiers de Configuration Séparés**

- **`.env.development`** : Template pour le développement
- **`.env.production.example`** : Template pour la production
- **`docker-compose.dev.yml`** : Bases de données uniquement (PostgreSQL + Redis)
- **`docker-compose.prod.yml`** : Stack complète (API + DB + Monitoring)
- **`Dockerfile`** : Image de production optimisée
- **`Dockerfile.dev`** : Image de développement (non utilisé actuellement)

### 2. **Scripts npm Simplifiés**

Dans `package.json` :

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "dev:full": "pnpm docker:dev:db && sleep 3 && pnpm dev",
    "docker:dev:db": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:dev:down": "docker-compose -f docker-compose.dev.yml down",
    "docker:dev:logs": "docker-compose -f docker-compose.dev.yml logs -f",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up -d",
    "docker:prod:build": "docker-compose -f docker-compose.prod.yml up -d --build",
    "docker:prod:down": "docker-compose -f docker-compose.prod.yml down",
    "docker:prod:logs": "docker-compose -f docker-compose.prod.yml logs -f"
  }
}
```

### 3. **Documentation**

- **`README.md`** : Documentation générale avec Quick Start
- **`QUICK_START.md`** : Guide de démarrage rapide
- **`DEPLOYMENT.md`** : Guide complet de déploiement et migration
- **`CLAUDE.md`** : Guide pour développer avec Claude Code

## 🔄 Workflow Développement

### Démarrage Simple

```bash
# Installer
pnpm install

# Configurer
cp .env.development .env

# Lancer
pnpm dev:full
```

### Workflow Détaillé

```bash
# 1. Démarrer les bases de données
pnpm docker:dev:db

# 2. Vérifier qu'elles sont prêtes
docker ps

# 3. Lancer l'app avec hot reload
pnpm dev

# L'app redémarre automatiquement à chaque modification !
```

### Arrêter

```bash
# Ctrl+C pour arrêter l'app

# Arrêter les bases
pnpm docker:dev:down
```

## 🏭 Workflow Production

### Démarrage

```bash
# 1. Créer la config de production
cp .env.production.example .env.production
# Éditer .env.production avec vos vraies valeurs

# 2. Démarrer tout (API + DB + Monitoring)
pnpm docker:prod:build

# 3. Vérifier
curl http://localhost:3002/health
```

### Monitoring

- **API** : http://localhost:3002
- **Grafana** : http://localhost:3001 (admin/admin)
- **Prometheus** : http://localhost:9090
- **Métriques** : http://localhost:3002/metrics

### Arrêter

```bash
pnpm docker:prod:down
```

## 🎨 Différences Clés

| Aspect | Dev | Prod |
|--------|-----|------|
| **Command** | `pnpm dev` | `pnpm docker:prod` |
| **App** | Locale (hot reload) | Docker |
| **Port** | 3000 | 3002 |
| **Logs** | Colorés (pino-pretty) | JSON |
| **Monitoring** | Non | Grafana + Prometheus |
| **Redis TLS** | Off | Configurable |

## 📝 Variables d'Environnement Importantes

### Toujours Configurer

- `STRIPE_SECRET_KEY` : Clé Stripe (test en dev, live en prod)
- `STRIPE_WEBHOOK_SECRET` : Secret webhook Stripe
- `POSTGRES_*` : Configuration PostgreSQL
- `REDIS_*` : Configuration Redis

### Spécifique à Production

- `REDIS_USE_TLS` : Activer TLS pour Redis (`"true"` en prod)
- `LOG_LEVEL` : Level de log (`debug` en dev, `info` en prod)
- `ALLOWED_ORIGINS` : Origines CORS autorisées

## 🚦 Checklist de Migration Dev → Prod

- [ ] `.env.production` créé avec vraies valeurs
- [ ] Clés Stripe de production (`sk_live_...`)
- [ ] `REDIS_USE_TLS="true"`
- [ ] `LOG_LEVEL="info"`
- [ ] `ALLOWED_ORIGINS` configuré pour votre domaine
- [ ] Passwords sécurisés pour PostgreSQL
- [ ] Credentials Grafana changés

## 💡 Conseils

### Développement
- ✅ Utilisez `pnpm dev:full` pour démarrer rapidement
- ✅ Les modifications de code redémarrent l'app automatiquement
- ✅ Les logs sont en couleur et faciles à lire
- ✅ Utilisez les clés Stripe de test

### Production
- 🔒 Ne commitez JAMAIS `.env.production`
- 🔒 Changez les mots de passe par défaut de Grafana
- 🔒 Utilisez des clés Stripe de production
- 📊 Surveillez Grafana régulièrement
- 💾 Configurez des backups PostgreSQL

## 🆘 Problèmes Courants

### L'app ne se connecte pas à PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
docker ps

# Voir les logs
pnpm docker:dev:logs
```

### Changement de config non pris en compte

```bash
# En dev : redémarrer l'app (Ctrl+C puis pnpm dev)
# En prod : rebuild
pnpm docker:prod:down
pnpm docker:prod:build
```

### Nettoyer tout

```bash
# Arrêter et supprimer les volumes
pnpm docker:dev:down
pnpm docker:prod:down
docker volume prune
```

## 📚 Ressources

- [Quick Start Guide](QUICK_START.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Claude Code Guide](CLAUDE.md)
- [Commit Conventions](COMMIT_CONVENTION.md)
