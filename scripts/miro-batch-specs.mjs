#!/usr/bin/env node
/**
 * Generate MCP image_get_upload_url request specs for a batch.
 * Output used to build responses JSON after MCP calls.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchesDir = path.join(__dirname, '../.flow-captures/miro-flow-full/upload-batches')
const batchId = process.argv[2] || 'all'

if (batchId === 'all') {
  const specs = []
  for (const file of readdirSync(batchesDir).filter((f) => /^batch-\d+\.json$/.test(f)).sort()) {
    const jobs = JSON.parse(readFileSync(path.join(batchesDir, file), 'utf8'))
    for (const job of jobs) {
      if (job.slug === 'login') continue
      specs.push({
        batch: file.replace('.json', ''),
        slug: job.slug,
        file: job.file,
        frameUrl: job.frameUrl,
        title: job.title,
        x: job.x,
        y: job.y,
        width: job.width,
        mcp_args: {
          miro_url: job.frameUrl,
          content_type: 'image/png',
          title: job.title,
          x: job.x,
          y: job.y,
          width: job.width,
          is_repository: true,
        },
      })
    }
  }
  writeFileSync(path.join(batchesDir, 'all-mcp-specs.json'), JSON.stringify(specs, null, 2))
  console.log(JSON.stringify({ specs: specs.length }))
} else {
  const jobs = JSON.parse(readFileSync(path.join(batchesDir, `${batchId}.json`), 'utf8'))
  const specs = jobs.filter((j) => j.slug !== 'login').map((job) => ({
    slug: job.slug,
    mcp_args: {
      miro_url: job.frameUrl,
      content_type: 'image/png',
      title: job.title,
      x: job.x,
      y: job.y,
      width: job.width,
      is_repository: true,
    },
  }))
  writeFileSync(path.join(batchesDir, `${batchId}-specs.json`), JSON.stringify(specs, null, 2))
  console.log(JSON.stringify({ batchId, specs: specs.length }))
}
