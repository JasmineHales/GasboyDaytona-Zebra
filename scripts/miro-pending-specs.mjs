#!/usr/bin/env node
/** List pending MCP upload specs from all-mcp-specs.json minus upload-results created slugs. */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const specs = JSON.parse(readFileSync(path.join(batchesDir, 'all-mcp-specs.json'), 'utf8'))
const results = existsSync(path.join(batchesDir, 'upload-results.json'))
  ? JSON.parse(readFileSync(path.join(batchesDir, 'upload-results.json'), 'utf8'))
  : { created: [] }
const skip = new Set(results.created.map((c) => c.slug))
const pending = specs.filter((s) => !skip.has(s.slug) && s.slug !== 'login')
const byBatch = {}
for (const p of pending) {
  byBatch[p.batch] = (byBatch[p.batch] || 0) + 1
}
writeFileSync(path.join(batchesDir, 'pending-specs.json'), JSON.stringify(pending, null, 2))
console.log(JSON.stringify({ pending: pending.length, byBatch }))
