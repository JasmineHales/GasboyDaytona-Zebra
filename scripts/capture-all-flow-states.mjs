import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../.flow-captures/miro-flow-full')
mkdirSync(OUT, { recursive: true })

const BASE = process.env.CAPTURE_BASE ?? 'https://127.0.0.1:5174/'

function resolveActiveView(screenId) {
  if (
    screenId.startsWith('cleaning-') ||
    screenId.startsWith('stall-') ||
    screenId === 'vsa-complete' ||
    screenId === 'vsa-issue-header' ||
    screenId === 'vsa-no-stall-default'
  ) {
    return 'vsa'
  }
  if (
    screenId.startsWith('fueling-') ||
    screenId.startsWith('on-site-') ||
    screenId.startsWith('non-gasboy-')
  ) {
    return 'fuel'
  }
  return 'transport'
}

function resolveExpandedSection(screenId) {
  if (screenId.startsWith('cleaning-')) return 'cleaning'
  if (screenId.startsWith('stall-') || screenId.startsWith('movement-stall')) return 'stall'
  if (screenId.startsWith('movement-')) return 'movement'
  if (
    screenId.startsWith('fueling-') ||
    screenId.startsWith('on-site-') ||
    screenId.startsWith('non-gasboy-')
  ) {
    return 'fuel'
  }
  if (screenId.startsWith('transport-mileage-')) return 'movement'
  return 'movement'
}

function slugify(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
}

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
})
const page = await context.newPage()

async function seedBaseSession() {
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
}

async function dismissTutorial() {
  const scrim = page.locator('.tutorial-overlay__scrim')
  if (await scrim.count()) {
    await scrim.first().click({ force: true })
    await page.waitForTimeout(300)
  }
}

async function applyCaptureSeed(seed) {
  await page.evaluate((payload) => {
    sessionStorage.removeItem('remote-off.capture.v1')
    sessionStorage.removeItem('remote-off.capture.ui')
    if (payload.workflow) {
      sessionStorage.setItem('remote-off.workflow.v3', JSON.stringify(payload.workflow))
    } else {
      sessionStorage.removeItem('remote-off.workflow.v3')
    }
    if (payload.capture) {
      sessionStorage.setItem('remote-off.capture.v1', JSON.stringify(payload.capture))
    }
    if (payload.ui) {
      sessionStorage.setItem('remote-off.capture.ui', JSON.stringify(payload.ui))
    }
  }, seed)
  await page.reload({ waitUntil: 'networkidle' })
  await dismissTutorial()
  await page.waitForTimeout(700)
}

async function shot(name, setup) {
  try {
    await setup()
    await dismissTutorial()
    await page.waitForTimeout(600)
    const file = path.join(OUT, `${name}.png`)
    await page.screenshot({ path: file, fullPage: false })
    return { name, file, ok: true }
  } catch (error) {
    return { name, ok: false, error: String(error) }
  }
}

await seedBaseSession()
await page.reload({ waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__REMOTE_OFF_CAPTURE__, undefined, { timeout: 30_000 })

const widgetTargets = await page.evaluate(() => {
  const cap = window.__REMOTE_OFF_CAPTURE__
  const targets = []

  for (const group of cap.WIDGET_STATE_GROUPS) {
    for (const item of group.items) {
      const slug = item.key.replace(/:/g, '-')
      if (item.patch) {
        const baseScreen =
          item.scopes.includes('vsa') && !item.scopes.includes('transport')
            ? 'stall-default'
            : item.scopes.includes('fuel') && item.scopes.length === 1
              ? 'fueling-default'
              : 'transport-default'
        const context = {
          ...cap.buildFlowContextForScreen(baseScreen),
          ...item.patch,
          screen: baseScreen,
        }
        targets.push({
          slug,
          label: item.label,
          group: group.label,
          workflow: {
            activeView: item.scopes[0] ?? 'transport',
            acknowledgedSections: ['vehicle'],
            context,
          },
          ui: { expandedSection: 'movement' },
        })
      } else {
        const screen = item.screen
        const activeView =
          item.scopes.includes('vsa') &&
          !screen.startsWith('fueling-') &&
          !screen.startsWith('on-site-') &&
          !screen.startsWith('non-gasboy-') &&
          (screen.startsWith('cleaning-') ||
            screen.startsWith('stall-') ||
            screen === 'vsa-complete' ||
            screen === 'vsa-issue-header')
            ? 'vsa'
            : item.scopes.includes('fuel') &&
                (screen.startsWith('fueling-') ||
                  screen.startsWith('on-site-') ||
                  screen.startsWith('non-gasboy-'))
              ? 'fuel'
              : item.scopes.includes('transport')
                ? 'transport'
                : (item.scopes[0] ?? 'transport')

        const context = cap.buildFlowContextForScreen(screen)
        const ui = {}
        if (screen.startsWith('cleaning-')) ui.expandedSection = 'cleaning'
        else if (screen.startsWith('stall-') || screen.startsWith('movement-stall')) {
          ui.expandedSection = activeView === 'vsa' ? 'stall' : 'movement'
        } else if (screen.startsWith('movement-')) ui.expandedSection = 'movement'
        else if (
          screen.startsWith('fueling-') ||
          screen.startsWith('on-site-') ||
          screen.startsWith('non-gasboy-')
        ) {
          ui.expandedSection = 'fuel'
        } else if (screen.startsWith('transport-mileage-')) {
          ui.expandedSection = 'movement'
        } else if (activeView === 'transport') {
          ui.expandedSection = 'movement'
        }

        if (screen === 'fueling-scanner') {
          ui.showScanner = true
          ui.scannerTarget = 'fuel'
        }

        targets.push({
          slug,
          label: item.label,
          group: group.label,
          workflow: {
            activeView,
            acknowledgedSections: ['vehicle'],
            context,
          },
          ui,
        })
      }
    }
  }

  for (const id of cap.MILEAGE_SCENARIO_IDS) {
    if (targets.some((t) => t.slug === id)) continue
    targets.push({
      slug: id,
      label: id.replace('transport-mileage-', '').replace(/-/g, ' '),
      group: 'Mileage scenarios',
      workflow: {
        activeView: 'transport',
        acknowledgedSections: ['vehicle'],
        context: cap.buildFlowContextForScreen(id),
      },
      ui: { expandedSection: 'movement' },
    })
  }

  for (const group of cap.VEHICLE_SEARCH_DEV_GROUPS) {
    for (const item of group.items) {
      targets.push({
        slug: item.key.replace(/:/g, '-'),
        label: item.label,
        group: group.label,
        capture: {
          page: 'home',
          vehicleSearch: {
            workflow: 'transport',
            devState: item.key,
          },
        },
      })
    }
  }

  return targets
})

const entryTargets = [
  {
    slug: 'login',
    label: 'Login',
    group: 'Entry & Home',
    capture: { page: 'login' },
  },
  {
    slug: 'setup',
    label: 'Initial setup',
    group: 'Entry & Home',
    capture: { page: 'setup' },
  },
  {
    slug: 'home-work',
    label: 'Home · Work',
    group: 'Entry & Home',
    capture: { page: 'home', homeTab: 'work' },
    clickHomeTab: 'Work',
  },
  {
    slug: 'home-history',
    label: 'Home · History',
    group: 'Entry & Home',
    capture: { page: 'home' },
    clickHomeTab: 'History',
  },
  {
    slug: 'home-performance',
    label: 'Home · Performance',
    group: 'Entry & Home',
    capture: { page: 'home' },
    clickHomeTab: 'Performance',
  },
  {
    slug: 'home-challenges',
    label: 'Home · Challenges',
    group: 'Entry & Home',
    capture: { page: 'home' },
    clickHomeTab: 'Challenges',
  },
  {
    slug: 'home-recognition',
    label: 'Home · Recognition',
    group: 'Entry & Home',
    capture: { page: 'home' },
    clickHomeTab: 'Recognition',
  },
  {
    slug: 'home-team',
    label: 'Home · Team',
    group: 'Entry & Home',
    capture: { page: 'home' },
    clickHomeTab: 'Team',
  },
  {
    slug: 'tracking',
    label: 'Tracking',
    group: 'Entry & Home',
    capture: { page: 'tracking' },
  },
]

const allTargets = [...entryTargets, ...widgetTargets]
const results = []

for (const target of allTargets) {
  results.push(
    await shot(target.slug, async () => {
      if (target.workflow) {
        await applyCaptureSeed({
          workflow: target.workflow,
          capture: { page: 'workflow', activeView: target.workflow.activeView },
          ui: target.ui ?? {},
        })
      } else if (target.capture) {
        await applyCaptureSeed({
          capture: target.capture,
          workflow: null,
        })
        if (target.clickHomeTab) {
          const tab = target.clickHomeTab
          const button =
            tab === 'Challenges' || tab === 'Recognition'
              ? page.getByRole('tab', { name: tab, exact: true })
              : page.getByRole('button', { name: tab, exact: true })
          await button.click({ timeout: 5000 }).catch(() => undefined)
          await page.waitForTimeout(500)
        }
      }
    }),
  )
}

await browser.close()

const ok = results.filter((r) => r.ok)
const failed = results.filter((r) => !r.ok)
const manifest = {
  outDir: OUT,
  expected: allTargets.length,
  captured: ok.length,
  failed: failed.length,
  groups: Object.fromEntries(
    allTargets.reduce((map, target) => {
      const list = map.get(target.group) ?? []
      list.push({ slug: target.slug, label: target.label })
      map.set(target.group, list)
      return map
    }, new Map()),
  ),
  results,
}

writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(
  JSON.stringify(
    {
      outDir: OUT,
      expected: allTargets.length,
      captured: ok.length,
      failed: failed.length,
      failures: failed,
    },
    null,
    2,
  ),
)
