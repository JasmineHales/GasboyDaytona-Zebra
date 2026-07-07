#!/usr/bin/env node
/** PUT PNG bytes to Miro upload URL(s). Usage: node scripts/miro-put-upload.mjs <responses.json> */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAPTURE_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full')
const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/miro-put-upload.mjs <responses.json>')
  process.exit(1)
}

const items = JSON.parse(readFileSync(file, 'utf8'))
const results = []

for (const item of items) {
  const png = path.join(CAPTURE_DIR, `${item.slug}.png`)
  try {
    const res = await fetch(item.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(png),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    results.push({ slug: item.slug, token: item.token, ok: true })
  } catch (error) {
    results.push({ slug: item.slug, ok: false, error: String(error) })
  }
}

console.log(JSON.stringify(results, null, 2))
