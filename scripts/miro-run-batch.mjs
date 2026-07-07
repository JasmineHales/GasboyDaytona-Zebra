#!/usr/bin/env node
/** Run PUT for a batch defined in .flow-captures/miro-batch-N.json */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const batchNum = process.argv[2]
if (!batchNum) {
  console.error('Usage: node miro-run-batch.mjs <batch-number>')
  process.exit(1)
}
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(__dirname, '..', '.flow-captures', `miro-batch-${batchNum}.json`)
const items = JSON.parse(readFileSync(file, 'utf8'))
const results = await Promise.all(
  items.map(async ({ upload_url, file: localPath, title }) => {
    const res = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: readFileSync(localPath),
    })
    if (!res.ok) return { title, ok: false, error: `${res.status}` }
    return { title, ok: true, token: items.find((i) => i.title === title)?.token }
  }),
)
const failed = results.filter((r) => !r.ok)
if (failed.length) {
  console.error(JSON.stringify({ failed }, null, 2))
  process.exit(1)
}
console.log(JSON.stringify({ ok: true, tokens: items.map((i) => ({ title: i.title, token: i.token })) }))
