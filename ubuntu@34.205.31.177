#!/usr/bin/env bash

# deploy-portal.sh
# Clona/actualiza el repo, construye empaqueta y despliega al servidor remoto.
# Uso:
#   Edita las variables abajo (SSH_KEY, REMOTE_USER, REMOTE_HOST) y ejecuta:
#     chmod +x deploy-portal.sh
#     ./deploy-portal.sh

set -euo pipefail

REPO_URL="https://github.com/devcollazo/portal.git"
LOCAL_BASE="$HOME/CODE/portal"
LOCAL_DIR="$LOCAL_BASE/portal"
BUILD_SCRIPT="${LOCAL_DIR}/build-and-pack-portal.sh"
DEPLOY_SCRIPT_LOCAL="${LOCAL_DIR}/deploy-packed-portal.sh"
TAR_NAME="portal-dist.tar.gz"

# SSH / remote
SSH_KEY="~/CODE/ec2-east1-keypair.pem"   # EDITA esto
REMOTE_USER="ubuntu"                    # EDITA esto si hace falta
REMOTE_HOST="34.205.31.177"             # EDITA esto si hace falta
REMOTE_HOME="~"

# Comprueba requisitos locales mínimos
require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: se requiere '$1' pero no está instalado." >&2
    exit 1
  fi
}

require_cmd git
require_cmd npm
require_cmd scp
require_cmd ssh

mkdir -p "$LOCAL_BASE"

if [ -d "$LOCAL_DIR/.git" ]; then
  echo "Actualizando repo en $LOCAL_DIR"
  git -C "$LOCAL_DIR" fetch --all --prune
  git -C "$LOCAL_DIR" reset --hard origin/HEAD
else
  echo "Clonando repo $REPO_URL -> $LOCAL_DIR"
  git clone "$REPO_URL" "$LOCAL_DIR"
fi

# Ejecutar build local y empaquetado
if [ ! -x "$BUILD_SCRIPT" ]; then
  echo "ERROR: no existe $BUILD_SCRIPT o no es ejecutable." >&2
  exit 1
fi

echo "Ejecutando build y empaquetado local..."
cd "$LOCAL_DIR"
"$BUILD_SCRIPT"

if [ ! -f "$LOCAL_DIR/$TAR_NAME" ]; then
  echo "ERROR: no se creó $TAR_NAME" >&2
  exit 1
fi

# Subir tar.gz y script de despliegue al servidor
echo "Subiendo $TAR_NAME y deploy script al servidor $REMOTE_HOST"
scp -i "$SSH_KEY" "$LOCAL_DIR/$TAR_NAME" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME/"
scp -i "$SSH_KEY" "$DEPLOY_SCRIPT_LOCAL" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME/"

# Ejecutar el script remoto (requiere sudo)
echo "Ejecutando deploy en el servidor remoto (se pedirá sudo si es necesario)"
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "chmod +x ~/$(basename $DEPLOY_SCRIPT_LOCAL) && sudo ~/$(basename $DEPLOY_SCRIPT_LOCAL)"

echo "Despliegue completado."
