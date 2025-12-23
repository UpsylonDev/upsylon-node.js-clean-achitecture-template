#!/bin/bash

# Script to initialize SSL certificates with Let's Encrypt
# Usage: ./scripts/init-ssl.sh your-email@example.com api.upsylon.tech

set -e

EMAIL=${1:-}
DOMAIN=${2:-api.upsylon.tech}

if [ -z "$EMAIL" ]; then
    echo "Error: Email is required"
    echo "Usage: ./scripts/init-ssl.sh your-email@example.com api.upsylon.tech"
    exit 1
fi

echo "Initializing SSL certificate for $DOMAIN..."

# Create required directories
mkdir -p nginx/conf.d
mkdir -p certbot/conf
mkdir -p certbot/www

# Create temporary Nginx config without SSL
cat > nginx/conf.d/api.conf.temp << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.upsylon.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Backup existing config if it exists
if [ -f "nginx/conf.d/api.conf" ]; then
    mv nginx/conf.d/api.conf nginx/conf.d/api.conf.backup
fi

mv nginx/conf.d/api.conf.temp nginx/conf.d/api.conf

echo "Starting Nginx with temporary HTTP-only configuration..."
docker compose -f docker-compose.prod.yml up -d nginx

echo "Waiting for Nginx to start..."
sleep 5

echo "Obtaining SSL certificate from Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

echo "Restoring full Nginx configuration with SSL..."
if [ -f "nginx/conf.d/api.conf.backup" ]; then
    rm nginx/conf.d/api.conf
    mv nginx/conf.d/api.conf.backup nginx/conf.d/api.conf
else
    # Restore from template
    cat > nginx/conf.d/api.conf << 'FULLEOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.upsylon.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - API Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.upsylon.tech;

    ssl_certificate /etc/letsencrypt/live/api.upsylon.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.upsylon.tech/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://api:3000/health;
        access_log off;
    }
}
FULLEOF
fi

echo "Restarting Nginx with SSL configuration..."
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo "✅ SSL certificate obtained successfully!"
echo "✅ Nginx configured with HTTPS"
echo ""
echo "Your API is now accessible at: https://$DOMAIN"
echo ""
echo "Note: Certificate will auto-renew every 12 hours via certbot service"
