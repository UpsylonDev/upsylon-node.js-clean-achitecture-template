# Guide de Démarrage

Bienvenue sur le projet ! Ce guide a pour but de vous aider à lancer l'application rapidement, même si vous débutez avec ces technologies.

## 📋 Pré-requis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

1.  **Node.js** (version 20 ou supérieure) : [Télécharger Node.js](https://nodejs.org/)
2.  **Docker Desktop** : [Télécharger Docker](https://www.docker.com/products/docker-desktop/) (Nécessaire pour MongoDB et Redis)
3.  **pnpm** : Un gestionnaire de paquets rapide.
    - Pour l'installer : `npm install -g pnpm`

## 🚀 Installation

1.  **Cloner le projet** (si ce n'est pas déjà fait)
2.  **Installer les dépendances**
    Ouvrez un terminal dans le dossier du projet et lancez :
    ```bash
    pnpm install
    ```

## ⚙️ Configuration

Le projet a besoin de variables d'environnement pour fonctionner (connexion base de données, clés secrètes, etc.).

1.  Copiez le fichier d'exemple `.env.example` vers un nouveau fichier nommé `.env` :
    ```bash
    cp .env.example .env
    # Sur Windows (PowerShell) :
    # Copy-Item .env.example .env
    ```
2.  (Optionnel) Modifiez le fichier `.env` si vous avez besoin de réglages spécifiques. Pour un démarrage local, les valeurs par défaut fonctionnent généralement très bien.

## ▶️ Lancement

### 1. Démarrer les services (Base de données & Redis)

Nous utilisons Docker pour lancer MongoDB et Redis sans avoir à les installer manuellement sur votre système.

```bash
docker-compose up -d
```

_L'option `-d` permet de lancer les conteneurs en arrière-plan._

### 2. Démarrer l'application (Mode Développement)

Une fois les services Docker lancés, démarrez l'API :

```bash
pnpm dev
```

L'application devrait être accessible à l'adresse : `http://localhost:3000` (ou le port défini dans votre `.env`).

## ✅ Vérification

Pour vérifier que tout fonctionne correctement :

1.  Ouvrez votre navigateur à l'adresse `http://localhost:3000/health`.
2.  Vous devriez voir un message indiquant que le statut est "ok".

## 🛠 Commandes Utiles

- `pnpm dev` : Lance le serveur en mode développement (redémarre automatiquement à chaque modification).
- `pnpm test` : Lance les tests unitaires pour vérifier que votre code ne casse rien.
- `pnpm lint` : Vérifie la qualité du code.
- `pnpm build` : Compile le projet pour la production.

## ❓ En cas de problème

- **Erreur de port** : Si le port 3000 ou 27017 est déjà utilisé, vérifiez qu'aucun autre service ne tourne sur ces ports. Vous pouvez changer les ports dans le fichier `.env` et `docker-compose.yml`.
- **Docker ne répond pas** : Assurez-vous que Docker Desktop est bien lancé.
- **Erreur de connexion MongoDB** : Vérifiez que le conteneur MongoDB est bien en cours d'exécution avec `docker ps` et vérifiez la valeur de `MONGODB_URI` dans votre fichier `.env`.
