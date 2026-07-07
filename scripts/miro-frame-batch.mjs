#!/usr/bin/env node
/** Process one frame batch: save responses, PUT PNGs, emit create specs. */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const [batchId, incomingPath] = process.argv.slice(2)
if (!batchId || !incomingPath) {
  console.error('Usage: node scripts/miro-frame-batch.mjs <batch-id> <incoming.json>')
  process.exit(1)
}

const outPath = path.join(batchesDir, `${batchId}-responses.json`)
const incoming = JSON.parse(readFileSync(incomingPath, 'utf8'))
writeFileSync(outPath, JSON.stringify(incoming, null, 2))

const putResults = []
for (const item of incoming) {
  const png = path.join(__dirname, '../.flow-captures/miro-flow-full', `${item.slug}.png`)
  try {
    const res = await fetch(item.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(png),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    putResults.push({ slug: item.slug, token: item.token, ok: true, frameUrl: item.frameUrl })
  } catch (error) {
    putResults.push({ slug: item.slug, ok: false, error: String(error) })
  }
}

const readyPath = path.join(batchesDir, `${batchId}-ready-create.json`)
const ready = putResults.filter((r) => r.ok).map((r) => ({
  slug: r.slug,
  token: r.token,
  frameUrl: r.frameUrl || incoming.find((i) => i.slug === r.slug)?.frameUrl,
}))
writeFileSync(readyPath, JSON.stringify(ready, null, 2))
console.log(JSON.stringify({ batchId, putOk: ready.length, failed: putResults.filter((r) => !r.ok), readyPath }))
