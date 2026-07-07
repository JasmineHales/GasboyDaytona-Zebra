#!/usr/bin/env node
/**
 * One-shot upload: read JSON [{slug,file,frameUrl,upload_url,token}] from stdin;
 * PUT each PNG and print ready-create entries.
 */
import { readFileSync } from 'fs'

const items = JSON.parse(readFileSync(0, 'utf8'))
const ready = []
const failed = []
for (const item of items) {
  try {
    const res = await fetch(item.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(item.file),
    })
    if (!res.ok) throw new Error(`PUT ${res.status}`)
    ready.push({ slug: item.slug, frameUrl: item.frameUrl, token: item.token, title: item.title })
  } catch (e) {
    failed.push({ slug: item.slug, error: String(e) })
  }
}
console.log(JSON.stringify({ ready, failed }, null, 2))
