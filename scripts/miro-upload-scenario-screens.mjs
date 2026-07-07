#!/usr/bin/env node
/**
 * Flatten scenario screen manifest for Miro MCP upload (get URL → PUT → create).
 *
 *   node scripts/miro-upload-scenario-screens.mjs list
 *   node scripts/miro-upload-scenario-screens.mjs put <upload_url> <local_path>
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const manifest = JSON.parse(
  readFileSync(path.join(__dirname, 'miro-scenario-screens.json'), 'utf8'),
)

function flattenJobs() {
  const jobs = []
  for (const scenario of manifest.scenarios) {
    scenario.screens.forEach((screen, index) => {
      const file = path.join(ROOT, manifest.captureDir, screen.file)
      jobs.push({
        scenarioId: scenario.id,
        title: `${scenario.id.toUpperCase()} · ${screen.title}`,
        file,
        x: scenario.originX + index * manifest.rowGap,
        y: scenario.originY,
        width: manifest.imageWidth,
        board: manifest.board,
      })
    })
  }
  return jobs
}

const cmd = process.argv[2]

if (cmd === 'list') {
  const jobs = flattenJobs()
  console.log(JSON.stringify({ board: manifest.board, count: jobs.length, jobs }, null, 2))
  process.exit(0)
}

if (cmd === 'put') {
  const uploadUrl = process.argv[3]
  const localPath = process.argv[4]
  if (!uploadUrl || !localPath) {
    console.error('Usage: node scripts/miro-upload-scenario-screens.mjs put <upload_url> <local_path>')
    process.exit(1)
  }
  if (!existsSync(localPath)) {
    console.error(`Missing file: ${localPath}`)
    process.exit(1)
  }
  const bytes = readFileSync(localPath)
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: bytes,
  })
  if (!res.ok) {
    console.error(`PUT failed: ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  console.log('ok')
  process.exit(0)
}

console.error('Usage: list | put <upload_url> <local_path>')
process.exit(1)
