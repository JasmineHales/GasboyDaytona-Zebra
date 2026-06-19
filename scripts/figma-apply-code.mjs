#!/usr/bin/env node
/** Print use_figma code that applies captured imageHash values to Screen frames. */
import { readFileSync } from 'node:fs'

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: node figma-apply-code.mjs <hashes.json>')
  process.exit(1)
}

const items = JSON.parse(readFileSync(inputPath, 'utf8'))
  .filter((entry) => entry.imageHash)
  .map((entry) => ({ nodeId: entry.nodeId, imageHash: entry.imageHash }))

const code = `const items = ${JSON.stringify(items)};
const mutatedNodeIds = [];
const errors = [];
for (const item of items) {
  const node = await figma.getNodeByIdAsync(item.nodeId);
  if (!node || !('fills' in node)) {
    errors.push({ nodeId: item.nodeId, error: 'no fills' });
    continue;
  }
  node.fills = [{
    type: 'IMAGE',
    scaleMode: 'FILL',
    imageHash: item.imageHash,
    imageTransform: [[1, 0, 0], [0, 1, 0]],
  }];
  mutatedNodeIds.push(item.nodeId);
}
return { applied: mutatedNodeIds.length, mutatedNodeIds, errors };`

console.log(code)
