#!/usr/bin/env node
/**
 * PUT PNG bytes and emit image_create payloads from MCP upload-url responses.
 *
 * Usage:
 *   node scripts/miro-batch-upload-runner.mjs batch-01 .flow-captures/miro-flow-full/upload-batches/batch-01-responses.json
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')

const [batchId, responsesPathArg] = process.argv.slice(2)
if (!batchId) {
  console.error('Usage: node scripts/miro-batch-upload-runner.mjs <batch-id> [responses.json]')
  process.exit(1)
}

const batchPath = path.join(batchesDir, `${batchId}.json`)
const responsesPath = responsesPathArg || path.join(batchesDir, `${batchId}-responses.json`)
const jobs = JSON.parse(readFileSync(batchPath, 'utf8'))
const responses = JSON.parse(readFileSync(responsesPath, 'utf8'))
const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))

const ready = []
const failed = []

for (const job of jobs) {
  const resp = bySlug[job.slug]
  if (!resp?.upload_url || !resp?.token) {
    failed.push({ slug: job.slug, error: 'missing upload response' })
    continue
  }
  try {
    const res = await fetch(resp.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(job.file),
    })
    if (!res.ok) throw new Error(`PUT HTTP ${res.status}`)
    ready.push({
      slug: job.slug,
      frameUrl: job.frameUrl,
      token: resp.token,
      title: job.title,
    })
  } catch (error) {
    failed.push({ slug: job.slug, error: String(error) })
  }
}

const outPath = path.join(batchesDir, `${batchId}-ready-create.json`)
writeFileSync(outPath, JSON.stringify(ready, null, 2))
console.log(JSON.stringify({ batchId, ready: ready.length, failed, outPath }))
