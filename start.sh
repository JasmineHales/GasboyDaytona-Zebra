#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "→ Remote Off — starting dev server"
echo "→ Project: $(pwd)"

if [ ! -d "node_modules" ]; then
  echo "→ Installing dependencies..."
  npm install
fi

echo ""
echo "→ Open http://127.0.0.1:5174 in your browser"
echo "→ Press Ctrl+C to stop"
echo ""

npm run dev
