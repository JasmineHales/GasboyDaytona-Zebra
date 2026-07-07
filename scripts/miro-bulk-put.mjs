#!/usr/bin/env node
/**
 * Bulk PUT from pending-jobs + per-batch responses; merge ready-create queues.
 * Usage:
 *   node scripts/miro-bulk-put.mjs batch-02
 *   node scripts/miro-bulk-put.mjs all   # all batches with responses files
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const resultsPath = path.join(batchesDir, 'upload-results.json')

function loadResults() {
  return existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : { created: [] }
}

function onBoardSlugs() {
  return new Set(loadResults().created.map((c) => c.slug))
}

async function putBatch(batchId) {
  const jobsPath = path.join(batchesDir, `${batchId}.json`)
  const respPath = path.join(batchesDir, `${batchId}-responses.json`)
  if (!existsSync(jobsPath) || !existsSync(respPath)) {
    return { batchId, skipped: true, reason: 'missing files' }
  }
  const skip = onBoardSlugs()
  const jobs = JSON.parse(readFileSync(jobsPath, 'utf8')).filter((j) => !skip.has(j.slug))
  const responses = JSON.parse(readFileSync(respPath, 'utf8'))
  const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))
  const ready = []
  const failed = []
  for (const job of jobs) {
    const resp = bySlug[job.slug]
    if (!resp?.upload_url || !resp?.token) {
      failed.push({ slug: job.slug, error: 'missing response' })
      continue
    }
    try {
      const res = await fetch(resp.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: readFileSync(job.file),
      })
      if (!res.ok) throw new Error(`PUT HTTP ${res.status}`)
      ready.push({ slug: job.slug, frameUrl: job.frameUrl, token: resp.token, title: job.title })
    } catch (error) {
      failed.push({ slug: job.slug, error: String(error) })
    }
  }
  const outPath = path.join(batchesDir, `${batchId}-ready-create.json`)
  writeFileSync(outPath, JSON.stringify(ready, null, 2))
  return { batchId, ready: ready.length, failed, outPath }
}

const target = process.argv[2] || 'all'
const batchIds =
  target === 'all'
    ? readdirSync(batchesDir)
        .filter((f) => f.match(/^batch-\d+\.json$/))
        .map((f) => f.replace('.json', ''))
        .sort()
    : [target]

const summary = []
for (const batchId of batchIds) {
  summary.push(await putBatch(batchId))
}
const allReady = summary.flatMap((s) =>
  s.outPath && existsSync(s.outPath) ? JSON.parse(readFileSync(s.outPath, 'utf8')) : [],
)
writeFileSync(path.join(batchesDir, 'all-ready-create.json'), JSON.stringify(allReady, null, 2))
console.log(JSON.stringify({ batches: summary, totalReady: allReady.length }))
