#!/usr/bin/env node
/** Merge slug/upload_url/token entries into batch-XX-responses.json */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const [batchId, ...rest] = process.argv.slice(2)
if (!batchId || !rest.length) {
  console.error('Usage: node scripts/miro-save-responses.mjs batch-XX \'[{slug,upload_url,token}]\'')
  process.exit(1)
}
const incoming = JSON.parse(rest.join(' '))
const outPath = path.join(batchesDir, `${batchId}-responses.json`)
const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : []
const bySlug = Object.fromEntries(existing.map((r) => [r.slug, r]))
for (const r of incoming) bySlug[r.slug] = r
const merged = Object.values(bySlug)
writeFileSync(outPath, JSON.stringify(merged, null, 2))
console.log(JSON.stringify({ batchId, count: merged.length, outPath }))
