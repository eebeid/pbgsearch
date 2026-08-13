#!/bin/bash
# =============================================================
# PBG Website — Deploy Script
# Run this from your Mac whenever you want to push updates
# =============================================================
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Or with a specific key file:
#   PBG_KEY=~/.ssh/my-key.pem ./deploy.sh
#
# Configuration — edit these to match your setup:

PBG_EC2_HOST="${PBG_EC2_HOST:-54.227.114.198}"     # e.g. 54.123.45.67
PBG_EC2_USER="${PBG_EC2_USER:-ec2-user}"              # Amazon Linux default
PBG_KEY="${PBG_KEY:-~/.ssh/pbg-key.pem}"              # Path to your .pem key
REMOTE_DIR="/var/www/pbgsearch"

# ── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ── Helper functions ─────────────────────────────────────────
info()    { echo -e "${CYAN}▶ $*${RESET}"; }
success() { echo -e "${GREEN}✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}✕  $*${RESET}"; exit 1; }

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  PBG Website — Deploy                        ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo ""

# ── Validate config ──────────────────────────────────────────
if [ "$PBG_EC2_HOST" = "YOUR_EC2_IP_HERE" ]; then
    error "Please edit deploy.sh and set PBG_EC2_HOST to your EC2 public IP,
       or run: PBG_EC2_HOST=1.2.3.4 ./deploy.sh"
fi

if [ ! -f "$PBG_KEY" ] && [ ! -f "${PBG_KEY/#\~/$HOME}" ]; then
    error "Key file not found: $PBG_KEY
       Set the correct path with: PBG_KEY=~/.ssh/your-key.pem ./deploy.sh"
fi

# ── Change to script directory ───────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
info "Deploying from: $SCRIPT_DIR"
info "Target:         ${PBG_EC2_USER}@${PBG_EC2_HOST}:${REMOTE_DIR}"
echo ""

# ── Test SSH connection ──────────────────────────────────────
info "Testing SSH connection..."
if ! ssh -i "$PBG_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new \
     -q "${PBG_EC2_USER}@${PBG_EC2_HOST}" "exit 0" 2>/dev/null; then
    error "Cannot connect to ${PBG_EC2_HOST}. Check that:
       1. The IP address is correct
       2. The .pem key file path is correct
       3. Your EC2 Security Group allows SSH (port 22) from your IP"
fi
success "SSH connection OK"

# ── Sync files ───────────────────────────────────────────────
info "Uploading files..."
rsync -rlvz --progress \
    --exclude='.git' \
    --exclude='.gitignore' \
    --exclude='*.sh' \
    --exclude='.DS_Store' \
    --exclude='node_modules' \
    --exclude='.github' \
    -e "ssh -i $PBG_KEY -o StrictHostKeyChecking=accept-new" \
    "$SCRIPT_DIR/" \
    "${PBG_EC2_USER}@${PBG_EC2_HOST}:${REMOTE_DIR}/"

success "Files uploaded"

# ── Fix permissions on server ─────────────────────────────────
info "Fixing file permissions..."
ssh -i "$PBG_KEY" -q "${PBG_EC2_USER}@${PBG_EC2_HOST}" \
    "sudo chown -R nginx:nginx ${REMOTE_DIR} && sudo chmod -R 755 ${REMOTE_DIR}"

success "Permissions set"

# ── Reload Nginx ──────────────────────────────────────────────
info "Reloading Nginx..."
ssh -i "$PBG_KEY" -q "${PBG_EC2_USER}@${PBG_EC2_HOST}" \
    "sudo nginx -t && sudo systemctl reload nginx"

success "Nginx reloaded"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║  🚀 Deploy complete!                         ║${RESET}"
echo -e "${BOLD}╠══════════════════════════════════════════════╣${RESET}"
echo -e "${BOLD}║  Site live at:  http://${PBG_EC2_HOST}       ${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo ""
