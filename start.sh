#!/bin/bash

if [ ! -f dist/index.cjs ] || [ ! -d dist/public ]; then
  echo "Building production bundle..."
  NODE_OPTIONS='--max-old-space-size=1024' npm run build
fi

mkdir -p dist/static
ln -sf "$(pwd)/server/static/room.glb" dist/static/room.glb

echo "Starting production server..."
NODE_ENV=production node dist/index.cjs
