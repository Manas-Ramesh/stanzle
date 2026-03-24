#!/usr/bin/env bash
# Build the React app (updatedDesign) and copy into Flask public/ for production.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND="$(cd "$APP_ROOT/updatedDesign" && pwd)"

if [[ ! -f "$FRONTEND/package.json" ]]; then
  echo "error: updatedDesign not found at $FRONTEND (expected at $APP_ROOT/updatedDesign)"
  exit 1
fi

echo "==> Installing & building SPA in $FRONTEND"
cd "$FRONTEND"
if [[ -d node_modules ]]; then
  npm run build
else
  npm ci
  npm run build
fi

echo "==> Copying dist -> $APP_ROOT/public"
rm -rf "$APP_ROOT/public/assets"
cp -r "$FRONTEND/dist/assets" "$APP_ROOT/public/assets"
cp "$FRONTEND/dist/index.html" "$APP_ROOT/public/index.html"

echo "==> SPA ready (public/index.html + public/assets/)"
