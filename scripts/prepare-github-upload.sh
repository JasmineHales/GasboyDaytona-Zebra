#!/usr/bin/env bash
# Creates a small zip for GitHub web upload (excludes node_modules, dist, .git).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$(dirname "$ROOT")"
NAME="$(basename "$ROOT")"
ZIP="$OUT_DIR/${NAME}-github-upload.zip"

cd "$ROOT"

zip -r "$ZIP" . \
  -x 'node_modules/*' \
  -x 'node_modules/**' \
  -x 'dist/*' \
  -x 'dist/**' \
  -x '.git/*' \
  -x '.git/**' \
  -x '.DS_Store' \
  -x '**/.DS_Store' \
  -x '.env.local' \
  -x '*.zip' \
  -x '*-upload/*' \
  -x '*-upload/**'

echo "Created: $ZIP ($(du -h "$ZIP" | cut -f1))"
