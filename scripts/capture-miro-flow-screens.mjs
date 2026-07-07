import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../.flow-captures/miro-flow')
mkdirSync(OUT, { recursive: true })

const BASE = process.env.CAPTURE_BASE ?? 'https://127.0.0.1:5174/'

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
})
const page = await context.newPage()

async function seedSession() {
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
      JSON.stringify({
        name: 'Jordan Lee',
        email: 'jordan.lee@hertz.com',
        site: 'Daytona',
      }),
    )
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
}

async function dismissTutorial() {
  const scrim = page.locator('.tutorial-overlay__scrim')
  if (await scrim.count()) {
    await scrim.first().click({ force: true })
    await page.waitForTimeout(400)
  }
}

async function shot(name, action) {
  try {
    if (action) await action()
    await dismissTutorial()
    await page.waitForTimeout(700)
    const file = path.join(OUT, `${name}.png`)
    await page.screenshot({ path: file, fullPage: false })
    return { name, file, ok: true }
  } catch (error) {
    return { name, ok: false, error: String(error) }
  }
}

async function searchVehicles(query = 'jeep') {
  await page.locator('#vehicle-search-query').fill(query)
  await page.waitForTimeout(600)
}

async function selectFirstVehicle() {
  const radio = page.locator('[data-track^="vehicle-search.select-radio"]').first()
  if (await radio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await radio.click()
    await page.waitForTimeout(400)
  }
}

async function continueFromVehicleSearch() {
  await selectFirstVehicle()
  await page.locator('[data-track="vehicle-search.continue"]').click()
  await page.waitForTimeout(800)
}

async function goHome() {
  await page.evaluate(() => {
    sessionStorage.removeItem('remote-off.workflow.v3')
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await dismissTutorial()
  await page.getByRole('button', { name: 'Work', exact: true }).click()
  await page.waitForTimeout(400)
}

async function openWorkflow(workflowTrack) {
  await goHome()
  await page.locator(`[data-track="${workflowTrack}"]`).click()
  await page.waitForTimeout(600)
  await searchVehicles()
  await continueFromVehicleSearch()
}

async function seedFuelConnectionLost() {
  await page.evaluate(() => {
    sessionStorage.setItem(
      'remote-off.workflow.v3',
      JSON.stringify({
        activeView: 'fuel',
        acknowledgedSections: ['vehicle'],
        context: {
          screen: 'fueling-connection-lost',
          movementComplete: true,
          movementMode: 'transport',
          movementPhase: 'location-selected',
          location: 'Albany AP QTA',
          stallNumber: '',
          stallPhase: 'select-stall',
          stallSectionNumber: '',
          fuelComplete: false,
          stallComplete: false,
          cleaningComplete: false,
          cleaningStep: 'verify-pump',
          cleaningPumpNumber: '',
          cleaningStartedAt: null,
          cleaningFinalTime: '',
          fuelStep: 'connection-lost',
          pumpNumber: '12',
          fuelGallons: '',
          fuelGallonsDispensed: '5',
          fuelFinalTime: '',
          fuelStartedAt: null,
          isAdditionalFueling: false,
          fuelTransactions: [],
          unavailablePumps: [3, 6],
          showIssueOverlay: false,
          issueDetails: '',
          issueReportSource: null,
          unlockMode: 'remote',
          locationType: 'gasboy',
          odometerReading: '',
          mileageState: {
            telematicsMiles: 28432,
            telematicsStale: false,
            telematicsVinConfident: true,
            gasboyMiles: 28432,
            gasboyDelayed: false,
            mileageSource: 'gasboy',
            lookupStatus: 'resolved',
            sourcesMismatch: false,
          },
        },
      }),
    )
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await dismissTutorial()
}

await seedSession()

const results = []
results.push(await shot('01-home-work'))
results.push(
  await shot('02-vehicle-search', async () => {
    await page.locator('[data-track="home.workflow.transport"]').click()
    await page.waitForTimeout(800)
    await searchVehicles()
  }),
)
results.push(
  await shot('03-transport-default', async () => {
    await continueFromVehicleSearch()
  }),
)
results.push(
  await shot('04-transport-movement', async () => {
    await page.locator('[data-tutorial="movement"]').click({ timeout: 3000 }).catch(() => undefined)
    await page.waitForTimeout(500)
  }),
)
results.push(
  await shot('05-transport-fuel', async () => {
    await page.locator('[data-tutorial="fuel"]').click({ timeout: 3000 }).catch(() => undefined)
    await page.waitForTimeout(500)
  }),
)
results.push(
  await shot('06-vsa-default', async () => {
    await openWorkflow('home.workflow.vsa')
  }),
)
results.push(
  await shot('07-vsa-cleaning', async () => {
    await page.locator('[data-tutorial="cleaning"]').click({ timeout: 3000 }).catch(() => undefined)
    await page.waitForTimeout(500)
  }),
)
results.push(
  await shot('08-vsa-fuel', async () => {
    await page.locator('[data-tutorial="fuel"]').click({ timeout: 3000 }).catch(() => undefined)
    await page.waitForTimeout(500)
  }),
)
results.push(
  await shot('09-vsa-stall', async () => {
    await page.locator('[data-tutorial="stall"]').click({ timeout: 3000 }).catch(() => undefined)
    await page.waitForTimeout(500)
  }),
)
results.push(
  await shot('10-fuel-only', async () => {
    await openWorkflow('home.workflow.fuel')
  }),
)
results.push(
  await shot('11-fuel-unlock-error', async () => {
    await seedFuelConnectionLost()
  }),
)
results.push(
  await shot('12-settings', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await dismissTutorial()
    await page.locator('[data-track="header.menu.toggle"]').click()
    await page.waitForTimeout(400)
    await page.locator('[data-track="header.menu.language-settings"]').click()
    await page.waitForTimeout(600)
  }),
)

await browser.close()
console.log(JSON.stringify({ outDir: OUT, results }, null, 2))
