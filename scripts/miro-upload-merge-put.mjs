#!/usr/bin/env node
/**
 * Merge job list slice with MCP get_upload_url responses, PUT files, emit create tokens.
 * Usage:
 *   node scripts/miro-upload-merge-put.mjs <start> <size> <mcp-responses.json>
 * mcp-responses.json: array of {upload_url, token} in same order as jobs slice
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(readFileSync(path.join(__dirname, 'miro-scenario-screens.json'), 'utf8'))

function flattenJobs() {
  const jobs = []
  for (const scenario of manifest.scenarios) {
    scenario.screens.forEach((screen, index) => {
      jobs.push({
        title: `${scenario.id.toUpperCase()} · ${screen.title}`,
        file: path.join(__dirname, '..', manifest.captureDir, screen.file),
      })
    })
  }
  return jobs
}

const [startStr, sizeStr, mcpFile] = process.argv.slice(2)
const start = Number(startStr)
const size = Number(sizeStr)
const jobs = flattenJobs().slice(start, start + size)
const mcp = JSON.parse(readFileSync(mcpFile, 'utf8'))

if (mcp.length !== jobs.length) {
  console.error(`Mismatch: ${jobs.length} jobs vs ${mcp.length} MCP responses`)
  process.exit(1)
}

const items = jobs.map((job, i) => ({
  title: job.title,
  file: job.file,
  upload_url: mcp[i].upload_url,
  token: mcp[i].token,
}))

const results = await Promise.all(
  items.map(async (item) => {
    try {
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

const outFile = mcpFile.replace(/\.json$/, '-create.json')
writeFileSync(outFile, JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(JSON.stringify({ ok: results.filter((r) => r.ok).length, failed, outFile }))
process.exit(failed.length ? 1 : 0)
