#!/usr/bin/env node
/**
 * After image_create MCP calls, record results.
 * Also runs PUT+create pipeline for a responses file.
 *
 * Usage:
 *   node scripts/miro-upload-pipeline.mjs put-create batch-01 batch-01-responses.json
 *   node scripts/miro-upload-pipeline.mjs record batch-01-create.json batch-01-created.json
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const resultsFile = path.join(batchesDir, 'upload-results.json')

const [cmd, batchId, arg2] = process.argv.slice(2)

function loadResults() {
  if (!existsSync(resultsFile)) return { created: [], failed: [], batches: {} }
  return JSON.parse(readFileSync(resultsFile, 'utf8'))
}

function saveResults(r) {
  writeFileSync(resultsFile, JSON.stringify(r, null, 2))
}

if (cmd === 'put-create') {
  const responsesPath = arg2 || path.join(batchesDir, `${batchId}-responses.json`)
  const jobs = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}.json`), 'utf8')).filter(
    (j) => j.slug !== 'login',
  )
  const responses = JSON.parse(readFileSync(responsesPath, 'utf8'))
  const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))
  const putOk = []
  const putFailed = []
  for (const job of jobs) {
    const resp = bySlug[job.slug]
    if (!resp) {
      putFailed.push({ slug: job.slug, error: 'no response' })
      continue
    }
    try {
      const res = await fetch(resp.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: readFileSync(job.file),
      })
      if (!res.ok) throw new Error(`PUT ${res.status}`)
      putOk.push({ slug: job.slug, frameUrl: job.frameUrl, token: resp.token, title: job.title })
    } catch (e) {
      putFailed.push({ slug: job.slug, error: String(e) })
    }
  }
  const createPath = path.join(batchesDir, `${batchId}-create.json`)
  writeFileSync(createPath, JSON.stringify(putOk, null, 2))
  const results = loadResults()
  results.batches = results.batches || {}
  results.batches[batchId] = { putOk: putOk.length, putFailed: putFailed.length, createPath }
  saveResults(results)
  console.log(JSON.stringify({ batchId, putOk: putOk.length, putFailed, createPath }))
} else if (cmd === 'record') {
  const createdPath = arg2
  const created = JSON.parse(readFileSync(createdPath, 'utf8'))
  const results = loadResults()
  results.created = [...(results.created || []), ...created.filter((c) => c.success)]
  results.failed = [...(results.failed || []), ...created.filter((c) => !c.success)]
  saveResults(results)
  console.log(JSON.stringify({ totalCreated: results.created.length, added: created.length }))
} else {
  console.error('Commands: put-create, record')
  process.exit(1)
}
