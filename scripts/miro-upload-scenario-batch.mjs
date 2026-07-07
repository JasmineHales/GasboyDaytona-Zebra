#!/usr/bin/env node
/**
 * Orchestrate Miro scenario screenshot uploads.
 * Phase 1: node scripts/miro-upload-scenario-batch.mjs export > /tmp/miro-batch.json
 * Phase 2: Agent gets upload URLs via MCP image_get_upload_url for each item in batch
 * Phase 3: node scripts/miro-upload-scenario-batch.mjs put /tmp/tokens-batch.json
 * Phase 4: Agent calls image_create for each token
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(
  readFileSync(path.join(__dirname, 'miro-scenario-screens.json'), 'utf8'),
)

function flattenJobs() {
  const jobs = []
  for (const scenario of manifest.scenarios) {
    scenario.screens.forEach((screen, index) => {
      jobs.push({
        scenarioId: scenario.id,
        title: `${scenario.id.toUpperCase()} · ${screen.title}`,
        file: path.join(__dirname, '..', manifest.captureDir, screen.file),
        x: scenario.originX + index * manifest.rowGap,
        y: scenario.originY,
        width: manifest.imageWidth,
        board: manifest.board,
      })
    })
  }
  return jobs
}

const [cmd, arg1, arg2] = process.argv.slice(2)
const allJobs = flattenJobs()

if (cmd === 'export') {
  console.log(JSON.stringify({ board: manifest.board, jobs: allJobs }, null, 2))
  process.exit(0)
}

if (cmd === 'batch') {
  const start = Number(arg1 || 0)
  const size = Number(arg2 || 8)
  const slice = allJobs.slice(start, start + size)
  console.log(JSON.stringify({ start, size: slice.length, board: manifest.board, jobs: slice }, null, 2))
  process.exit(0)
}

if (cmd === 'count') {
  console.log(allJobs.length)
  process.exit(0)
}

if (cmd === 'put') {
  const items = JSON.parse(readFileSync(arg1, 'utf8'))
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        if (!existsSync(item.file)) throw new Error(`Missing: ${item.file}`)
        const bytes = readFileSync(item.file)
        const res = await fetch(item.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/png' },
          body: bytes,
        })
        if (!res.ok) throw new Error(`PUT ${res.status}`)
        return { title: item.title, ok: true, token: item.token }
      } catch (e) {
        return { title: item.title, ok: false, error: String(e.message || e) }
      }
    }),
  )
  const ok = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)
  console.log(JSON.stringify({ uploaded: ok.length, failed, tokens: ok }, null, 2))
  process.exit(failed.length ? 1 : 0)
}

console.error('Usage: export | batch <start> [size] | count | put <tokens.json>')
process.exit(1)
