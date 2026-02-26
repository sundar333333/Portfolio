#!/bin/bash
set -e

WORKSPACE="$(cd "$(dirname "$0")" && pwd)"
cd "$WORKSPACE"

kill_port() {
  local pids
  pids=$(lsof -ti :5000 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Killing existing processes on port 5000..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

kill_port

if [ ! -f dist/index.cjs ] || [ ! -d dist/public ]; then
  echo "Building production bundle..."
  NODE_OPTIONS='--max-old-space-size=1024' npm run build
  if [ $? -ne 0 ]; then
    echo "Build failed, exiting."
    exit 1
  fi
fi

mkdir -p dist/static
ln -sf "$WORKSPACE/server/static/room.glb" dist/static/room.glb
ln -sf "$WORKSPACE/server/static/render3d.glb" dist/static/render3d.glb
ln -sf "$WORKSPACE/server/static/ballon_dor.glb" dist/static/ballon_dor.glb
ln -sf "$WORKSPACE/server/static/corner_shelves.glb" dist/static/corner_shelves.glb
ln -sf "$WORKSPACE/server/static/table.glb" dist/static/table.glb

echo "Starting production server on port 5000..."
export NODE_ENV=production
exec node dist/index.cjs
