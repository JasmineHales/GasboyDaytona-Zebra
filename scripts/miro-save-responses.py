#!/usr/bin/env python3
"""Save Miro upload responses to batch JSON. Usage: python3 scripts/miro-save-responses.py <batch-id> < responses.json"""
import json, sys, os
from pathlib import Path

batch_id = sys.argv[1]
out = Path(__file__).resolve().parent.parent / '.flow-captures/miro-flow-full/upload-batches' / f'{batch_id}-responses.json'
incoming = json.load(sys.stdin)
existing = json.loads(out.read_text()) if out.exists() else []
by_slug = {r['slug']: r for r in existing}
for r in incoming:
    by_slug[r['slug']] = r
merged = list(by_slug.values())
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(merged, indent=2))
print(json.dumps({'batchId': batch_id, 'count': len(merged), 'outPath': str(out)}))
