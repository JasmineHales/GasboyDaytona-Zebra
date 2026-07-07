#!/usr/bin/env bash
# Split project into small zips for GitHub web upload (≤60 files each, no huge assets).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$(dirname "$ROOT")/remote-off-github-batches"
MAX_FILES=60

cd "$ROOT"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

should_skip() {
  local path="$1"
  case "$path" in
    ./node_modules/*|./dist/*|./.git/*|./.flow-captures/*|./scripts/*|./docs/*|./.cursor/*|./eng.traineddata|./public/stall-issue-photo.png|./.env.local|./.env) return 0 ;;
  esac
  case "$path" in
    ./*.zip|./remote-off-github-batches/*) return 0 ;;
  esac
  return 1
}

LIST_FILE="$(mktemp)"
find . -type f ! -name '.DS_Store' | sort | while read -r f; do
  should_skip "$f" && continue
  echo "${f#./}"
done > "$LIST_FILE"

TOTAL=$(wc -l < "$LIST_FILE" | tr -d ' ')
BATCH=1
COUNT=0
BATCH_FILE="$(mktemp)"

finish_batch() {
  local n
  n=$(wc -l < "$BATCH_FILE" | tr -d ' ')
  [[ "$n" -eq 0 ]] && return 0
  local zip="$OUT_DIR/batch-$(printf '%02d' "$BATCH").zip"
  (cd "$ROOT" && zip -q "$zip" -@ < "$BATCH_FILE")
  echo "  batch-$(printf '%02d' "$BATCH").zip — $n files ($(du -h "$zip" | cut -f1))"
  BATCH=$((BATCH + 1))
  : > "$BATCH_FILE"
}

while IFS= read -r rel; do
  echo "$rel" >> "$BATCH_FILE"
  COUNT=$((COUNT + 1))
  if [[ $(wc -l < "$BATCH_FILE" | tr -d ' ') -ge $MAX_FILES ]] || [[ $COUNT -eq $TOTAL ]]; then
    finish_batch
  fi
done < "$LIST_FILE"

NUM_BATCHES=$((BATCH - 1))

cat > "$OUT_DIR/UPLOAD-INSTRUCTIONS.txt" <<EOF
GitHub web upload — one batch per commit (≤60 files each).

1. Create empty repo: Daytona-Gasboyboy-V2 on JasmineHales
2. Unzip batch-01.zip → drag contents into GitHub → Commit
3. Repeat for batch-02, batch-03, ... (merge into same repo)
4. Keep folder paths (src/ must stay under src/)

After all batches:
  npm install
  npm run dev

Excluded: node_modules, dist, scripts, docs, screenshots, stall-issue-photo.png
Total: $TOTAL files in $NUM_BATCHES batches
EOF

rm -f "$LIST_FILE" "$BATCH_FILE"

echo ""
echo "Created $NUM_BATCHES batches in:"
echo "  $OUT_DIR"
echo ""
cat "$OUT_DIR/UPLOAD-INSTRUCTIONS.txt"
