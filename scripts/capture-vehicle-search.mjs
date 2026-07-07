#!/usr/bin/env node
/** Re-capture vehicle search states after removing advanced filters. */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../.flow-captures/miro-flow-full')
mkdirSync(OUT, { recursive: true })
const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:5174/'

const STATES = [
  'vehicle-search:idle',
  'vehicle-search:no-results',
  'vehicle-search:scan-error',
  'vehicle-search:selected',
  'vehicle-search:hold-confirm',
  'vehicle-search:manual-entry',
]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
})).newPage()

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.setItem('remote-off.initial-setup-complete', '1')
  localStorage.setItem('remote-off.operator-site', 'Daytona')
  for (const key of [
    'remote-off.tutorial.home.v3',
    'remote-off.tutorial.transport.v1',
    'remote-off.tutorial.vsa.v1',
    'remote-off.tutorial.tracking.v1',
  ]) {
    localStorage.setItem(key, 'done')
  }
  sessionStorage.setItem('remote-off.authenticated', '1')
  sessionStorage.setItem('remote-off.auth-method', 'browser-sso')
  sessionStorage.setItem(
    'remote-off.sso-user',
    JSON.stringify({ name: 'Jordan Lee', email: 'jordan.lee@hertz.com', site: 'Daytona' }),
  )
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__REMOTE_OFF_CAPTURE__, undefined, { timeout: 30_000 })

for (const devState of STATES) {
  const slug = devState.replace(/:/g, '-')
  const workflow = devState === 'vehicle-search:hold-confirm' ? 'vsa' : 'transport'
  await page.evaluate((state) => {
    sessionStorage.setItem(
      'remote-off.capture.v1',
      JSON.stringify({
        page: 'home',
        vehicleSearch: { workflow: state.workflow, devState: state.devState },
      }),
    )
    sessionStorage.removeItem('remote-off.capture.ui')
    sessionStorage.removeItem('remote-off.workflow.v3')
  }, { devState, workflow })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, `${slug}.png`) })
  console.log('captured', slug)
}

await browser.close()
