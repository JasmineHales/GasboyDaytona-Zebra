#!/usr/bin/env node
/**
 * Convert Mermaid flowchart TD to Miro diagram_create DSL.
 * Usage: node scripts/mermaid-to-miro-dsl.mjs path/to/file.mmd
 */
import { readFileSync } from 'fs'

const src = readFileSync(process.argv[2], 'utf8')
const lines = src.split('\n').map((l) => l.trim()).filter(Boolean)

const idMap = new Map()
let n = 1
const nodeDefs = new Map()
const edges = []
const clusters = []
let currentCluster = null
let clusterIdx = 1

function miroId(raw) {
  if (!idMap.has(raw)) idMap.set(raw, `n${n++}`)
  return idMap.get(raw)
}

function parseLabel(inner) {
  return inner.replace(/\s+/g, ' ').trim()
}

function registerNode(raw, label, shape) {
  const id = miroId(raw)
  if (!nodeDefs.has(raw)) {
    const isDecision = shape === '{' || shape === 'diamond'
    let type = isDecision ? 'flowchart-decision' : 'flowchart-process'
    if (!isDecision && (/complete|finished|home|finish workflow|finish workflow/i.test(label) && !/disabled|blocked|incomplete|warning/i.test(label))) {
      type = 'flowchart-terminator'
    } else if (!isDecision && /^(start|home|tap footer)/i.test(label)) {
      type = 'flowchart-terminator'
    }
    const color = type === 'flowchart-decision' ? 1 : type === 'flowchart-terminator' ? 2 : 0
    nodeDefs.set(raw, { id, label: parseLabel(label), type, color })
    if (currentCluster) currentCluster.nodes.push(id)
  }
  return id
}

function parseNodeToken(token) {
  const sq = token.match(/^(\w+)\[(.+)\]$/)
  if (sq) return registerNode(sq[1], sq[2], '[')
  const di = token.match(/^(\w+)\{(.+)\}$/)
  if (di) return registerNode(di[1], di[2], '{')
  return registerNode(token, token, 'plain')
}

for (const line of lines) {
  if (line.startsWith('flowchart')) continue

  const subStart = line.match(/^subgraph\s+(\w+)(?:\[(.+)\])?$/)
  if (subStart) {
    const label = subStart[2] ? parseLabel(subStart[2]) : subStart[1]
    currentCluster = { id: `c${clusterIdx++}`, label, nodes: [] }
    continue
  }
  if (line === 'end') {
    if (currentCluster?.nodes.length) clusters.push(currentCluster)
    currentCluster = null
    continue
  }

  const edge = line.match(/^(.+?)\s*-->\s*(?:\|([^|]+)\|)?\s*(.+)$/)
  if (edge) {
    const fromId = parseNodeToken(edge[1].trim())
    const toId = parseNodeToken(edge[3].trim())
    const label = edge[2] ? parseLabel(edge[2]) : '-'
    edges.push({ from: fromId, to: toId, label })
    continue
  }

  const square = line.match(/^(\w+)\[(.+)\]$/)
  if (square) {
    registerNode(square[1], square[2], '[')
    continue
  }
  const diamond = line.match(/^(\w+)\{(.+)\}$/)
  if (diamond) registerNode(diamond[1], diamond[2], '{')
}

const out = ['graphdir TB', 'palette #fff6b6 #c6dcff #adf0c7', '']
for (const node of nodeDefs.values()) {
  out.push(`${node.id} ${node.label} ${node.type} ${node.color}`)
}
out.push('')
for (const edge of edges) {
  out.push(`c ${edge.from} ${edge.label} ${edge.to}`)
}
if (clusters.length) {
  out.push('')
  for (const cl of clusters) {
    out.push(`cluster ${cl.id} "${cl.label}" ${cl.nodes.join(' ')}`)
  }
}

process.stdout.write(out.join('\n'))
