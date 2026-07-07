#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const batchesDir = path.join(root, '.flow-captures/miro-flow-full/upload-batches')
const batchId = process.argv[2]
const tokens = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}-tokens.json`), 'utf8'))
const urls = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}-urls.json`), 'utf8'))
const data = Object.entries(tokens).map(([slug, token]) => ({ slug, upload_url: urls[slug], token }))
writeFileSync(path.join(batchesDir, `${batchId}-responses.json`), JSON.stringify(data, null, 2))
const put = spawnSync('node', ['scripts/miro-batch-upload-runner.mjs', batchId], { cwd: root, encoding: 'utf8' })
console.log(put.stdout || put.stderr)
