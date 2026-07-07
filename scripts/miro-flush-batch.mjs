#!/usr/bin/env node
/** Append MCP upload-url responses from stdin JSON array, then PUT + ready-create. */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const batchesDir = path.join(root, '.flow-captures/miro-flow-full/upload-batches')
const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: echo \'[{slug,upload_url,token}]\' | node scripts/miro-flush-batch.mjs batch-XX')
  process.exit(1)
}
const incoming = JSON.parse(readFileSync(0, 'utf8'))
const outPath = path.join(batchesDir, `${batchId}-responses.json`)
const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : []
const bySlug = Object.fromEntries(existing.map((r) => [r.slug, r]))
for (const r of incoming) bySlug[r.slug] = r
writeFileSync(outPath, JSON.stringify(Object.values(bySlug), null, 2))
const put = spawnSync('node', ['scripts/miro-batch-upload-runner.mjs', batchId], {
  cwd: root,
  encoding: 'utf8',
})
console.log(put.stdout || put.stderr)
