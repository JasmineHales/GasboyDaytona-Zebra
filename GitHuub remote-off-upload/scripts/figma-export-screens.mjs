#!/usr/bin/env node
/**
 * Export widget-state screens as 360×800 PNGs for Figma review boards.
 * Requires dev server on BASE_URL and `npx playwright install chromium`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const { buildFigmaCaptureManifest, buildFigmaCaptureUrl, figmaCaptureFilename } =
  await import(join(root, 'src/utils/figmaCapture.ts'))
const { TUTORIAL_STORAGE_KEYS } = await import(join(root, 'src/utils/tutorialSteps.ts'))

const BASE_URL = process.env.FIGMA_EXPORT_BASE_URL ?? 'http://127.0.0.1:5174'
const OUT_DIR = join(root, 'figma-exports')

mkdirSync(OUT_DIR, { recursive: true })

const targets = buildFigmaCaptureManifest().map((target) => ({
  ...target,
  url: buildFigmaCaptureUrl(target, BASE_URL),
}))

writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(targets, null, 2))

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error('Playwright is required. Run: npx playwright install chromium')
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
})

await page.addInitScript((keys) => {
  for (const key of keys) {
    localStorage.setItem(key, 'done')
  }
}, [...TUTORIAL_STORAGE_KEYS])

console.log(`Exporting ${targets.length} screens to ${OUT_DIR}…`)

for (const target of targets) {
  const outPath = join(OUT_DIR, `${figmaCaptureFilename(target.key)}.png`)

  try {
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page
      .locator('.tutorial-overlay')
      .waitFor({ state: 'detached', timeout: 3000 })
      .catch(() => {})
    await page.waitForTimeout(400)
    await page.locator('.app-shell').screenshot({ path: outPath })
    console.log(`✓ ${target.label}`)
  } catch (error) {
    console.error(`✗ ${target.label}:`, error instanceof Error ? error.message : error)
  }
}

await browser.close()
console.log(`Done. ${targets.length} screens → ${OUT_DIR}`)
