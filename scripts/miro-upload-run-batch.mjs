#!/usr/bin/env node
/**
 * Batch helpers for Miro scenario screen upload.
 *   node scripts/miro-upload-run-batch.mjs jobs [start] [size]
 *   node scripts/miro-upload-run-batch.mjs put <tokens.json>
 * tokens.json: [{title,file,upload_url,token}]
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const listOut = JSON.parse(
  readFileSync(path.join(__dirname, 'miro-scenario-screens.json'), 'utf8'),
)

function flattenJobs() {
  const jobs = []
  for (const scenario of listOut.scenarios) {
    scenario.screens.forEach((screen, index) => {
      jobs.push({
        scenarioId: scenario.id,
        title: `${scenario.id.toUpperCase()} · ${screen.title}`,
        file: path.join(__dirname, '..', listOut.captureDir, screen.file),
        x: scenario.originX + index * listOut.rowGap,
        y: scenario.originY,
        width: listOut.imageWidth,
        board: listOut.board,
      })
    })
  }
  return jobs
}

const [cmd, arg1, arg2] = process.argv.slice(2)
const allJobs = flattenJobs()

if (cmd === 'jobs') {
  const start = Number(arg1 || 0)
  const size = Number(arg2 || 8)
  console.log(JSON.stringify(allJobs.slice(start, start + size), null, 2))
  process.exit(0)
}

if (cmd === 'put') {
  const items = JSON.parse(readFileSync(arg1, 'utf8'))
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        if (!existsSync(item.file)) throw new Error(`Missing file: ${item.file}`)
        const bytes = readFileSync(item.file)
        const res = await fetch(item.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/png' },
          body: bytes,
        })
        if (!res.ok) throw new Error(`PUT ${res.status}: ${await res.text()}`)
        return { title: item.title, ok: true, token: item.token }
      } catch (e) {
        return { title: item.title, ok: false, error: String(e.message || e) }
      }
    }),
  )
  const failed = results.filter((r) => !r.ok)
  console.log(JSON.stringify({ ok: results.filter((r) => r.ok).length, failed, tokens: results.filter((r) => r.ok).map((r) => ({ title: r.title, token: r.token })) }))
  process.exit(failed.length ? 1 : 0)
}

console.error('Usage: jobs [start] [size] | put <tokens.json>')
process.exit(1)
