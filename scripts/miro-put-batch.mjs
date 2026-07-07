#!/usr/bin/env node
/**
 * PUT PNG bytes to Miro upload URLs from a batch JSON file.
 * Batch format: [{ slug, file, upload_url, token }]
 */
import { readFileSync, writeFileSync } from 'fs'

const batchPath = process.argv[2]
const outPath = process.argv[3]
if (!batchPath || !outPath) {
  console.error('Usage: node scripts/miro-put-batch.mjs <batch.json> <results.json>')
  process.exit(1)
}

const batch = JSON.parse(readFileSync(batchPath, 'utf8'))
const results = []

for (const item of batch) {
  try {
    const body = readFileSync(item.file)
    const res = await fetch(item.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body,
    })
    if (!res.ok) {
      throw new Error(`PUT ${res.status} ${await res.text()}`)
    }
    results.push({ slug: item.slug, token: item.token, ok: true })
  } catch (error) {
    results.push({ slug: item.slug, token: item.token, ok: false, error: String(error) })
  }
}

writeFileSync(outPath, JSON.stringify(results, null, 2))
console.log(JSON.stringify({ ok: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length }))
