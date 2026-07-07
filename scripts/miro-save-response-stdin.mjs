#!/usr/bin/env node
/** Save MCP responses from stdin JSON array to batch file. */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: node scripts/miro-save-response-stdin.mjs <batch-id> < responses.json')
  process.exit(1)
}
const batchesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.flow-captures/miro-flow-full/upload-batches')
const outPath = path.join(batchesDir, `${batchId}-responses.json`)
const incoming = JSON.parse(readFileSync(0, 'utf8'))
const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : []
const bySlug = Object.fromEntries(existing.map((r) => [r.slug, r]))
for (const r of incoming) bySlug[r.slug] = r
writeFileSync(outPath, JSON.stringify(Object.values(bySlug), null, 2))
console.log(JSON.stringify({ batchId, count: Object.keys(bySlug).length, outPath }))
