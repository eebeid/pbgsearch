#!/bin/bash
# =============================================================
# PBG Website — EC2 Server Setup Script
# Run this ONCE on a fresh Amazon Linux 2023 instance
# =============================================================
#
# Usage:
#   chmod +x server-setup.sh
#   ./server-setup.sh
#
# What this does:
#   1. Updates the system
#   2. Installs Nginx
#   3. Creates the web root directory
#   4. Writes an optimized Nginx config for the static site
#   5. Enables Nginx to start on boot
#   6. Opens the firewall

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  PBG Website — EC2 Server Setup              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. SYSTEM UPDATE ────────────────────────────────────────
echo "▶ Updating system packages..."
sudo dnf update -y --quiet

# ── 2. INSTALL NGINX ─────────────────────────────────────────
echo "▶ Installing Nginx..."
sudo dnf install -y nginx --quiet

# ── 3. CREATE WEB ROOT ──────────────────────────────────────
echo "▶ Creating web root at /var/www/pbgsearch..."
sudo mkdir -p /var/www/pbgsearch
sudo chown -R nginx:nginx /var/www/pbgsearch
sudo chmod -R 755 /var/www/pbgsearch

sudo chmod 2775 /var/www/pbgsearch

# ── 4. NGINX CONFIG ──────────────────────────────────────────
echo "▶ Writing Nginx configuration..."
sudo tee /etc/nginx/conf.d/pbgsearch.conf > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;

    server_name _;   # Replace with your domain when ready, e.g.: pbgsearch.com www.pbgsearch.com

    root /var/www/pbgsearch;
    index index.html;

    # ── Logging ──────────────────────────────────────────────
    access_log /var/log/nginx/pbgsearch-access.log;
    error_log  /var/log/nginx/pbgsearch-error.log;

    # ── Static site routing ───────────────────────────────────
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Security headers ─────────────────────────────────────
    add_header X-Frame-Options           "SAMEORIGIN"   always;
    add_header X-Content-Type-Options    "nosniff"      always;
    add_header X-XSS-Protection         "1; mode=block" always;
    add_header Referrer-Policy          "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy       "geolocation=(), microphone=(), camera=()" always;

    # ── Content-Security-Policy ───────────────────────────────
    # Allows: Google Fonts, PBG images, Formspree
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' https://pbgsearch.com data:;
        connect-src 'self' https://formspree.io;
        frame-ancestors 'none';
    " always;

    # ── Gzip compression ─────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        image/svg+xml;

    # ── Browser caching ──────────────────────────────────────
    # Long cache for versioned assets
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Medium cache for images
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # No cache for HTML and JSON (so content updates are instant)
    location ~* \.(html|json)$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # ── Block hidden files ───────────────────────────────────
    location ~ /\. {
        deny all;
        return 404;
    }
}
NGINX_CONFIG

# ── 5. REMOVE DEFAULT NGINX CONFIG ──────────────────────────
echo "▶ Removing default Nginx config..."
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# ── 6. TEST NGINX CONFIG ─────────────────────────────────────
echo "▶ Testing Nginx configuration..."
sudo nginx -t

# ── 7. ENABLE & START NGINX ──────────────────────────────────
echo "▶ Enabling Nginx to start on boot..."
sudo systemctl enable nginx
sudo systemctl start nginx

# ── 8. FIREWALL (if firewalld is active) ─────────────────────
if systemctl is-active --quiet firewalld; then
    echo "▶ Opening HTTP port in firewall..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Server setup complete!                   ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Web root:   /var/www/pbgsearch              ║"
echo "║  Nginx log:  /var/log/nginx/                 ║"
echo "║                                              ║"
echo "║  Next step: run deploy.sh from your Mac      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 9. DISPLAY PUBLIC IP ─────────────────────────────────────
echo "▶ Your server's public IP:"
curl -s http://checkip.amazonaws.com || true
echo ""
