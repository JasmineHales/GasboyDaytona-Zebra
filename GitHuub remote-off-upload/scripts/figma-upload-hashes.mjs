#!/usr/bin/env node
/** POST PNGs to Figma submit URLs and capture imageHash values for apply step. */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const exportsDir = join(root, 'figma-exports')

const { figmaCaptureFilename } = await import(join(root, 'src/utils/figmaCapture.ts'))

const inputPath = process.argv[2]
const outputPath = process.argv[3] ?? join(exportsDir, 'upload-hashes.json')

if (!inputPath) {
  console.error('Usage: node figma-upload-hashes.mjs <upload.json> [output.json]')
  process.exit(1)
}

const items = JSON.parse(readFileSync(inputPath, 'utf8'))

const results = await Promise.all(
  items.map(async (item) => {
    const pngPath = join(exportsDir, `${figmaCaptureFilename(item.key)}.png`)
    if (!existsSync(pngPath)) {
      return { key: item.key, nodeId: item.nodeId, ok: false, error: 'png missing' }
    }
    if (!item.submitUrl) {
      return { key: item.key, nodeId: item.nodeId, ok: false, error: 'submitUrl missing' }
    }

    const form = new FormData()
    const blob = new Blob([readFileSync(pngPath)], { type: 'image/png' })
    form.append('file', blob, `${figmaCaptureFilename(item.key)}.png`)

    const response = await fetch(item.submitUrl, { method: 'POST', body: form })
    let body = null
    try {
      body = await response.json()
    } catch {
      body = await response.text()
    }

    return {
      key: item.key,
      nodeId: item.nodeId,
      ok: response.ok && body?.success,
      status: response.status,
      imageHash: body?.imageHash ?? null,
    }
  }),
)

const succeeded = results.filter((result) => result.ok)
const failed = results.filter((result) => !result.ok)

writeFileSync(outputPath, JSON.stringify(succeeded, null, 2))
console.log(JSON.stringify({ uploaded: succeeded.length, failed: failed.length, outputPath }, null, 2))
process.exit(failed.length > 0 ? 1 : 0)
