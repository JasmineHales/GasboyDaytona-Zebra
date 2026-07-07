#!/usr/bin/env node
/**
 * Generates MCP image_get_upload_url request payloads for each batch.
 * Agent/process: for each batch file, call MCP image_get_upload_url for each item,
 * save responses to batch-XX-urls.json, then run:
 *   node scripts/miro-upload-all-images.mjs
 *   node scripts/miro-create-images.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')

const batchFiles = readdirSync(batchesDir).filter((f) => f.match(/^batch-\d+\.json$/)).sort()

for (const file of batchFiles) {
  const jobs = JSON.parse(readFileSync(path.join(batchesDir, file), 'utf8'))
  const requests = jobs.map((job) => ({
    slug: job.slug,
    file: job.file,
    frameUrl: job.frameUrl,
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
  writeFileSync(path.join(batchesDir, file.replace('.json', '-requests.json')), JSON.stringify(requests, null, 2))
}

console.log(JSON.stringify({ batches: batchFiles.length, requests: batchFiles.length * 10 }))
