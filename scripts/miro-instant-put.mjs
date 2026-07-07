#!/usr/bin/env node
/** PUT one PNG and print image_create payload JSON. */
import { readFileSync } from 'fs'

const [file, frameUrl, uploadUrl, token, slug] = process.argv.slice(2)
const res = await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/png' },
  body: readFileSync(file),
})
if (!res.ok) {
  console.error(JSON.stringify({ slug, error: `PUT ${res.status}` }))
  process.exit(1)
}
console.log(JSON.stringify({ slug, frameUrl, token, ok: true }))
