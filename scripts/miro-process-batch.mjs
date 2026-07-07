#!/usr/bin/env node
/**
 * Process one batch: PUT all jobs with responses, output ready-create JSON.
 * Skips slugs already in upload-results.json.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: node scripts/miro-process-batch.mjs batch-XX')
  process.exit(1)
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.flow-captures/miro-flow-full/upload-batches')
const jobs = JSON.parse(readFileSync(path.join(dir, `${batchId}.json`), 'utf8'))
const respPath = path.join(dir, `${batchId}-responses.json`)
if (!existsSync(respPath)) {
  console.error('Missing', respPath)
  process.exit(1)
}
const responses = JSON.parse(readFileSync(respPath, 'utf8'))
const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))
const resultsPath = path.join(dir, 'upload-results.json')
const skip = existsSync(resultsPath)
  ? new Set(JSON.parse(readFileSync(resultsPath, 'utf8')).created.map((c) => c.slug))
  : new Set()

const ready = []
const failed = []
for (const job of jobs) {
  if (skip.has(job.slug)) continue
  const resp = bySlug[job.slug]
  if (!resp?.upload_url || !resp?.token) {
    failed.push({ slug: job.slug, error: 'no response' })
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
  } catch (e) {
    failed.push({ slug: job.slug, error: String(e) })
  }
}
const out = path.join(dir, `${batchId}-ready-create.json`)
writeFileSync(out, JSON.stringify(ready, null, 2))
console.log(JSON.stringify({ batchId, ready: ready.length, failed, out }))
