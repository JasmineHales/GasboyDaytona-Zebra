import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const phase = process.argv[2] ?? 'before'
const isSetup = phase === 'setup' || phase === 'setup-before' || phase === 'setup-after'
const OUT = path.join(__dirname, `../.flow-captures/a11y-${phase}`)
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()

async function authHome() {
  await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.setItem('remote-off.initial-setup-complete', '1')
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
  await page.waitForTimeout(800)
}

async function openSetupViaLogin() {
  await page.goto('http://127.0.0.1:5174/?device=true', { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.removeItem('remote-off.initial-setup-complete')
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
  const loginBtn = page.locator('[data-track="login.sso-sign-in"]')
  await loginBtn.waitFor({ state: 'visible', timeout: 15000 })
  await loginBtn.click()
  await page.waitForSelector('.initial-setup-screen', { timeout: 15000 })
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
    await page.waitForTimeout(600)
    const file = path.join(OUT, `${name}.png`)
    await page.screenshot({ path: file, fullPage: false })
    return { name, file, ok: true }
  } catch (error) {
    return { name, ok: false, error: String(error) }
  }
}

const results = []

if (isSetup) {
  await openSetupViaLogin()
  results.push(await shot('setup-landing'))
  results.push(
    await shot('setup-location-overlay', async () => {
      await page.locator('[data-track="setup.location.open"]').click()
    }),
  )
  results.push(
    await shot('setup-language-overlay', async () => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await page.locator('[data-track="setup.language.open"]').click()
    }),
  )
} else {
  await authHome()
  results.push(await shot('home-work'))
  results.push(
    await shot('header-site-overlay', async () => {
      await page.locator('[data-track="header.location.toggle"]').click()
    }),
  )
  results.push(
    await shot('settings-overlay', async () => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await page.locator('[data-track="header.menu.toggle"]').click()
      await page.locator('[data-track="header.menu.language-settings"]').click()
    }),
  )
  results.push(
    await shot('history-filters', async () => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await page.getByRole('button', { name: 'History', exact: true }).click()
      await page.waitForTimeout(400)
      await page.locator('[data-track="home.history.filters.open"]').click()
    }),
  )
  results.push(
    await shot('vehicle-search', async () => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await page.getByRole('button', { name: 'Work', exact: true }).click()
      await page.waitForTimeout(300)
      await page.locator('[data-tutorial="workflow-transport"]').click()
      await page.waitForTimeout(800)
    }),
  )
}

await browser.close()
console.log(JSON.stringify({ phase, outDir: OUT, results }, null, 2))
