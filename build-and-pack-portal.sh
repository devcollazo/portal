#!/usr/bin/env bash

# Build y empaquetado local del portal Angular
# Uso:
#   cd /home/archer/CODE/portal/portal
#   chmod +x build-and-pack-portal.sh
#   ./build-and-pack-portal.sh

set -euo pipefail

PROJECT_DIR="/home/archer/CODE/portal/portal"
DIST_DIR="dist"
TAR_NAME="portal-dist.tar.gz"

cd "$PROJECT_DIR"

echo "[1/4] Instalando dependencias (npm, incluyendo devDependencies)"
rm -rf node_modules
npm install --include=dev

echo "[2/4] Compilando Angular (build de producción)"
# Ajusta este comando si tu proyecto usa otro script de build
npm run build

if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: No se encontró la carpeta '$DIST_DIR' después del build" >&2
  exit 1
fi

# Detectar carpeta real de salida (por ejemplo dist/portal or dist/portal/browser)
subdirs=("$DIST_DIR"/*)
OUTPUT_DIR=""
if [ ${#subdirs[@]} -eq 1 ] && [ -d "${subdirs[0]}" ]; then
  # si hay una sola carpeta, úsala
  CANDIDATE="${subdirs[0]}"
  # si dentro hay 'browser', úsalo
  if [ -d "$CANDIDATE/browser" ]; then
    OUTPUT_DIR="$CANDIDATE/browser"
  else
    OUTPUT_DIR="$CANDIDATE"
  fi
else
  # si dist/ contiene directamente index.html o browser
  if [ -d "$DIST_DIR/browser" ]; then
    OUTPUT_DIR="$DIST_DIR/browser"
  else
    OUTPUT_DIR="$DIST_DIR"
  fi
fi

if [ ! -f "$OUTPUT_DIR/index.html" ]; then
  echo "ERROR: No se encontró index.html en $OUTPUT_DIR" >&2
  exit 1
fi

echo "Carpeta de salida: $OUTPUT_DIR"

echo "[3/4] Creando archivo tar.gz: $TAR_NAME"
rm -f "$TAR_NAME"
tar -czf "$TAR_NAME" -C "$OUTPUT_DIR" .

echo "[4/4] Listo: $(pwd)/$TAR_NAME"
ls -lh "$TAR_NAME"

echo
echo "Ahora puedes subir $TAR_NAME al servidor con scp, por ejemplo:"
echo "  scp -i RUTA_LLAVE_PRIVADA $TAR_NAME USUARIO@SERVIDOR:~"