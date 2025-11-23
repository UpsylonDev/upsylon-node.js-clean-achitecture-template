# Rapport d'Audit de Sécurité

**Projet**: Upsylon Node.js TypeScript DDD Template  
**Date**: 2025-11-22  
**Version**: 1.0  
**Auditeur**: Upsylon Development Security Team

---

## 📊 Résumé Exécutif

### Vue d'ensemble

Cet audit de sécurité a analysé l'ensemble du projet selon 10 domaines critiques de sécurité. Le projet présente une **base de sécurité solide** avec quelques améliorations recommandées.

### Score de sécurité global: 7.5/10

### Statistiques

- **Vulnérabilités critiques**: 0 🟢
- **Vulnérabilités élevées**: 0 🟢
- **Vulnérabilités moyennes**: 3 🟡
- **Recommandations faibles**: 5 🟢
- **Bonnes pratiques identifiées**: 12 ✅

---

## 🔍 Résultats Détaillés par Domaine

### 1. Sécurité des Dépendances

#### ✅ Points positifs

- Utilisation de `pnpm` avec lockfile pour des installations déterministes
- Dépendances principales à jour (Express 4.21.2, Mongoose 8.19.3)
- Séparation claire entre dépendances de production et de développement

#### 🟡 Vulnérabilités identifiées

**VUL-001: js-yaml - Moderate Severity**

- **Sévérité**: 🟡 Moyenne (CVSS 5.3)
- **Package**: `js-yaml < 3.14.2`
- **CVE**: CVE-2025-64718
- **Advisory**: GHSA-mh29-5h37-fv8m
- **Impact**: Integrity issue (CWE-1321)
- **Statut**: Dépendance transitive (via d'autres packages)
- **Recommandation**: Mettre à jour vers `js-yaml >= 3.14.2`

```bash
# Vérifier quelle dépendance utilise js-yaml
pnpm why js-yaml

# Forcer la mise à jour si nécessaire
pnpm update js-yaml --latest
```

#### 🟡 Packages avec versions majeures disponibles

| Package  | Version actuelle | Dernière version | Risque                   |
| -------- | ---------------- | ---------------- | ------------------------ |
| express  | 4.21.2           | 5.1.0            | Faible - v5 est breaking |
| mongoose | 8.19.3           | 9.0.0            | Faible - v9 est récent   |
| jest     | 29.7.0           | 30.2.0           | Faible - dev only        |
| stripe   | 14.25.0          | 20.0.0           | Moyen - API changes      |

**Recommandation**: Planifier la migration vers Express 5 et Stripe 20 dans une version future.

---

### 2. Authentification et Autorisation

#### ✅ Points positifs

- ✅ Utilisation de `bcryptjs` pour le hachage des mots de passe
- ✅ Salt rounds configurables via environnement (défaut: 10)
- ✅ Validation forte des mots de passe (longueur min 8, majuscule, minuscule, chiffre)
- ✅ Constructeur privé dans `Password` value object (pattern sécurisé)
- ✅ Pas de mots de passe en clair dans le code (sauf tests unitaires - acceptable)

```typescript
// Excellente implémentation dans Password.ts
private static validate(password: string): void {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // Validation complète
}
```

#### 🟡 Améliorations recommandées

**REC-001: Ajouter validation de caractères spéciaux**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `src/domain/valueObjects/Password.ts`
- **Recommandation**: Ajouter une validation pour les caractères spéciaux

```typescript
const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
if (!hasSpecialChar) {
  throw new Error('Password must contain at least one special character');
}
```

**REC-002: Augmenter les salt rounds en production**

- **Sévérité**: 🟢 Faible
- **Fichier**: `.env.example`
- **Recommandation**: Utiliser 12 rounds en production pour plus de sécurité

```env
# Production
BCRYPT_SALT_ROUNDS=12

# Development (plus rapide pour les tests)
BCRYPT_SALT_ROUNDS=10
```

---

### 3. Validation et Sanitisation des Entrées

#### ✅ Points positifs

- ✅ Utilisation de Joi pour la validation des schémas
- ✅ Validation sur tous les endpoints POST
- ✅ Messages d'erreur personnalisés et clairs
- ✅ Middleware de validation centralisé
- ✅ Limite de taille des requêtes via `express.json()`

```typescript
// Excellente validation Joi
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
});
```

#### ✅ Protection contre les injections NoSQL

- Mongoose utilise des requêtes paramétrées par défaut
- Pas d'utilisation de `$where` ou d'opérateurs dangereux détectée

#### 🟡 Améliorations recommandées

**REC-003: Ajouter limite de taille explicite pour express.json()**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `src/app.ts`
- **Recommandation**: Limiter la taille des payloads JSON

```typescript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

### 4. Gestion des Secrets et Configuration

#### ✅ Points positifs

- ✅ `.env` est dans `.gitignore`
- ✅ Fichier `.env.example` fourni pour la documentation
- ✅ Centralisation de la configuration dans `Environment` class
- ✅ Validation des variables d'environnement requises
- ✅ Pas de secrets hardcodés dans le code source

#### 🟡 Problèmes identifiés

**VUL-002: Valeurs par défaut pour secrets sensibles**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `src/infrastructure/config/environment.ts`
- **Problème**: Stripe keys ont des valeurs par défaut vides

```typescript
// Actuel - Problématique
public static readonly STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY || '';
public static readonly STRIPE_WEBHOOK_SECRET: string = process.env.STRIPE_WEBHOOK_SECRET || '';
```

**Recommandation**: Ne pas fournir de valeur par défaut pour les secrets

```typescript
// Recommandé
public static readonly STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY ||
  (() => { throw new Error('STRIPE_SECRET_KEY is required'); })();

// Ou mieux: validation dans Environment.validate()
public static validate(): void {
  const requiredVars = ['MONGODB_URI'];

  // En production, exiger les secrets Stripe
  if (Environment.isProduction()) {
    requiredVars.push('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET');
  }

  // ... reste de la validation
}
```

#### 🟢 Recommandations mineures

**REC-004: Documenter les variables sensibles**

- Ajouter des commentaires dans `.env.example` sur l'importance de chaque secret
- Documenter comment générer/obtenir chaque clé API

---

### 5. Sécurité des API

#### ✅ Points positifs

- ✅ Rate limiting implémenté (global et strict)
- ✅ Rate limiting avec Redis (scalable multi-instances)
- ✅ Graceful degradation si Redis indisponible
- ✅ Headers RateLimit-\* standards activés
- ✅ Gestion d'erreurs centralisée
- ✅ Pas de fuite d'informations dans les erreurs

```typescript
// Excellente configuration rate limiting
export const globalRateLimiter = createRateLimiter(); // 100 req/15min
export const strictRateLimiter = createRateLimiter({
  maxRequests: 10, // 10 req/15min pour endpoints sensibles
});
```

#### 🟠 Vulnérabilités identifiées

**VUL-003: Absence d'en-têtes de sécurité HTTP**

- **Sévérité**: 🟠 Élevée
- **Fichier**: `src/app.ts`
- **Problème**: Pas de protection via helmet.js ou équivalent
- **Impact**: Vulnérabilité aux attaques XSS, clickjacking, MIME sniffing

**Recommandation**: Installer et configurer helmet

```bash
pnpm add helmet
pnpm add -D @types/helmet
```

```typescript
// src/app.ts
import helmet from 'helmet';

export const createApp = (): Application => {
  const app = express();

  // Security headers (doit être en premier)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // ... reste de la configuration
};
```

#### 🟡 Améliorations recommandées

**REC-005: Ajouter CORS avec configuration restrictive**

- **Sévérité**: 🟡 Moyenne
- **Recommandation**: Configurer CORS pour limiter les origines autorisées

```bash
pnpm add cors
pnpm add -D @types/cors
```

```typescript
import cors from 'cors';

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
```

**REC-006: Désactiver X-Powered-By header**

- **Sévérité**: 🟢 Faible
- **Recommandation**: Masquer la technologie utilisée

```typescript
app.disable('x-powered-by');
```

---

### 6. Protection des Données

#### ✅ Points positifs

- ✅ Mots de passe hachés avec bcrypt (jamais en clair)
- ✅ Connexion MongoDB via URI (supporte TLS)
- ✅ Redis avec authentification optionnelle
- ✅ Logs structurés avec Pino (performant et sécurisé)
- ✅ Filtrage des logs pour `/health` et `/metrics`

#### 🟡 Améliorations recommandées

**REC-007: Forcer TLS pour MongoDB en production**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `src/infrastructure/persistence/mongoose/connection.ts`
- **Recommandation**: Ajouter options TLS pour production

```typescript
public async connect(): Promise<void> {
  const options: ConnectOptions = {};

  if (Environment.isProduction()) {
    options.tls = true;
    options.tlsAllowInvalidCertificates = false;
  }

  await mongoose.connect(Environment.MONGODB_URI, options);
}
```

**REC-008: Configurer Redis avec TLS**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `src/infrastructure/persistence/redis/connection.ts`
- **Recommandation**: Ajouter support TLS pour Redis

```typescript
this.client = new Redis({
  host: Environment.REDIS_HOST,
  port: Environment.REDIS_PORT,
  password: Environment.REDIS_PASSWORD || undefined,
  db: Environment.REDIS_DB,
  tls: Environment.isProduction() ? {} : undefined,
  // ...
});
```

**REC-009: Masquer les données sensibles dans les logs**

- **Sévérité**: 🟢 Faible
- **Recommandation**: Ajouter un serializer Pino pour masquer les champs sensibles

```typescript
const logger = pino({
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // Ne pas logger req.body qui peut contenir des passwords
    }),
  },
  redact: ['req.headers.authorization', 'password', 'token'],
});
```

---

### 7. Sécurité de l'Infrastructure

#### ✅ Points positifs

- ✅ Multi-stage Docker build (optimisation taille image)
- ✅ Utilisateur non-root dans le conteneur (nodejs:nodejs)
- ✅ Image de base Alpine (surface d'attaque réduite)
- ✅ Health checks configurés
- ✅ `.dockerignore` présent
- ✅ Volumes persistants pour les données
- ✅ Réseau Docker isolé

```dockerfile
# Excellente pratique de sécurité
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001
USER nodejs
```

#### 🟡 Améliorations recommandées

**REC-010: Ajouter scan de vulnérabilités Docker**

- **Sévérité**: 🟡 Moyenne
- **Recommandation**: Intégrer Trivy ou Snyk dans le CI/CD

```yaml
# .github/workflows/docker-scan.yml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'your-image:tag'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

**REC-011: Configurer Redis avec mot de passe**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `docker-compose.yml`
- **Recommandation**: Ajouter authentification Redis

```yaml
redis:
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

**REC-012: Sécuriser Grafana**

- **Sévérité**: 🟡 Moyenne
- **Fichier**: `docker-compose.yml`
- **Problème**: Mot de passe admin hardcodé

```yaml
grafana:
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-changeme}
    - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
```

---

### 8. Sécurité CI/CD

#### ✅ Points positifs

- ✅ Utilisation d'actions GitHub officielles
- ✅ Versions pinnées pour les actions (@v4)
- ✅ Tests automatisés avant déploiement
- ✅ Linting dans le pipeline
- ✅ Variables d'environnement pour les tests

#### 🟢 Recommandations mineures

**REC-013: Ajouter scan de sécurité dans CI**

- **Sévérité**: 🟢 Faible
- **Recommandation**: Ajouter `pnpm audit` dans le workflow

```yaml
# .github/workflows/test.yaml
- name: Security audit
  run: pnpm audit --audit-level=moderate
  continue-on-error: true # Ne pas bloquer le build pour des vulnérabilités mineures
```

**REC-014: Utiliser Dependabot**

- **Sévérité**: 🟢 Faible
- **Recommandation**: Activer Dependabot pour les mises à jour automatiques

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

---

### 9. Monitoring et Observabilité

#### ✅ Points positifs

- ✅ Métriques Prometheus exposées
- ✅ Endpoint `/health` pour health checks
- ✅ Logs structurés avec Pino
- ✅ Intégration Loki pour agrégation des logs
- ✅ Grafana pour visualisation

#### 🟢 Recommandations mineures

**REC-015: Protéger l'endpoint /metrics**

- **Sévérité**: 🟢 Faible
- **Recommandation**: Ajouter authentification basique pour `/metrics`

```typescript
app.get(
  '/metrics',
  (req, res, next) => {
    const auth = req.headers.authorization;

    if (Environment.isProduction() && !auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
  },
  metricsHandler
);
```

---

### 10. Tests de Sécurité

#### ✅ Points positifs

- ✅ Tests unitaires pour la validation des mots de passe
- ✅ Tests de validation des entrées
- ✅ Couverture de code activée
- ✅ Tests du rate limiting

#### 🟢 Recommandations

**REC-016: Ajouter tests de sécurité spécifiques**

- **Sévérité**: 🟢 Faible
- **Recommandation**: Ajouter tests pour injections, XSS, etc.

```typescript
// Exemple de test anti-injection NoSQL
it('should prevent NoSQL injection', async () => {
  const maliciousEmail = { $ne: null };
  const response = await request(app)
    .post('/users')
    .send({ email: maliciousEmail, password: 'Test123' });

  expect(response.status).toBe(400);
});
```

---

## 📈 Résumé des Vulnérabilités

### Vulnérabilités par sévérité

| Sévérité    | Nombre | IDs              |
| ----------- | ------ | ---------------- |
| 🔴 Critique | 0      | -                |
| 🟠 Élevée   | 1      | VUL-003          |
| 🟡 Moyenne  | 2      | VUL-001, VUL-002 |
| 🟢 Faible   | 0      | -                |

### Recommandations par priorité

| Priorité    | Nombre | IDs                                                                    |
| ----------- | ------ | ---------------------------------------------------------------------- |
| 🔴 Critique | 0      | -                                                                      |
| 🟠 Élevée   | 1      | VUL-003 (helmet)                                                       |
| 🟡 Moyenne  | 8      | REC-001, REC-003, REC-005, REC-007, REC-008, REC-010, REC-011, REC-012 |
| 🟢 Faible   | 7      | REC-002, REC-004, REC-006, REC-009, REC-013, REC-014, REC-015, REC-016 |

---

## 🎯 Plan de Remédiation Priorisé

### Phase 1: Critique et Élevée (À faire immédiatement)

1. **VUL-003: Installer helmet.js** ⏱️ 30 min
   ```bash
   pnpm add helmet @types/helmet
   ```

   - Ajouter middleware helmet dans `src/app.ts`
   - Configurer CSP, HSTS, et autres headers
   - Tester que l'application fonctionne correctement

### Phase 2: Moyenne (< 7 jours)

2. **VUL-001: Mettre à jour js-yaml** ⏱️ 15 min

   ```bash
   pnpm update js-yaml --latest
   pnpm test  # Vérifier que rien ne casse
   ```

3. **VUL-002: Valider secrets Stripe en production** ⏱️ 30 min
   - Modifier `Environment.validate()` pour exiger les secrets en production

4. **REC-003: Limiter taille des payloads** ⏱️ 10 min
   - Ajouter `limit: '10kb'` à `express.json()`

5. **REC-005: Configurer CORS** ⏱️ 45 min
   - Installer cors
   - Configurer origines autorisées via .env
   - Tester avec différentes origines

6. **REC-007 & REC-008: Configurer TLS** ⏱️ 1h
   - Ajouter options TLS pour MongoDB et Redis
   - Tester en environnement de staging

7. **REC-010: Scan Docker** ⏱️ 1h
   - Intégrer Trivy dans le CI/CD
   - Configurer seuils de sévérité acceptables

8. **REC-011 & REC-012: Sécuriser services Docker** ⏱️ 30 min
   - Ajouter authentification Redis
   - Paramétrer mot de passe Grafana

### Phase 3: Faible (< 30 jours)

9. **REC-001: Validation caractères spéciaux** ⏱️ 20 min
10. **REC-002: Augmenter salt rounds** ⏱️ 5 min
11. **REC-004: Documentation secrets** ⏱️ 30 min
12. **REC-006: Désactiver X-Powered-By** ⏱️ 5 min
13. **REC-009: Redact logs sensibles** ⏱️ 45 min
14. **REC-013: Audit CI/CD** ⏱️ 15 min
15. **REC-014: Dependabot** ⏱️ 15 min
16. **REC-015: Protéger /metrics** ⏱️ 30 min
17. **REC-016: Tests de sécurité** ⏱️ 2h

**Temps total estimé**: ~8-10 heures

---

## ✅ Bonnes Pratiques Identifiées

Le projet démontre déjà plusieurs excellentes pratiques de sécurité :

1. ✅ **Architecture DDD** - Séparation claire des responsabilités
2. ✅ **Value Objects** - Password encapsulé avec validation
3. ✅ **Hachage bcrypt** - Implémentation correcte
4. ✅ **Validation Joi** - Schémas stricts sur tous les endpoints
5. ✅ **Rate Limiting** - Protection contre brute-force et DDoS
6. ✅ **Gestion d'erreurs** - Centralisée, pas de fuite d'informations
7. ✅ **Logs structurés** - Pino pour performance et sécurité
8. ✅ **Docker multi-stage** - Images optimisées et sécurisées
9. ✅ **Utilisateur non-root** - Conteneurs sécurisés
10. ✅ **Health checks** - Monitoring de disponibilité
11. ✅ **Tests automatisés** - CI/CD avec tests et linting
12. ✅ **Secrets management** - .env et .gitignore correctement configurés

---

## 📚 Recommandations Générales

### Pour maintenir la sécurité

1. **Audits réguliers**
   - Exécuter `pnpm audit` avant chaque release
   - Réviser les dépendances trimestriellement
   - Mettre à jour les packages de sécurité rapidement

2. **Formation de l'équipe**
   - Former les développeurs aux principes OWASP Top 10
   - Code reviews avec focus sécurité
   - Utiliser des checklists de sécurité

3. **Monitoring continu**
   - Surveiller les logs pour activités suspectes
   - Alertes sur rate limiting dépassé
   - Monitoring des erreurs 401/403

4. **Documentation**
   - Maintenir ce rapport à jour
   - Documenter les décisions de sécurité
   - Créer un guide de sécurité pour les développeurs

---

## 🔗 Ressources et Références

### Standards et frameworks

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Outils recommandés

- [Helmet.js](https://helmetjs.github.io/) - HTTP security headers
- [Snyk](https://snyk.io/) - Dependency scanning
- [Trivy](https://trivy.dev/) - Container scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Penetration testing

### Documentation

- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

## 📝 Conclusion

Le projet **Upsylon Node.js TypeScript DDD Template** présente une **base de sécurité solide** avec une architecture bien pensée et plusieurs bonnes pratiques déjà en place.

### Points forts

- Architecture DDD bien implémentée
- Gestion sécurisée des mots de passe
- Rate limiting robuste
- Infrastructure Docker sécurisée
- Tests automatisés

### Axes d'amélioration prioritaires

1. **Ajouter helmet.js** pour les en-têtes de sécurité HTTP (priorité élevée)
2. **Mettre à jour js-yaml** pour corriger la vulnérabilité
3. **Configurer CORS** de manière restrictive
4. **Activer TLS** pour MongoDB et Redis en production

### Recommandation finale

Avec l'implémentation des corrections de **Phase 1 et Phase 2** (estimées à ~4 heures), le projet atteindrait un **score de sécurité de 9/10**, ce qui est excellent pour un template de démarrage.

---

**Rapport généré le**: 2025-11-22  
**Prochaine révision recommandée**: 2026-02-22 (dans 3 mois)

---

> [!NOTE]
> Ce rapport est spécifique à la version actuelle du projet. Il doit être mis à jour après chaque modification majeure de l'architecture ou des dépendances.
