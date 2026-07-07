#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const batchesDir = path.join(root, '.flow-captures/miro-flow-full/upload-batches')
// Tokens from MCP image_get_upload_url; upload_url read from batch-06-urls.json (written by agent)
const tokens = {
  'on-site-on-site-missing-filled': '8e03f47762b0c73ed8f5366f108c653e45f7376aa6a3005f9034597fec8125da',
  'non-gasboy-non-gasboy-default': 'd626abee893451ea1446dcc8d7f3ad868e80bdc789fb5d5dcb25facfc6a66933',
  'non-gasboy-non-gasboy-manual-entry': '3fdff1684497d1a90634dd983f8ff8541ab9ac87c0843441b28264ad5485288d',
  'non-gasboy-non-gasboy-pump-verified': '9052325d4ffdec26b1dc8289595830163e34e6698d604d24ae20f35c6d811ea6',
  'non-gasboy-non-gasboy-fueling-in-progress': '0e29529739ef4f44e7387e29058cc9dc6af5835f20d1341320c637fe99587e1d',
  'non-gasboy-non-gasboy-fueling-complete': 'f50f7693fcafe99cb17762b7834a9c6cd74f0059151e3348963acb31f793db91',
  'non-gasboy-non-gasboy-missing-info': 'b9ad2f00b6c3864cfc873c5810ba88f03096654d63a41d6ed5d5451366769782',
  'non-gasboy-non-gasboy-missing-filled': '9eed4fe58594f1f3262e7b5c0e3d71c2cfb86c94cbb5e62b23588e4e0eeeba35',
  'vsa-default': 'eb0e955f7c7af795c3ace0a43e646acdde59e98e9b5ef8899b0a8057df6606b5',
  'vsa-complete': '1dacc7276d933054625b7031658ca01ff1d36411e6c15ece4b7dffdfc1904963',
}
const urls = JSON.parse(readFileSync(path.join(batchesDir, 'batch-06-urls.json'), 'utf8'))
const data = Object.entries(tokens).map(([slug, token]) => ({ slug, upload_url: urls[slug], token }))
writeFileSync(path.join(batchesDir, 'batch-06-responses.json'), JSON.stringify(data, null, 2))
const put = spawnSync('node', ['scripts/miro-batch-upload-runner.mjs', 'batch-06'], { cwd: root, encoding: 'utf8' })
console.log(put.stdout || put.stderr)
