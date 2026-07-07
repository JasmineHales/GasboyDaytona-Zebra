#!/usr/bin/env node
/** PUT diagram PNGs and emit image_create specs. Usage: node scripts/miro-diagram-put.mjs <responses.json> */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIAGRAM_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full/diagrams')
const BOARD = 'https://miro.com/app/board/uXjVHAsM1OU=/'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/miro-diagram-put.mjs <responses.json>')
  process.exit(1)
}

const items = JSON.parse(readFileSync(file, 'utf8'))
const putResults = []

for (const item of items) {
  const png = path.join(DIAGRAM_DIR, `${item.slug}.png`)
  try {
    const res = await fetch(item.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(png),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    putResults.push({ slug: item.slug, token: item.token, ok: true })
  } catch (error) {
    putResults.push({ slug: item.slug, ok: false, error: String(error) })
  }
}

const ready = putResults.filter((r) => r.ok).map((r) => {
  const src = items.find((i) => i.slug === r.slug)
  return {
    slug: r.slug,
    token: r.token,
    title: src?.title,
    x: src?.x,
    y: src?.y,
    width: src?.width,
    miro_url: BOARD,
  }
})

const readyPath = file.replace('-responses.json', '-ready-create.json').replace('.json', '-ready-create.json')
const outPath = file.includes('-responses') ? file.replace('-responses.json', '-ready-create.json') : `${file.replace('.json', '')}-ready-create.json`
writeFileSync(outPath, JSON.stringify(ready, null, 2))
console.log(JSON.stringify({ putOk: ready.length, failed: putResults.filter((r) => !r.ok), readyPath: outPath }))
