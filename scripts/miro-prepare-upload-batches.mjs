#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CAPTURE_DIR = path.join(__dirname, '../.flow-captures/miro-flow-full')
const plan = JSON.parse(readFileSync(path.join(CAPTURE_DIR, 'miro-upload-plan.json'), 'utf8'))

const FRAME_WIDGET_IDS = {
  entry_home: '3458764676836710500',
  vehicle_search: '3458764676836710501',
  odometer_widget: '3458764676836710502',
  mileage_scenarios: '3458764676836710503',
  transport_session: '3458764676836710504',
  movement_transport_location: '3458764676836710505',
  movement_stall_assignment: '3458764676836710506',
  fuel_gasboy_unlock_with_device: '3458764676836710507',
  fuel_gasboy_unlock_at_pump: '3458764676836710508',
  fuel_non_gasboy: '3458764676836710509',
  vsa_session: '3458764676836710510',
  vsa_cleaning: '3458764676836710511',
  vsa_stall_assignment: '3458764676836710512',
}

const BOARD = plan.board
const BATCH_SIZE = 10
const batchesDir = path.join(CAPTURE_DIR, 'upload-batches')
mkdirSync(batchesDir, { recursive: true })

const jobs = plan.jobs.map((job) => {
  const widgetId = FRAME_WIDGET_IDS[job.frameId]
  return {
    ...job,
    frameUrl: `${BOARD}?moveToWidget=${widgetId}`,
    width: 180,
  }
})

const batches = []
for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
  batches.push(jobs.slice(i, i + BATCH_SIZE))
}

batches.forEach((batch, index) => {
  writeFileSync(path.join(batchesDir, `batch-${String(index).padStart(2, '0')}.json`), JSON.stringify(batch, null, 2))
})

writeFileSync(path.join(CAPTURE_DIR, 'frame-widget-ids.json'), JSON.stringify(FRAME_WIDGET_IDS, null, 2))
console.log(JSON.stringify({ jobs: jobs.length, batches: batches.length, batchesDir }))
