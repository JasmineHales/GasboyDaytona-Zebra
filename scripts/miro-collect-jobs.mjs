#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const SKIP = new Set(['login'])

const jobs = []
for (const file of readdirSync(batchesDir).filter((f) => /^batch-\d+\.json$/.test(f)).sort()) {
  const batch = JSON.parse(readFileSync(path.join(batchesDir, file), 'utf8'))
  for (const job of batch) {
    if (SKIP.has(job.slug)) continue
    jobs.push({ ...job, batch: file.replace('.json', '') })
  }
}

writeFileSync(path.join(batchesDir, 'all-jobs.json'), JSON.stringify(jobs, null, 2))
console.log(JSON.stringify({ total: jobs.length, skipped: [...SKIP] }))
