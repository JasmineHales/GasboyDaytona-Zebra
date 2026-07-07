#!/usr/bin/env node
/**
 * PUT PNGs and emit image_create payloads for a urls JSON file.
 * Usage: node scripts/miro-put-and-create.mjs <urls.json>
 */
import { readFileSync, writeFileSync } from 'fs'

const urlsPath = process.argv[2]
if (!urlsPath) {
  console.error('Usage: node scripts/miro-put-and-create.mjs <urls.json>')
  process.exit(1)
}

const items = JSON.parse(readFileSync(urlsPath, 'utf8'))
const putOk = []
const putFailed = []

for (const item of items) {
  try {
    const body = readFileSync(item.file)
    const res = await fetch(item.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    putOk.push(item)
  } catch (error) {
    putFailed.push({ slug: item.slug, error: String(error) })
  }
}

const createPayloads = putOk.map((item) => ({
  slug: item.slug,
  frameUrl: item.frameUrl,
  token: item.token,
}))

writeFileSync(urlsPath.replace('-urls.json', '-create.json'), JSON.stringify(createPayloads, null, 2))
console.log(JSON.stringify({ putOk: putOk.length, putFailed: putFailed.length, createFile: urlsPath.replace('-urls.json', '-create.json') }))
