# Guide de Déploiement sur VPS

Ce guide explique comment déployer l'API sur un VPS avec HTTPS via le sous-domaine `api.upsylon.tech`.

## Architecture de Production

```
Internet (HTTPS) → Nginx (Reverse Proxy + SSL) → API Node.js (Docker)
                                                  ↓
                                            PostgreSQL + Redis
```

## Prérequis

### 1. Configuration DNS
Assurez-vous que votre DNS pointe vers votre VPS :
```bash
# Vérifier la résolution DNS
dig api.upsylon.tech

# Doit retourner l'IP de votre VPS
```

### 2. Firewall et Ports
Ouvrez les ports nécessaires :
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp    # HTTP (pour Let's Encrypt)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Installation Docker
```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Vérifier l'installation
docker --version
docker compose version
```

## Déploiement Initial

### Étape 1 : Cloner le Projet

```bash
cd /opt  # ou votre répertoire préféré
git clone <votre-repo> upsylon-api
cd upsylon-api
```

### Étape 2 : Configuration de l'Environnement

Créer le fichier `.env.production` :
```bash
cp .env.production.example .env.production
nano .env.production
```

Configurer les variables importantes :
```env
# Sécurité - CHANGEZ CES VALEURS !
POSTGRES_PASSWORD=VotreMotDePasseSecurisé123!
BCRYPT_SALT_ROUNDS=12

# CORS - Ajoutez vos domaines frontend
ALLOWED_ORIGINS=https://upsylon.tech,https://www.upsylon.tech

# Stripe (si utilisé)
STRIPE_SECRET_KEY=sk_live_votre_clé_live
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# API externe (si utilisée)
EXTRA_API_KEY=https://votre-api-externe.com/endpoint
```

### Étape 3 : Initialiser le Certificat SSL

```bash
# Rendre le script exécutable (si pas déjà fait)
chmod +x scripts/init-ssl.sh

# Lancer l'obtention du certificat SSL
./scripts/init-ssl.sh votre-email@example.com api.upsylon.tech
```

Ce script va :
1. Créer les répertoires nécessaires
2. Démarrer Nginx en mode HTTP temporaire
3. Obtenir le certificat SSL via Let's Encrypt
4. Configurer Nginx avec HTTPS
5. Redémarrer les services

### Étape 4 : Démarrer Tous les Services

```bash
# Démarrer en mode production
docker compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f

# Vérifier l'état des conteneurs
docker compose -f docker-compose.prod.yml ps
```

### Étape 5 : Tester le Déploiement

```bash
# Test HTTP (doit rediriger vers HTTPS)
curl -I http://api.upsylon.tech

# Test HTTPS
curl https://api.upsylon.tech/health

# Doit retourner : {"success": true, "data": {"status": "ok"}}
```

## Gestion des Services

### Commandes Courantes

```bash
# Voir les logs en temps réel
docker compose -f docker-compose.prod.yml logs -f api

# Redémarrer un service spécifique
docker compose -f docker-compose.prod.yml restart api

# Arrêter tous les services
docker compose -f docker-compose.prod.yml down

# Arrêter et supprimer les volumes (⚠️ EFFACE LES DONNÉES)
docker compose -f docker-compose.prod.yml down -v

# Mettre à jour après changement de code
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Monitoring

```bash
# Vérifier l'utilisation des ressources
docker stats

# Voir les logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs redis

# Accéder à Grafana (si configuré)
# http://votre-ip:3001
# Login : admin / admin (changez le mot de passe !)
```

## Renouvellement SSL

Le certificat SSL se renouvelle **automatiquement** :
- Le conteneur `certbot` vérifie le renouvellement toutes les 12h
- Nginx recharge sa configuration toutes les 6h pour appliquer les nouveaux certificats
- Les certificats Let's Encrypt sont valides 90 jours

### Renouvellement Manuel (si nécessaire)

```bash
# Forcer le renouvellement
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal

# Recharger Nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Sauvegardes

### Sauvegarder la Base de Données

```bash
# Créer un backup PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres ddd-user-api > backup_$(date +%Y%m%d).sql

# Restaurer un backup
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres ddd-user-api < backup_20231215.sql
```

### Sauvegarder les Certificats SSL

```bash
# Backup des certificats
sudo tar -czf certbot-backup-$(date +%Y%m%d).tar.gz certbot/

# Restaurer
sudo tar -xzf certbot-backup-20231215.tar.gz
```

## Mise à Jour de l'Application

```bash
# 1. Récupérer les dernières modifications
git pull

# 2. Reconstruire et redémarrer l'API
docker compose -f docker-compose.prod.yml up -d --build api

# 3. Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f api
```

## Dépannage

### Problème : Le site est inaccessible

```bash
# Vérifier que Nginx fonctionne
docker compose -f docker-compose.prod.yml ps nginx

# Vérifier les logs Nginx
docker compose -f docker-compose.prod.yml logs nginx

# Tester la config Nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Problème : Erreur SSL

```bash
# Vérifier les certificats
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/api.upsylon.tech/

# Renouveler manuellement
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker compose -f docker-compose.prod.yml restart nginx
```

### Problème : L'API ne répond pas

```bash
# Vérifier que l'API fonctionne
docker compose -f docker-compose.prod.yml ps api

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs api

# Tester le health check directement
docker compose -f docker-compose.prod.yml exec api wget -O- http://localhost:3000/health
```

### Problème : Base de données inaccessible

```bash
# Vérifier PostgreSQL
docker compose -f docker-compose.prod.yml ps postgres

# Se connecter à la base
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres ddd-user-api

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs postgres
```

## Sécurité

### Bonnes Pratiques

1. **Changez tous les mots de passe par défaut** dans `.env.production`
2. **Activez HSTS** après avoir testé HTTPS (décommentez dans [nginx/conf.d/api.conf](../nginx/conf.d/api.conf:45))
3. **Limitez l'accès SSH** : utilisez des clés SSH au lieu de mots de passe
4. **Mettez à jour régulièrement** :
   ```bash
   # Mettre à jour les images Docker
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```
5. **Surveillez les logs** pour détecter les activités suspectes

### Rate Limiting

L'API inclut un rate limiting par défaut :
- 100 requêtes / 15 minutes pour les endpoints standards
- 10 requêtes / 15 minutes pour les endpoints critiques (login, création utilisateur)

Configurez via `.env.production` :
```env
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # Limite standard
RATE_LIMIT_STRICT_MAX_REQUESTS=10    # Limite stricte
```

## Architecture des Services

### Services Docker

- **postgres** : Base de données PostgreSQL 16
- **redis** : Cache Redis 7
- **api** : Application Node.js (port interne 3000)
- **nginx** : Reverse proxy (ports 80 et 443)
- **certbot** : Gestion automatique des certificats SSL
- **prometheus** : Métriques (port 9090)
- **loki** : Logs agrégés (port 3100)
- **grafana** : Dashboard monitoring (port 3001)

### Réseau Docker

Tous les services communiquent via le réseau `backend` :
- L'API n'est **pas exposée directement** sur internet
- Seul Nginx est accessible depuis l'extérieur (ports 80/443)
- PostgreSQL et Redis sont isolés dans le réseau privé

## Support

Pour obtenir de l'aide :
1. Consultez les logs : `docker compose -f docker-compose.prod.yml logs`
2. Vérifiez la santé des services : `docker compose -f docker-compose.prod.yml ps`
3. Ouvrez une issue sur le repository GitHub

## Références

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
