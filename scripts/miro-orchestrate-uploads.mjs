#!/usr/bin/env node
/**
 * Orchestrate Miro batch uploads: list pending jobs, merge MCP responses, run PUT, emit create specs.
 *
 * Usage:
 *   node scripts/miro-orchestrate-uploads.mjs pending          # jobs needing upload URLs
 *   node scripts/miro-orchestrate-uploads.mjs put batch-02     # PUT after responses saved
 *   node scripts/miro-orchestrate-uploads.mjs record batch-02  # append create results
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const resultsPath = path.join(batchesDir, 'upload-results.json')
const BOARD = 'https://miro.com/app/board/uXjVHAsM1OU=/'
const NEW_FRAME_PREFIX = '3458764676836710'

function loadResults() {
  if (!existsSync(resultsPath)) {
    return { targetTotal: 82, created: [], failed: [], batches: {} }
  }
  return JSON.parse(readFileSync(resultsPath, 'utf8'))
}

function saveResults(results) {
  const slugs = new Set(results.created.map((c) => c.slug))
  results.estimatedOnBoard = slugs.size
  results.remaining = results.targetTotal - slugs.size
  results.lastUpdated = new Date().toISOString()
  results.mcpAuthBlocked = false
  writeFileSync(resultsPath, JSON.stringify(results, null, 2))
}

function onBoardSlugs(results) {
  return new Set(results.created.map((c) => c.slug))
}

function loadBatchJobs(batchId) {
  const file = path.join(batchesDir, `${batchId}.json`)
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf8'))
}

function pendingJobs(batchIds, skipSlugs) {
  const pending = []
  for (const batchId of batchIds) {
    for (const job of loadBatchJobs(batchId)) {
      if (skipSlugs.has(job.slug)) continue
      pending.push({ ...job, batchId })
    }
  }
  return pending
}

const cmd = process.argv[2]

if (cmd === 'pending') {
  const results = loadResults()
  const skip = onBoardSlugs(results)
  const jobs = pendingJobs(
    ['batch-01', 'batch-02', 'batch-03', 'batch-04', 'batch-05', 'batch-06', 'batch-07', 'batch-08'],
    skip,
  )
  const byBatch = {}
  for (const j of jobs) {
    byBatch[j.batchId] = (byBatch[j.batchId] || 0) + 1
  }
  writeFileSync(path.join(batchesDir, 'pending-jobs.json'), JSON.stringify(jobs, null, 2))
  console.log(JSON.stringify({ pending: jobs.length, byBatch, skip: [...skip] }))
} else if (cmd === 'put') {
  const batchId = process.argv[3]
  if (!batchId) {
    console.error('Usage: node scripts/miro-orchestrate-uploads.mjs put batch-XX')
    process.exit(1)
  }
  const responsesPath = path.join(batchesDir, `${batchId}-responses.json`)
  const jobs = loadBatchJobs(batchId)
  const results = loadResults()
  const skip = onBoardSlugs(results)
  const filtered = jobs.filter((j) => !skip.has(j.slug))
  const responses = JSON.parse(readFileSync(responsesPath, 'utf8'))
  const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))
  const ready = []
  const failed = []
  for (const job of filtered) {
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
      ready.push({ slug: job.slug, frameUrl: job.frameUrl, token: resp.token, title: job.title })
    } catch (error) {
      failed.push({ slug: job.slug, error: String(error) })
    }
  }
  const outPath = path.join(batchesDir, `${batchId}-ready-create.json`)
  writeFileSync(outPath, JSON.stringify(ready, null, 2))
  results.batches[batchId] = { putOk: ready.length, createPending: ready.length, status: failed.length ? 'partial' : 'put_done', failed }
  saveResults(results)
  console.log(JSON.stringify({ batchId, ready: ready.length, failed, outPath }))
} else if (cmd === 'record') {
  const batchId = process.argv[3]
  const createsJson = process.argv[4]
  if (!batchId || !createsJson) {
    console.error('Usage: node scripts/miro-orchestrate-uploads.mjs record batch-XX \'[{slug,widget,mcp_url}]\'')
    process.exit(1)
  }
  const created = JSON.parse(createsJson)
  const results = loadResults()
  for (const c of created) {
    if (!results.created.find((x) => x.slug === c.slug)) {
      results.created.push({ slug: c.slug, widget: c.widget, note: `${batchId} image_create` })
    }
  }
  results.batches[batchId] = { ...(results.batches[batchId] || {}), status: 'complete', createPending: 0 }
  saveResults(results)
  console.log(JSON.stringify({ recorded: created.length, total: results.created.length }))
} else if (cmd === 'requests') {
  const batchId = process.argv[3]
  const results = loadResults()
  const skip = onBoardSlugs(results)
  const jobs = loadBatchJobs(batchId).filter((j) => !skip.has(j.slug))
  const requests = jobs.map((job) => ({
    slug: job.slug,
    mcp: {
      tool: 'image_get_upload_url',
      args: {
        miro_url: job.frameUrl,
        content_type: 'image/png',
        title: job.title,
        x: job.x,
        y: job.y,
        width: job.width,
        is_repository: true,
      },
    },
  }))
  writeFileSync(path.join(batchesDir, `${batchId}-mcp-requests.json`), JSON.stringify(requests, null, 2))
  console.log(JSON.stringify({ batchId, requests: requests.length }))
} else {
  console.error('Commands: pending | put batch-XX | record batch-XX JSON | requests batch-XX')
  process.exit(1)
}
