#!/usr/bin/env node
/**
 * Process one batch end-to-end given MCP responses JSON.
 * Usage: node scripts/miro-process-batch-full.mjs batch-01 batch-01-responses.json
 * Then run image_create via: node scripts/miro-image-create-all.mjs batch-01-create.json
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const resultsFile = path.join(batchesDir, 'upload-results.json')
const SKIP = new Set(['login'])

const batchId = process.argv[2]
const responsesPath = process.argv[3] || path.join(batchesDir, `${batchId}-responses.json`)

if (!batchId) {
  console.error('Usage: node scripts/miro-process-batch-full.mjs batch-XX [responses.json]')
  process.exit(1)
}

const jobs = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}.json`), 'utf8')).filter(
  (j) => !SKIP.has(j.slug),
)
const responses = JSON.parse(readFileSync(responsesPath, 'utf8'))
const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))

const putOk = []
const putFailed = []

for (const job of jobs) {
  const resp = bySlug[job.slug]
  if (!resp?.upload_url || !resp?.token) {
    putFailed.push({ slug: job.slug, error: 'missing response' })
    continue
  }
  try {
    const body = readFileSync(job.file)
    const res = await fetch(resp.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body,
    })
    if (!res.ok) throw new Error(`PUT ${res.status}`)
    putOk.push({ slug: job.slug, frameUrl: job.frameUrl, token: resp.token, title: job.title })
  } catch (error) {
    putFailed.push({ slug: job.slug, error: String(error) })
  }
}

const createPath = path.join(batchesDir, `${batchId}-create.json`)
writeFileSync(createPath, JSON.stringify(putOk, null, 2))

let results = { created: [], failed: [], putFailed: [] }
if (existsSync(resultsFile)) results = JSON.parse(readFileSync(resultsFile, 'utf8'))
results.putFailed = [...(results.putFailed || []), ...putFailed]
writeFileSync(resultsFile, JSON.stringify(results, null, 2))

console.log(JSON.stringify({ batchId, putOk: putOk.length, putFailed: putFailed.length, createPath }))
