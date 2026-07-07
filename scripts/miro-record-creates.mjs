#!/usr/bin/env node
/** Run image_create for all items in a -create.json file; prints results. */
import { readFileSync, writeFileSync } from 'fs'

const createPath = process.argv[2]
const resultsPath = process.argv[3]
if (!createPath) {
  console.error('Usage: node scripts/miro-record-creates.mjs <batch-create.json> [results.json]')
  process.exit(1)
}

const items = JSON.parse(readFileSync(createPath, 'utf8'))
const existing = resultsPath && require('fs').existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, 'utf8'))
  : { created: [], failed: [] }

console.log(JSON.stringify({ pending: items.length, alreadyCreated: existing.created.length }))
