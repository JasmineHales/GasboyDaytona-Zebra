#!/usr/bin/env node
/**
 * Fully automated Miro image sync for captured flow states.
 * Iterates all batch jobs: obtains upload URL via inline MCP HTTP bridge is not available,
 * so this script performs PUT + records pending image_create tokens.
 *
 * Pass --urls-from=<dir> where each batch-XX-urls.json contains MCP upload responses.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAPTURE_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full')
const batchesDir = path.join(CAPTURE_DIR, 'upload-batches')
const urlsFrom = process.argv.find((a) => a.startsWith('--urls-from='))?.split('=')[1] ?? batchesDir

const uploaded = []
const failed = []
const created = []

async function put(item) {
  const body = readFileSync(item.file)
  const res = await fetch(item.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body,
  })
  if (!res.ok) throw new Error(`PUT ${res.status}`)
}

async function main() {
  const urlFiles = readdirSync(urlsFrom)
    .filter((f) => f.endsWith('-urls.json'))
    .sort()

  if (!urlFiles.length) {
    console.error(`No *-urls.json in ${urlsFrom}`)
    process.exit(1)
  }

  for (const file of urlFiles) {
    const items = JSON.parse(readFileSync(path.join(urlsFrom, file), 'utf8'))
    for (const item of items) {
      try {
        await put(item)
        uploaded.push(item)
      } catch (error) {
        failed.push({ slug: item.slug, error: String(error) })
      }
    }
  }

  writeFileSync(
    path.join(CAPTURE_DIR, 'miro-upload-status.json'),
    JSON.stringify(
      {
        putOk: uploaded.length,
        putFailed: failed.length,
        uploaded: uploaded.map((u) => ({ slug: u.slug, token: u.token, frameUrl: u.frameUrl })),
        failed,
      },
      null,
      2,
    ),
  )

  console.log(JSON.stringify({ putOk: uploaded.length, putFailed: failed.length }))
}

main()
