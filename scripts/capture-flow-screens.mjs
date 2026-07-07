import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../.flow-captures')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()

await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' })
await page.evaluate(() => {
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
  for (const key of [
    'remote-off.tutorial.home.v3',
    'remote-off.tutorial.transport.v1',
    'remote-off.tutorial.vsa.v1',
    'remote-off.tutorial.tracking.v1',
  ]) {
    localStorage.setItem(key, 'done')
  }
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

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

const results = []
results.push(await shot('home-work'))
results.push(
  await shot('home-history', async () => {
    await page.getByRole('button', { name: 'History', exact: true }).click()
  }),
)
results.push(
  await shot('home-performance', async () => {
    await page.getByRole('button', { name: 'Performance', exact: true }).click()
  }),
)
results.push(
  await shot('home-challenges', async () => {
    await page.getByRole('tab', { name: 'Challenges' }).click()
  }),
)
results.push(
  await shot('home-recognition', async () => {
    await page.getByRole('tab', { name: 'Recognition' }).click()
  }),
)
results.push(
  await shot('home-team', async () => {
    await page.getByRole('button', { name: 'Team', exact: true }).click()
  }),
)
results.push(
  await shot('transport', async () => {
    await page.getByRole('button', { name: 'Work', exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('[data-tutorial="workflow-transport"]').click()
  }),
)
results.push(
  await shot('vsa', async () => {
    await page.goBack({ waitUntil: 'networkidle' }).catch(() => undefined)
    await page.getByRole('button', { name: 'Work', exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('[data-tutorial="workflow-vsa"]').click()
  }),
)
results.push(
  await shot('fuel-workflow', async () => {
    await page.goBack({ waitUntil: 'networkidle' }).catch(() => undefined)
    await page.getByRole('button', { name: 'Work', exact: true }).click()
    await page.waitForTimeout(400)
    await page.locator('[data-tutorial="workflow-fuel"]').click()
  }),
)

await browser.close()
console.log(JSON.stringify({ outDir: OUT, results }, null, 2))
