#!/usr/bin/env node
/** Print image_create payloads from batch-XX-ready-create.json for MCP batching. */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const batchesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.flow-captures/miro-flow-full/upload-batches')
const batchId = process.argv[2]
const ready = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}-ready-create.json`), 'utf8'))
for (const item of ready) {
  console.log(JSON.stringify({ slug: item.slug, miro_url: item.frameUrl, image_token: item.token, is_repository: true }))
}
