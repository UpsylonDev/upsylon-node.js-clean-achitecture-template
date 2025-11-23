# 👋 Bienvenue - Commencez ici !

Vous êtes sur le projet **API User DDD** - Une API Node.js + TypeScript construite avec les principes du Domain-Driven Design.

---

## 🎯 Vous êtes...

### 🚀 Un développeur qui veut juste faire fonctionner l'app ?

**→ Allez directement à** [QUICKSTART.md](QUICKSTART.md)

⏱️ Temps : 5 minutes

---

### 📖 Un développeur qui veut comprendre l'API ?

**→ Lisez dans l'ordre :**

1. [QUICKSTART.md](QUICKSTART.md) - Démarrer l'app (5 min)
2. [README.md](README.md) - Documentation API complète (15 min)

⏱️ Temps : 20 minutes

---

### 🏗️ Un développeur qui veut comprendre l'architecture ?

**→ Lisez dans l'ordre :**

1. [QUICKSTART.md](QUICKSTART.md) - Démarrer l'app (5 min)
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture DDD (30 min)
3. [DIAGRAM.md](DIAGRAM.md) - Schémas visuels (20 min)
4. Explorer le code source (commencer par `src/domain/`)

⏱️ Temps : 2-3 heures

---

### 🤝 Un développeur qui veut contribuer ?

**→ Lisez dans l'ordre :**

1. [QUICKSTART.md](QUICKSTART.md) - Démarrer l'app
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Comprendre l'architecture
3. [CONTRIBUTING.md](CONTRIBUTING.md) - Guide de contribution
4. [COMMANDS.md](COMMANDS.md) - Commandes utiles

⏱️ Temps : 3-4 heures

---

### 🎓 Un étudiant qui veut apprendre le DDD ?

**→ Lisez TOUT dans l'ordre :**

1. [QUICKSTART.md](QUICKSTART.md) - Pratique
2. [README.md](README.md) - API
3. [ARCHITECTURE.md](ARCHITECTURE.md) - Théorie DDD
4. [DIAGRAM.md](DIAGRAM.md) - Visualisation
5. [CONTRIBUTING.md](CONTRIBUTING.md) - Best practices
6. Code source complet
7. Reproduire le projet vous-même

⏱️ Temps : 1-2 jours

---

## 📚 Table des matières complète

**→ Consultez** [INDEX.md](INDEX.md) pour naviguer dans toute la doc

---

## 🎬 Démarrage ultra-rapide

```bash
# 1. Installer
pnpm install

# 2. Démarrer MongoDB
mongod

# 3. Lancer le serveur
pnpm dev

# 4. Tester
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123"}'
```

✅ Si ça fonctionne, vous êtes prêt !

---

## 🗺️ Navigation rapide

| Je veux... | Aller à... |
|------------|------------|
| Démarrer rapidement | [QUICKSTART.md](QUICKSTART.md) |
| Voir l'API complète | [README.md](README.md) |
| Comprendre l'architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Voir des schémas | [DIAGRAM.md](DIAGRAM.md) |
| Contribuer | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Trouver une commande | [COMMANDS.md](COMMANDS.md) |
| Vue d'ensemble | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| Structure du projet | [TREE.txt](TREE.txt) |

---

## 📁 Organisation de la documentation

```
docs/
├── 00-START-HERE.md        ← Vous êtes ici
├── INDEX.md                ← Table des matières
│
├── Guides pratiques
│   ├── QUICKSTART.md       ← Start en 5 min
│   ├── README.md           ← Doc API complète
│   └── COMMANDS.md         ← Commandes
│
├── Architecture
│   ├── ARCHITECTURE.md     ← DDD détaillé
│   └── DIAGRAM.md          ← Schémas
│
├── Contribution
│   └── CONTRIBUTING.md     ← Guide contributeurs
│
└── Références
    ├── PROJECT_SUMMARY.md  ← Résumé
    ├── TREE.txt            ← Structure
    └── FILES_CREATED.md    ← Liste fichiers
```

---

## 🎯 3 choses à savoir

### 1️⃣ Architecture en 4 couches

```
PRESENTATION → APPLICATION → DOMAIN ← INFRASTRUCTURE
```

Le **DOMAIN** est le cœur métier, il ne dépend de rien.

### 2️⃣ Route disponible

**POST /user** - Créer un utilisateur

Validations :
- Email valide
- Password >= 8 chars avec maj, min, chiffre

### 3️⃣ Tests inclus

```bash
pnpm test
```

Tous les tests doivent passer ✅

---

## 💡 Conseil pour bien démarrer

1. **Lancez l'app** avec [QUICKSTART.md](QUICKSTART.md)
2. **Testez l'API** pour voir que ça marche
3. **Lisez l'architecture** pour comprendre le "pourquoi"
4. **Explorez le code** en commençant par `src/domain/`

---

## ❓ Questions fréquentes

### C'est quoi DDD ?

Domain-Driven Design = Architecture logicielle centrée sur le domaine métier.

→ Lire [ARCHITECTURE.md](ARCHITECTURE.md)

### Pourquoi 4 couches ?

Séparation des responsabilités + Testabilité + Maintenabilité

→ Lire [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Les 4 couches"

### Comment ajouter une fonctionnalité ?

→ Lire [CONTRIBUTING.md](CONTRIBUTING.md) - Section "Comment ajouter"

### Où sont les tests ?

`src/**/*.spec.ts`

→ Lancer avec `pnpm test`

---

## 🚀 Prêt ?

**→ Commencez par** [QUICKSTART.md](QUICKSTART.md)

Bon développement ! 🎉
