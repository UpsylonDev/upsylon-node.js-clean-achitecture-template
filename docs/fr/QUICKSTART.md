# 🚀 Quick Start Guide

Guide rapide pour démarrer l'application en **5 minutes**.

---

## ⚡ Installation rapide

### 1. Installer les dépendances

```bash
pnpm install
# ou npm install
```

### 2. Démarrer MongoDB

**Option A - MongoDB local (recommandé pour tester)** :

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Option B - MongoDB Atlas (cloud gratuit)** :

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit
3. Obtenir la connection string
4. Modifier `.env` avec votre URI

### 3. Démarrer le serveur

```bash
pnpm dev
```

Le serveur démarre sur **http://localhost:3000**

**Services disponibles avec Docker :**

- Application : http://localhost:3000
- Grafana : http://localhost:3001 (admin/admin)
- Prometheus : http://localhost:9090
- Loki : http://localhost:3100

---

## ✅ Vérifier que ça fonctionne

### Test Health Check

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

## 📝 Créer votre premier utilisateur

### Via cURL

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'
```

### Via PowerShell (Windows)

```powershell
Invoke-RestMethod -Uri http://localhost:3000/user -Method Post -ContentType "application/json" -Body '{"email":"john@example.com","password":"SecurePass123"}'
```

### Réponse attendue (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 🧪 Lancer les tests

```bash
pnpm test
```

---

## 🎯 Endpoints disponibles

| Méthode | Endpoint | Description                |
| ------- | -------- | -------------------------- |
| GET     | /health  | Vérifier l'état du serveur |
| POST    | /user    | Créer un utilisateur       |

---

## 📖 Prochaines étapes

1. **Lire le README** : [README.md](README.md) pour la documentation complète
2. **Comprendre l'architecture** : [ARCHITECTURE.md](ARCHITECTURE.md) pour les détails DDD
3. **Explorer le code** : Commencer par `src/domain/` (le cœur métier)

---

## 🔥 Commandes utiles

```bash
# Mode développement (hot reload)
pnpm dev

# Build production
pnpm build

# Démarrer en production
pnpm start

# Tests
pnpm test

# Tests en mode watch
pnpm test:watch

# Linter
pnpm lint

# Formater le code
pnpm format
```

---

## ❓ Problèmes courants

### Erreur : "Failed to connect to MongoDB"

**Solution** : Vérifier que MongoDB est démarré

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl status mongod
```

### Erreur : "Port 3000 already in use"

**Solution** : Changer le port dans `.env`

```env
PORT=3001
```

### Erreur : "Email already exists"

**Solution** : Normal ! L'email doit être unique. Utiliser un autre email.

---

## 🎨 Tester avec Postman / Insomnia

### Import collection

Créer une nouvelle requête POST :

- **URL** : `http://localhost:3000/user`
- **Method** : POST
- **Headers** : `Content-Type: application/json`
- **Body** :

```json
{
  "email": "test@example.com",
  "password": "ValidPass123"
}
```

---

## 📊 Voir les données dans MongoDB

### Via MongoDB Compass (GUI)

1. Télécharger [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Se connecter à `mongodb://localhost:27017`
3. Ouvrir la base `ddd-user-api`
4. Voir la collection `users`

### Via Mongo Shell

```bash
mongosh
use ddd-user-api
db.users.find().pretty()
```

---

## 🎉 C'est parti !

Vous êtes prêt à développer avec une architecture **Clean DDD** en TypeScript !

Pour plus de détails, consultez le [README.md](README.md) complet.
