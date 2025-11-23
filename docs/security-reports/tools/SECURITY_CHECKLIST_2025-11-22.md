# Checklist de Sécurité pour Développeurs

> [!TIP]
> Utilisez cette checklist avant chaque commit, pull request et release pour maintenir un haut niveau de sécurité.

## 📋 Avant Chaque Commit

### Code

- [ ] Pas de secrets hardcodés (API keys, passwords, tokens)
- [ ] Pas de `console.log()` avec données sensibles
- [ ] Validation des entrées utilisateur avec Joi
- [ ] Gestion d'erreurs appropriée (pas de stack traces en production)
- [ ] Utilisation de types TypeScript stricts

### Tests

- [ ] Tests unitaires pour la nouvelle fonctionnalité
- [ ] Tests de validation des entrées
- [ ] `pnpm test` passe avec succès
- [ ] Couverture de code maintenue ou améliorée

## 📋 Avant Chaque Pull Request

### Sécurité

- [ ] `pnpm audit` ne montre pas de vulnérabilités critiques/élevées
- [ ] `pnpm lint` passe sans erreurs
- [ ] Code review avec focus sécurité
- [ ] Documentation mise à jour si nécessaire

### Authentification & Autorisation

- [ ] Endpoints protégés par rate limiting si nécessaire
- [ ] Validation des permissions utilisateur
- [ ] Pas de bypass possible des contrôles d'accès

### Données

- [ ] Données sensibles chiffrées/hachées
- [ ] Pas de logs de mots de passe ou tokens
- [ ] Validation et sanitisation des entrées

## 📋 Avant Chaque Release

### Dépendances

- [ ] `pnpm audit --audit-level=moderate` résolu
- [ ] Dépendances critiques à jour
- [ ] Lockfile (`pnpm-lock.yaml`) à jour

### Configuration

- [ ] Variables d'environnement documentées dans `.env.example`
- [ ] Secrets configurés dans l'environnement de production
- [ ] `.env` dans `.gitignore`
- [ ] Configuration différente dev/prod validée

### Infrastructure

- [ ] Images Docker scannées (Trivy/Snyk)
- [ ] Health checks fonctionnels
- [ ] Logs configurés correctement
- [ ] Monitoring actif (Prometheus/Grafana)

### Tests

- [ ] Tests d'intégration passent
- [ ] Tests de charge si nécessaire
- [ ] Vérification manuelle des fonctionnalités critiques

## 🔒 Checklist Spécifique par Domaine

### Nouveaux Endpoints API

- [ ] Rate limiting appliqué (global ou strict)
- [ ] Validation Joi des entrées
- [ ] Gestion d'erreurs avec codes HTTP appropriés
- [ ] Documentation OpenAPI/Swagger mise à jour
- [ ] Tests unitaires et d'intégration
- [ ] Logs appropriés (sans données sensibles)

### Nouvelles Intégrations Externes

- [ ] API keys stockées dans `.env`
- [ ] Timeout configuré pour les requêtes
- [ ] Gestion des erreurs réseau
- [ ] Retry logic si approprié
- [ ] Validation des réponses API
- [ ] Tests avec mocks

### Modifications Base de Données

- [ ] Migrations testées
- [ ] Indexes appropriés pour performance
- [ ] Validation au niveau schéma
- [ ] Backup avant migration en production
- [ ] Rollback plan documenté

### Modifications Docker/Infrastructure

- [ ] Multi-stage build maintenu
- [ ] Utilisateur non-root
- [ ] Image de base à jour
- [ ] `.dockerignore` à jour
- [ ] Health check fonctionnel
- [ ] Variables d'environnement documentées

## 🚨 Red Flags - Ne JAMAIS Faire

### ❌ Secrets et Credentials

- ❌ Commiter des fichiers `.env`
- ❌ Hardcoder des API keys, passwords, tokens
- ❌ Logger des mots de passe ou tokens
- ❌ Envoyer des secrets en query parameters
- ❌ Stocker des mots de passe en clair

### ❌ Validation et Sécurité

- ❌ Faire confiance aux données utilisateur sans validation
- ❌ Utiliser `eval()` ou équivalents
- ❌ Désactiver la validation en production
- ❌ Exposer des stack traces en production
- ❌ Ignorer les warnings de sécurité de `pnpm audit`

### ❌ Authentification

- ❌ Implémenter sa propre crypto (utiliser bcrypt, etc.)
- ❌ Utiliser MD5 ou SHA1 pour les passwords
- ❌ Salt rounds < 10 pour bcrypt
- ❌ Accepter des mots de passe faibles

### ❌ API et Endpoints

- ❌ Endpoints sans rate limiting
- ❌ CORS avec `origin: '*'` en production
- ❌ Pas de validation des entrées
- ❌ Retourner des erreurs détaillées en production

## ✅ Best Practices à Suivre

### ✅ Général

- ✅ Principe du moindre privilège
- ✅ Defense in depth (plusieurs couches de sécurité)
- ✅ Fail securely (erreur = accès refusé)
- ✅ Keep it simple (complexité = bugs)

### ✅ Code

- ✅ Utiliser TypeScript strict mode
- ✅ Valider TOUTES les entrées utilisateur
- ✅ Sanitiser les sorties
- ✅ Gestion d'erreurs centralisée
- ✅ Logs structurés avec Pino

### ✅ Dépendances

- ✅ Auditer régulièrement (`pnpm audit`)
- ✅ Mettre à jour les packages de sécurité rapidement
- ✅ Utiliser lockfile (`pnpm-lock.yaml`)
- ✅ Minimiser le nombre de dépendances

### ✅ Infrastructure

- ✅ Conteneurs avec utilisateur non-root
- ✅ Images de base minimales (Alpine)
- ✅ Scanner les images Docker
- ✅ Secrets via variables d'environnement
- ✅ TLS/SSL en production

## 🔍 Outils de Vérification

### Automatiques (CI/CD)

```bash
# Audit de sécurité
pnpm audit --audit-level=moderate

# Linting
pnpm lint

# Tests
pnpm test

# Build
pnpm build
```

### Manuels (Périodiques)

```bash
# Vérifier les packages obsolètes
pnpm outdated

# Scanner l'image Docker
docker scan your-image:tag

# Vérifier les secrets hardcodés
git grep -i "password\|secret\|api_key" src/
```

## 📚 Ressources

### Documentation Interne

- [Plan d'Audit de Sécurité](./SECURITY_AUDIT.md)
- [Rapport d'Audit](./SECURITY_AUDIT_REPORT.md)
- [Architecture](./ARCHITECTURE.md)

### Ressources Externes

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🎯 Quick Security Score

Calculez votre score de sécurité pour chaque PR :

| Critère                     | Points | ✓   |
| --------------------------- | ------ | --- |
| Pas de secrets hardcodés    | 20     | [ ] |
| Validation des entrées      | 15     | [ ] |
| Tests de sécurité           | 15     | [ ] |
| `pnpm audit` clean          | 15     | [ ] |
| Rate limiting approprié     | 10     | [ ] |
| Gestion d'erreurs sécurisée | 10     | [ ] |
| Logs sans données sensibles | 10     | [ ] |
| Documentation à jour        | 5      | [ ] |

**Score minimum acceptable : 80/100**

---

> [!IMPORTANT]
> En cas de doute sur la sécurité d'une implémentation, **demandez une revue de code** avant de merger. Il vaut mieux prévenir que guérir !

**Dernière mise à jour** : 2025-11-22
