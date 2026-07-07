#!/usr/bin/env node
/** Merge MCP upload responses into a batch urls file. */
import { readFileSync, writeFileSync } from 'fs'

const batchPath = process.argv[2]
const responsesPath = process.argv[3]
if (!batchPath || !responsesPath) {
  console.error('Usage: node scripts/miro-merge-urls.mjs <batch.json> <responses.json>')
  process.exit(1)
}

const jobs = JSON.parse(readFileSync(batchPath, 'utf8'))
const responses = JSON.parse(readFileSync(responsesPath, 'utf8'))
const bySlug = Object.fromEntries(responses.map((r) => [r.slug, r]))

const urls = jobs
  .filter((job) => bySlug[job.slug])
  .map((job) => ({
    slug: job.slug,
    file: job.file,
    frameUrl: job.frameUrl,
    upload_url: bySlug[job.slug].upload_url,
    token: bySlug[job.slug].token,
  }))

const out = batchPath.replace('.json', '-urls.json')
writeFileSync(out, JSON.stringify(urls, null, 2))
console.log(JSON.stringify({ out, count: urls.length }))
