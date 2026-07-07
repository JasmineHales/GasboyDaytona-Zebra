#!/usr/bin/env node
/** PUT PNGs and build ready-create from inline response map for one batch. */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const batchId = process.argv[2]
const mapPath = process.argv[3]
if (!batchId || !mapPath) {
  console.error('Usage: node scripts/miro-put-from-map.mjs batch-XX responses-map.json')
  process.exit(1)
}

const batchesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.flow-captures/miro-flow-full/upload-batches')
const jobs = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}.json`), 'utf8'))
const map = JSON.parse(readFileSync(mapPath, 'utf8'))
const ready = []
const failed = []

for (const job of jobs) {
  const resp = map[job.slug]
  if (!resp?.upload_url || !resp?.token) {
    failed.push({ slug: job.slug, error: 'missing map entry' })
    continue
  }
  try {
    const res = await fetch(resp.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(job.file),
    })
    if (!res.ok) throw new Error(`PUT ${res.status}`)
    ready.push({ slug: job.slug, frameUrl: job.frameUrl, token: resp.token, title: job.title })
  } catch (error) {
    failed.push({ slug: job.slug, error: String(error) })
  }
}

const out = path.join(batchesDir, `${batchId}-ready-create.json`)
writeFileSync(out, JSON.stringify(ready, null, 2))
console.log(JSON.stringify({ batchId, ready: ready.length, failed, out }))
