#!/usr/bin/env node
/**
 * Delete legacy diagram widgets and duplicate static PNG images from Miro board.
 *
 * Requires MIRO_ACCESS_TOKEN with boards:write scope (Miro developer app token or OAuth).
 *
 * Usage:
 *   MIRO_ACCESS_TOKEN=... node scripts/miro-delete-legacy-flow-items.mjs
 *   MIRO_ACCESS_TOKEN=... node scripts/miro-delete-legacy-flow-items.mjs --dry-run
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BOARD = 'uXjVHAsM1OU='
const GALLERY_FRAME = '3458764676946546900'
const DRY_RUN = process.argv.includes('--dry-run')

const urlsPath = path.join(__dirname, '../.flow-captures/miro-flow-full/diagrams/static-image-urls.json')
const entries = JSON.parse(readFileSync(urlsPath, 'utf8'))

const OLD_DIAGRAMS = entries.map((e) => e.oldDiagramId)
const OLD_STATIC = entries.map((e) => e.staticImageId).filter(Boolean)
const ITEMS = [...new Set([...OLD_DIAGRAMS, ...OLD_STATIC])]

const token = process.env.MIRO_ACCESS_TOKEN
if (!token && !DRY_RUN) {
  console.error('Set MIRO_ACCESS_TOKEN (boards:write) to delete items via REST API.')
  process.exit(1)
}

const deleted = []
const failed = []

for (const itemId of ITEMS) {
  const url = `https://api.miro.com/v2/boards/${BOARD}/items/${itemId}`
  if (DRY_RUN) {
    console.log('would delete', itemId)
    deleted.push(itemId)
    continue
  }
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (res.status === 204 || res.status === 200) {
    deleted.push(itemId)
    console.log('deleted', itemId)
  } else {
    const body = await res.text()
    failed.push({ itemId, status: res.status, body: body.slice(0, 200) })
    console.error('failed', itemId, res.status, body.slice(0, 120))
  }
  await new Promise((r) => setTimeout(r, 120))
}

console.log(JSON.stringify({
  board: `https://miro.com/app/board/${BOARD}`,
  galleryFrame: GALLERY_FRAME,
  dryRun: DRY_RUN,
  attempted: ITEMS.length,
  deleted: deleted.length,
  failed: failed.length,
  deletedIds: deleted,
  failedItems: failed,
}, null, 2))

process.exit(failed.length ? 1 : 0)
