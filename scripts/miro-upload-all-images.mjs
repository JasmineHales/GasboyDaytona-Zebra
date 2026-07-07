#!/usr/bin/env node
/**
 * Upload all captured screenshots to Miro frames.
 * Requires batch *-urls.json files produced by scripts/miro-fetch-upload-urls.mjs (agent/MCP step).
 *
 * Usage:
 *   node scripts/miro-upload-all-images.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAPTURE_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full')
const batchesDir = path.join(CAPTURE_DIR, 'upload-batches')
const BOARD = 'https://miro.com/app/board/uXjVHAsM1OU=/'

const uploaded = []
const failed = []

async function putImage(item) {
  const body = readFileSync(item.file)
  const res = await fetch(item.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body,
  })
  if (!res.ok) throw new Error(`PUT ${item.slug}: ${res.status}`)
  return item.token
}

async function main() {
  const batchFiles = readdirSync(batchesDir)
    .filter((f) => f.startsWith('batch-') && f.endsWith('-urls.json'))
    .sort()

  if (!batchFiles.length) {
    console.error('No *-urls.json batch files found. Run MCP URL fetch first.')
    process.exit(1)
  }

  for (const file of batchFiles) {
    const items = JSON.parse(readFileSync(path.join(batchesDir, file), 'utf8'))
    for (const item of items) {
      try {
        await putImage(item)
        uploaded.push({ slug: item.slug, token: item.token, frameUrl: item.frameUrl })
      } catch (error) {
        failed.push({ slug: item.slug, error: String(error) })
      }
    }
  }

  writeFileSync(path.join(CAPTURE_DIR, 'upload-put-results.json'), JSON.stringify({ uploaded, failed }, null, 2))
  console.log(JSON.stringify({ putOk: uploaded.length, putFailed: failed.length }))
}

main()
