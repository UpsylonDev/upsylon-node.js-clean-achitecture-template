# Configuration Husky - Guide Complet

## 🎯 Qu'est-ce que Husky ?

Husky est un outil qui automatise les vérifications Git en exécutant des scripts avant les opérations Git courantes (commit, push, etc.).

## 📦 Packages Installés

```bash
husky@9.1.7                          # Gestionnaire de Git hooks
@commitlint/cli@20.1.0               # Validation des messages de commit
@commitlint/config-conventional@20.0.0 # Configuration Conventional Commits
lint-staged@16.2.6                   # Lance les checks sur les fichiers modifiés
```

## ⚙️ Configuration

### 1. Hooks Git Configurés

#### `.husky/pre-commit`
S'exécute **avant chaque commit** :
```bash
pnpm lint-staged
```

Exécute sur les fichiers TypeScript modifiés (`*.ts`) :
1. **ESLint** (`eslint --fix`) - Corrige les problèmes de code
2. **Prettier** (`prettier --write`) - Formate le code
3. **Jest** (`jest --bail --findRelatedTests`) - Lance les tests associés

#### `.husky/commit-msg`
S'exécute **lors du commit** pour valider le message :
```bash
pnpm commitlint --edit
```

Valide que le message suit le format **Conventional Commits**.

### 2. Configuration lint-staged (`package.json`)

```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "prettier --write",
    "jest --bail --findRelatedTests --passWithNoTests"
  ]
}
```

### 3. Configuration commitlint (`commitlint.config.js`)

Règles de validation :
- **Type** : Doit être l'un des types autorisés
- **Sujet** : Pas vide, pas de point final, minuscules
- **Longueur** : Header max 100 caractères

## 🚀 Utilisation

### Workflow Normal

```bash
# 1. Modifier des fichiers TypeScript
echo "console.log('test')" > src/test.ts

# 2. Ajouter les modifications
git add src/test.ts

# 3. Créer un commit
git commit -m "feat(test): add test file"

# Résultat :
# ✓ ESLint corrige le fichier
# ✓ Prettier formate
# ✓ Jest lance les tests associés
# ✓ commitlint valide le message
# ✓ Commit créé
```

### Messages de Commit Valides

```bash
# ✅ Avec scope
git commit -m "feat(user): add email validation"
git commit -m "fix(auth): resolve password issue"
git commit -m "refactor(domain): simplify entity"

# ✅ Sans scope
git commit -m "docs: update readme"
git commit -m "chore: update dependencies"
git commit -m "ci: add github actions workflow"

# ❌ Invalides
git commit -m "Add new feature"           # Type manquant
git commit -m "feat: add feature."        # Point final
git commit -m "Feat(user): add feature"   # Type en majuscule
git commit -m "FEAT: add feature"         # Scope manquant, type en majuscule
```

## 🔧 Troubleshooting

### Les hooks ne s'exécutent pas

**Symptôme** : Les vérifications ESLint/Prettier/Jest ne se lancent pas avant commit

**Solutions** :

1. **Réinstaller Husky**
   ```bash
   pnpm prepare
   ```

2. **Vérifier les permissions des hooks** (sur Unix/macOS)
   ```bash
   chmod +x .husky/pre-commit
   chmod +x .husky/commit-msg
   ```

3. **Vérifier que Husky est initialisé**
   ```bash
   ls -la .husky/
   ```
   Devrait contenir : `pre-commit`, `commit-msg`, et `_/husky.sh`

### Les tests prennent trop longtemps

**Problème** : Le hook pre-commit exécute tous les tests associés, ce qui peut être lent

**Solutions** :

```bash
# Option 1 : Augmenter le timeout
# Modifier .husky/pre-commit pour ajouter un timeout

# Option 2 : Exécuter les tests unitaires seulement
# Modifier la config lint-staged dans package.json

# Option 3 : Cacher le hook temporairement (dérnier recours)
git commit --no-verify
```

### Erreur : "Cannot find module 'husky'"

**Problème** : Husky n'est pas installé ou les dépendances ne sont pas à jour

**Solution** :
```bash
pnpm install
pnpm prepare
```

### Commitlint rejette mon message valide

**Problème** : Message qui semble valide mais commitlint le rejette

**Debug** :
```bash
echo "feat: my feature" | pnpm commitlint
# Affiche les erreurs exactes
```

**Cause courante** : Caractères spéciaux ou espaces non visibles

### Pre-commit hook corrige trop de fichiers

**Problème** : Prettier/ESLint modifie plus de fichiers que prévu

**Solution** : Vérifier la config ESLint/Prettier
```bash
pnpm lint src/
pnpm format src/
```

## 📚 Fichiers de Configuration

### [commitlint.config.js](../commitlint.config.js)
Validation des messages de commit avec types autorisés.

### [package.json](../package.json) (lines 57-63)
Configuration de lint-staged pour les vérifications pre-commit.

### [COMMIT_CONVENTION.md](../COMMIT_CONVENTION.md)
Guide détaillé des conventions de commit du projet.

## 🔐 Sécurité

### Contourner les hooks (⚠️ À éviter)

En cas d'urgence absolue, les hooks peuvent être ignorés :

```bash
git commit --no-verify
```

⚠️ **Ne pas utiliser régulièrement !** Cela peut introduire :
- Code de mauvaise qualité
- Messages de commit mal formatés
- Tests non exécutés

### Meilleure pratique

Si un hook bloque un changement légitime :
1. Corriger le problème directement
2. Signaler le problème à l'équipe
3. Mettre à jour les règles ESLint/Prettier si nécessaire

## 📖 Ressources

- [Documentation Husky](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [commitlint](https://commitlint.js.org/)
- [lint-staged](https://github.com/okonet/lint-staged)

## ✅ Vérification de l'Installation

Pour vérifier que tout est bien configuré :

```bash
# 1. Vérifier les dépendances
pnpm list husky @commitlint/cli lint-staged

# 2. Vérifier les hooks
ls -la .husky/

# 3. Tester commitlint
echo "feat: test" | pnpm commitlint

# 4. Tester un commit valide
git commit --allow-empty -m "test: verify husky setup"

# 5. Nettoyer (annuler le test commit si nécessaire)
git reset --soft HEAD~1
```

Si tout s'affiche et qu'aucune erreur n'apparaît, Husky est correctement configuré ! ✨
