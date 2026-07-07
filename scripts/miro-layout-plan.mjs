#!/usr/bin/env node
/**
 * Upload captured PNGs to Miro via MCP image_get_upload_url tokens passed on stdin as JSON lines:
 * {"slug":"transport-default","token":"...","x":100,"y":200,"title":"..."}
 *
 * Or run with --put-only to PUT bytes after MCP returns upload_url (see companion flow).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAPTURE_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full')
const MANIFEST = JSON.parse(readFileSync(path.join(CAPTURE_DIR, 'manifest.json'), 'utf8'))
const BOARD = 'https://miro.com/app/board/uXjVHAsM1OU=/'

const GROUP_ORDER = [
  'Entry & Home',
  'Vehicle search',
  'Odometer widget',
  'Mileage scenarios',
  'Transport · Session',
  'Movement · Transport location',
  'Movement · Stall assignment',
  'Fuel · Gasboy unlock with device',
  'Fuel · Gasboy unlock at pump',
  'Fuel · Non-Gasboy',
  'VSA · Session',
  'VSA · Cleaning',
  'VSA · Stall assignment',
]

const COLS = 4
const IMG_W = 180
const IMG_H = 400
const LABEL_H = 40
const CELL_W = 220
const CELL_H = 480
const FRAME_PAD = 80
const ORIGIN_X = 2200
const ORIGIN_Y = 5200

function layoutPlan() {
  const items = []
  let frameY = ORIGIN_Y
  let maxFrameW = 0

  for (const groupName of GROUP_ORDER) {
    const entries = MANIFEST.groups[groupName]
    if (!entries?.length) continue

    const cols = Math.min(COLS, entries.length)
    const rows = Math.ceil(entries.length / cols)
    const frameW = cols * CELL_W + FRAME_PAD * 2
    const frameH = rows * CELL_H + FRAME_PAD * 2 + 40
    maxFrameW = Math.max(maxFrameW, frameW)
    const frameX = ORIGIN_X + frameW / 2
    const frameCenterY = frameY + frameH / 2
    const frameId = slugify(groupName)

    items.push({
      kind: 'frame',
      id: frameId,
      groupName,
      x: frameX,
      y: frameCenterY,
      w: frameW,
      h: frameH,
    })

    entries.forEach((entry, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      items.push({
        kind: 'shot',
        slug: entry.slug,
        label: entry.label,
        groupName,
        frameId,
        x: FRAME_PAD + col * CELL_W + CELL_W / 2,
        y: FRAME_PAD + 60 + row * CELL_H + IMG_H / 2 + 20,
        labelY: FRAME_PAD + 30 + row * CELL_H + 20,
        labelX: FRAME_PAD + col * CELL_W + CELL_W / 2,
        file: path.join(CAPTURE_DIR, `${entry.slug}.png`),
      })
    })

    frameY += frameH + 120
  }

  return { items, totalHeight: frameY - ORIGIN_Y, maxFrameW }
}

function slugify(value) {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase()
}

export function buildLayoutDsl(imageUrlBySlug) {
  const { items } = layoutPlan()
  const lines = [
    '# Complete visual flow — all states',
    `title TEXT x=${ORIGIN_X + 600} y=${ORIGIN_Y - 120} w=1400 size=36 align=center color=#1a1a1a "<p>Complete visual flow — all states</p><p>Jun 2026 · 82 screens · Daytona prototype</p>"`,
  ]

  for (const item of items) {
    if (item.kind === 'frame') {
      lines.push(
        `${item.id} FRAME x=${Math.round(item.x)} y=${Math.round(item.y)} w=${Math.round(item.w)} h=${Math.round(item.h)} fill=#F8F9FA "${item.groupName}"`,
      )
    }
  }

  for (const item of items) {
    if (item.kind !== 'shot') continue
    const imgId = `img_${item.slug.replace(/-/g, '_')}`
    const lblId = `lbl_${item.slug.replace(/-/g, '_')}`
    lines.push(
      `${lblId} TEXT parent=${item.frameId} x=${Math.round(item.labelX)} y=${Math.round(item.labelY)} w=${CELL_W - 20} size=11 align=center color=#333333 "${item.label.replace(/"/g, '\\"')}"`,
    )
    if (imageUrlBySlug?.[item.slug]) {
      lines.push(
        `# image ${item.slug} uploaded separately via image_create`,
      )
    }
  }

  return lines.join('\n')
}

export function buildImageJobs() {
  const { items } = layoutPlan()
  return items
    .filter((i) => i.kind === 'shot')
    .map((item) => ({
      slug: item.slug,
      label: item.label,
      frameId: item.frameId,
      x: item.x,
      y: item.y,
      width: IMG_W,
      file: item.file,
      title: `${item.label} (${item.slug})`,
    }))
}

if (process.argv[1]?.endsWith('miro-layout-plan.mjs')) {
  const plan = layoutPlan()
  const jobs = buildImageJobs()
  writeFileSync(
    path.join(CAPTURE_DIR, 'miro-upload-plan.json'),
    JSON.stringify({ board: BOARD, origin: { x: ORIGIN_X, y: ORIGIN_Y }, plan, jobs }, null, 2),
  )
  writeFileSync(path.join(CAPTURE_DIR, 'miro-layout.dsl'), buildLayoutDsl({}))
  console.log(JSON.stringify({ jobs: jobs.length, frames: plan.items.filter((i) => i.kind === 'frame').length }))
}
