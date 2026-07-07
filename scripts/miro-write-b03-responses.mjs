#!/usr/bin/env node
/** Write batch-03-responses.json from captured MCP session (fresh URLs). */
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.flow-captures/miro-flow-full/upload-batches')
const entries = JSON.parse(process.env.B03_JSON || '[]')
writeFileSync(path.join(dir, 'batch-03-responses.json'), JSON.stringify(entries, null, 2))
console.log(JSON.stringify({ count: entries.length }))
