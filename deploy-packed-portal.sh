#!/usr/bin/env bash

# Despliegue del portal ya compilado en el servidor (nginx)
# Copia este script al servidor junto con portal-dist.tar.gz y ejecútalo allí.
# Uso en el servidor (vía SSH):
#   chmod +x deploy-packed-portal.sh
#   sudo ./deploy-packed-portal.sh

set -euo pipefail

TAR_NAME="portal-dist.tar.gz"
NGINX_ROOT="/usr/share/nginx/html"

if [ ! -f "$TAR_NAME" ]; then
  echo "ERROR: No se encontró $TAR_NAME en el directorio actual." >&2
  exit 1
fi

echo "[1/4] Haciendo backup del contenido actual de nginx: $NGINX_ROOT"
BACKUP_DIR="${NGINX_ROOT}_backup_$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
sudo cp -a "$NGINX_ROOT/." "$BACKUP_DIR" || true

echo "Backup creado en: $BACKUP_DIR"

echo "[2/4] Limpiando contenido actual de $NGINX_ROOT"
sudo rm -rf "$NGINX_ROOT"/*

TMP_EXTRACT_DIR="/tmp/portal-dist-$$"
mkdir -p "$TMP_EXTRACT_DIR"

echo "[3/4] Descomprimiendo $TAR_NAME en $TMP_EXTRACT_DIR"
tar -xzf "$TAR_NAME" -C "$TMP_EXTRACT_DIR"

if [ ! -f "$TMP_EXTRACT_DIR/index.html" ]; then
  echo "ERROR: No se encontró index.html en el contenido descomprimido." >&2
  exit 1
fi

echo "[4/4] Copiando archivos a $NGINX_ROOT"
sudo cp -a "$TMP_EXTRACT_DIR/." "$NGINX_ROOT"/
rm -rf "$TMP_EXTRACT_DIR"

echo "Reiniciando nginx"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart nginx
else
  sudo service nginx restart
fi

echo "Despliegue completado. Abre el dominio/IP en el puerto 80 para ver el portal."