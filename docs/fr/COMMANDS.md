# ⚡ Commandes Utiles

Guide de référence rapide des commandes les plus utilisées.

---

## 🚀 Démarrage

### Installation

```bash
# Installer les dépendances
pnpm install
# ou
npm install
# ou
yarn install
```

### Démarrer le serveur

```bash
# Mode développement (avec hot reload)
pnpm dev

# Mode production
pnpm build && pnpm start
```

---

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
pnpm test

# Tests en mode watch
pnpm test:watch

# Tests avec couverture
pnpm test -- --coverage
```

---

## 🔨 Build

### Compiler TypeScript

```bash
# Build production
pnpm build

# Clean + Build
rm -rf dist && pnpm build
```

---

## 🎨 Qualité du code

### Linting

```bash
# Lancer ESLint
pnpm lint

# Fix automatique
pnpm lint -- --fix
```

### Formatting

```bash
# Formater le code
pnpm format

# Vérifier le formatage
pnpm format -- --check
```

---

## 🗄️ MongoDB

### Démarrer MongoDB local

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux (Ubuntu)
sudo systemctl start mongod
```

### Arrêter MongoDB

```bash
# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

### Mongo Shell

```bash
# Se connecter
mongosh

# Utiliser la base
use ddd-user-api

# Voir les utilisateurs
db.users.find().pretty()

# Compter les utilisateurs
db.users.countDocuments()

# Supprimer tous les utilisateurs (⚠️ ATTENTION)
db.users.deleteMany({})

# Supprimer la base (⚠️ ATTENTION)
db.dropDatabase()
```

---

## 🌐 Tester l'API

### Health Check

```bash
curl http://localhost:3000/health
```

### Créer un utilisateur

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123"}'
```

### Avec jq (formatter JSON)

```bash
curl -s http://localhost:3000/health | jq '.'
```

### Avec PowerShell (Windows)

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:3000/health

# Créer utilisateur
Invoke-RestMethod -Uri http://localhost:3000/user `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"ValidPass123"}'
```

---

## 📦 NPM Scripts disponibles

```bash
# Développement
pnpm dev              # Démarre avec nodemon + hot reload

# Production
pnpm build            # Compile TypeScript → JavaScript
pnpm start            # Démarre le serveur compilé

# Tests
pnpm test             # Lance tous les tests Jest
pnpm test:watch       # Tests en mode watch

# Qualité
pnpm lint             # Vérifie ESLint
pnpm format           # Formate avec Prettier
```

---

## 🐛 Debug

### Voir les logs MongoDB

```bash
# macOS/Linux
tail -f /usr/local/var/log/mongodb/mongo.log

# Ou directement dans mongod
mongod --verbose
```

### Variables d'environnement

```bash
# Afficher les variables
cat .env

# Utiliser un autre fichier .env
NODE_ENV=production node dist/server.js
```

---

## 🔍 Inspection du code

### Compter les lignes de code

```bash
# Tous les fichiers TypeScript
find src -name "*.ts" | xargs wc -l

# Sans les tests
find src -name "*.ts" ! -name "*.spec.ts" | xargs wc -l
```

### Trouver des TODOs

```bash
grep -r "TODO" src/
```

---

## 🗑️ Nettoyage

### Supprimer les fichiers générés

```bash
# Supprimer dist/
rm -rf dist

# Supprimer node_modules/
rm -rf node_modules

# Supprimer coverage/
rm -rf coverage

# Tout supprimer
rm -rf dist node_modules coverage
```

### Réinstaller from scratch

```bash
rm -rf node_modules package-lock.json
pnpm install
```

---

## 🔄 Git

### Premier commit

```bash
git init
git add .
git commit -m "Initial commit - Clean DDD architecture"
```

### Workflow classique

```bash
# Voir le statut
git status

# Ajouter des fichiers
git add .

# Commit
git commit -m "feat: add user creation endpoint"

# Push
git push origin main
```

### Branching

```bash
# Créer une branche
git checkout -b feature/add-authentication

# Merger
git checkout main
git merge feature/add-authentication
```

---

## 📊 Monitoring

### Voir les processus Node.js

```bash
# Liste des processus Node
ps aux | grep node

# Tuer un processus
kill -9 <PID>
```

### Surveiller les fichiers

```bash
# Voir les fichiers modifiés
watch -n 2 'ls -lh src/'
```

---

## 🐳 Docker et Monitoring

### Démarrer tous les services

```bash
# Démarrer MongoDB, Redis, Grafana, Prometheus, Loki
docker-compose up -d

# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f app
docker-compose logs -f grafana
docker-compose logs -f prometheus

# Vérifier l'état des services
docker-compose ps

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Accéder aux services de monitoring

```bash
# Grafana (dashboards)
open http://localhost:3001
# Login: admin / admin

# Prometheus (métriques)
open http://localhost:9090

# Loki (logs)
open http://localhost:3100

# Application (API)
open http://localhost:3000/health

# Métriques de l'application
curl http://localhost:3000/metrics
```

### Redémarrer un service spécifique

```bash
# Redémarrer l'application
docker-compose restart app

# Redémarrer Grafana
docker-compose restart grafana

# Redémarrer Prometheus
docker-compose restart prometheus
```

### Voir les ressources utilisées

```bash
# Statistiques des conteneurs
docker stats

# Espace disque utilisé
docker system df
```

---

## 🔐 Sécurité

### Générer un secret

```bash
# Générer une clé aléatoire
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Hasher un password manuellement

```bash
# Via Node REPL
node
> const bcrypt = require('bcrypt')
> bcrypt.hash('MyPassword123', 10).then(console.log)
```

---

## 📝 Notes rapides

### Créer un nouveau Value Object

```bash
touch src/domain/valueObjects/MyNewVO.ts
touch src/domain/valueObjects/MyNewVO.spec.ts
```

### Créer un nouveau Handler

```bash
touch src/application/commands/MyNewCommand.ts
touch src/application/commands/MyNewCommandHandler.ts
touch src/application/commands/MyNewCommandHandler.spec.ts
```

---

## 🎯 Raccourcis utiles

### Redémarrer rapidement

```bash
# Ctrl+C pour arrêter
# Puis
pnpm dev
```

### Tester + Build + Run

```bash
pnpm test && pnpm build && pnpm start
```

### Formater + Lint + Test

```bash
pnpm format && pnpm lint && pnpm test
```

---

## 🆘 En cas de problème

### Port déjà utilisé

```bash
# Trouver le processus sur le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=3001
```

### MongoDB ne démarre pas

```bash
# Vérifier le statut
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Redémarrer
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Linux
```

### Tests qui échouent

```bash
# Clear cache Jest
pnpm test -- --clearCache

# Relancer
pnpm test
```

### TypeScript erreurs

```bash
# Supprimer dist et rebuilder
rm -rf dist
pnpm build
```

---

## 📚 Liens utiles

- MongoDB Docs: https://docs.mongodb.com/
- TypeScript Docs: https://www.typescriptlang.org/docs/
- Express Docs: https://expressjs.com/
- Jest Docs: https://jestjs.io/docs/
- Mongoose Docs: https://mongoosejs.com/docs/

---

**Gardez ce fichier à portée de main pour référence rapide !** 📌
