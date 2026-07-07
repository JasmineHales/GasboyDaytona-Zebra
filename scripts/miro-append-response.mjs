#!/usr/bin/env node
/**
 * Append MCP image_get_upload_url response to batch responses file.
 * Usage: node scripts/miro-append-response.mjs batch-03 slug upload_url token
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const [batchId, slug, uploadUrl, token] = process.argv.slice(2)
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.flow-captures/miro-flow-full/upload-batches', `${batchId}-responses.json`)
const arr = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
const idx = arr.findIndex((r) => r.slug === slug)
const entry = { slug, upload_url: uploadUrl, token }
if (idx >= 0) arr[idx] = entry
else arr.push(entry)
writeFileSync(file, JSON.stringify(arr, null, 2))
console.log(JSON.stringify({ batchId, slug, total: arr.length }))
