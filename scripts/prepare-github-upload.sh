#!/usr/bin/env bash
# Minimal zip for GitHub web upload (~500 KB). Excludes node_modules, dist, dev assets.
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
  -x '*-upload/**' \
  -x '.flow-captures/*' \
  -x '.flow-captures/**' \
  -x 'eng.traineddata' \
  -x 'scripts/*' \
  -x 'scripts/**' \
  -x 'docs/*' \
  -x 'docs/**' \
  -x '.cursor/*' \
  -x '.cursor/**' \
  -x 'public/stall-issue-photo.png'

echo "Created: $ZIP ($(du -h "$ZIP" | cut -f1))"
echo "Upload: unzip locally, then drag folder contents into GitHub (not the .zip itself)."
