#!/usr/bin/env node
/**
 * Create Miro image widgets from upload-put-results.json tokens via MCP image_create.
 * Writes image_create request payloads for agent execution.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAPTURE_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full')
const putPath = path.join(CAPTURE_DIR, 'upload-put-results.json')

if (!existsSync(putPath)) {
  console.error('Missing upload-put-results.json — run miro-upload-all-images.mjs first')
  process.exit(1)
}

const { uploaded } = JSON.parse(readFileSync(putPath, 'utf8'))
const createRequests = uploaded.map((item) => ({
  slug: item.slug,
  mcp: {
    tool: 'image_create',
    args: {
      miro_url: item.frameUrl,
      image_token: item.token,
      is_repository: true,
    },
  },
}))

writeFileSync(path.join(CAPTURE_DIR, 'image-create-requests.json'), JSON.stringify(createRequests, null, 2))
console.log(JSON.stringify({ createRequests: createRequests.length }))
