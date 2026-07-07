#!/usr/bin/env node
/** Parallel PUT for Miro upload batch. stdin: [{upload_url, file, title?}] */
import { readFileSync, existsSync } from 'fs'

const items = JSON.parse(readFileSync(0, 'utf8'))
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
      return { title: item.title, ok: true }
    } catch (e) {
      return { title: item.title, ok: false, error: String(e.message || e) }
    }
  }),
)
const failed = results.filter((r) => !r.ok)
if (failed.length) {
  console.error(JSON.stringify({ failed }, null, 2))
  process.exit(1)
}
console.log(JSON.stringify({ ok: results.length }))
