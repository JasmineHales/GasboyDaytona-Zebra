import type { ScreenId, WorkflowSection } from '../types/flow'
import {
  PAGE_NAV_ITEMS,
  WIDGET_STATE_ITEMS,
  type AppView,
} from './flowNavigation'

export type FigmaCaptureTarget = {
  key: string
  label: string
  group: string
  view: AppView | 'login'
  screen: ScreenId | null
}

const FIGMA_PREVIEW_PARAMS = ['figmaPreview', 'figma-preview'] as const

export function isFigmaPreviewMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return FIGMA_PREVIEW_PARAMS.some((key) => params.has(key))
}

export type FigmaPreviewParams = {
  view: AppView | 'login'
  screen: ScreenId | null
  loginVariant: 'device' | 'browser'
  skipAuth: boolean
}

export function parseFigmaPreviewParams(): FigmaPreviewParams | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  if (!FIGMA_PREVIEW_PARAMS.some((key) => params.has(key))) return null

  const viewParam = params.get('view')
  const loginVariant =
    params.get('loginVariant') === 'browser' ? 'browser' : 'device'

  let view: AppView | 'login' = 'home'
  if (viewParam === 'login') view = 'login'
  else if (
    viewParam === 'home' ||
    viewParam === 'transport' ||
    viewParam === 'vsa' ||
    viewParam === 'tracking'
  ) {
    view = viewParam
  }

  const screen = params.get('screen') as ScreenId | null

  return {
    view,
    screen,
    loginVariant,
    skipAuth: params.get('auth') !== '1',
  }
}

export function buildFigmaCaptureUrl(
  target: FigmaCaptureTarget,
  baseUrl = 'http://127.0.0.1:5174',
): string {
  const params = new URLSearchParams()
  params.set('figmaPreview', '1')
  params.set('device', 'hertz')
  params.set('auth', '1')
  params.set('view', target.view)

  if (target.view === 'login') {
    params.delete('screen')
    const loginVariant = target.key.includes('browser') ? 'browser' : 'device'
    params.set('loginVariant', loginVariant)
  } else if (target.screen) {
    params.set('screen', target.screen)
  }

  if (target.key === 'page-home-browser') {
    params.delete('device')
    params.set('runtime', 'browser')
  }

  if (target.key === 'page-login-browser') {
    params.delete('device')
    params.set('runtime', 'browser')
    params.set('loginVariant', 'browser')
  }

  return `${baseUrl}/?${params.toString()}`
}

export function buildFigmaCaptureManifest(): FigmaCaptureTarget[] {
  const targets: FigmaCaptureTarget[] = []
  const seen = new Set<string>()

  const add = (target: FigmaCaptureTarget) => {
    const url = buildFigmaCaptureUrl(target)
    if (seen.has(url)) return
    seen.add(url)
    targets.push(target)
  }

  for (const page of PAGE_NAV_ITEMS) {
    if (page.view === 'login') {
      add({
        key: page.key,
        label: page.label,
        group: 'Pages',
        view: 'login',
        screen: null,
      })
      continue
    }

    if (page.view === 'home') {
      add({
        key: page.key,
        label: page.label,
        group: 'Pages',
        view: 'home',
        screen: null,
      })
      continue
    }

    if (page.view === 'tracking') {
      add({
        key: page.key,
        label: page.label,
        group: 'Pages',
        view: 'tracking',
        screen: null,
      })
      continue
    }

    add({
      key: page.key,
      label: page.label,
      group: 'Pages',
      view: page.view,
      screen: page.view === 'transport' ? 'transport-default' : 'stall-default',
    })
  }

  for (const item of WIDGET_STATE_ITEMS) {
    for (const view of item.scopes) {
      add({
        key: `${item.key}:${view}`,
        label: `${view === 'transport' ? 'Transport' : 'VSA'} · ${item.label}`,
        group: item.key.split(':')[0] ?? 'Widget',
        view,
        screen: item.screen,
      })
    }
  }

  return targets
}

export function figmaCaptureFilename(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

/** Which workflow accordion to open when capturing a widget-state screen. */
export function resolveExpandedSectionForScreen(
  screen: ScreenId,
  sections: readonly WorkflowSection[],
): WorkflowSection | null {
  const pick = (section: WorkflowSection) =>
    sections.includes(section) ? section : null

  if (screen.startsWith('cleaning')) return pick('cleaning')

  if (
    screen.startsWith('fueling') ||
    screen.startsWith('on-site') ||
    screen.startsWith('non-gasboy')
  ) {
    return pick('fuel')
  }

  if (screen.startsWith('stall') || screen.startsWith('movement-stall')) {
    return pick('stall')
  }

  if (screen.startsWith('movement-transport') || screen === 'transport-default') {
    return pick('movement')
  }

  if (screen.includes('mileage') || screen === 'transport-complete') {
    return pick('movement') ?? pick('fuel')
  }

  if (screen === 'vsa-complete') {
    return pick('stall') ?? pick('cleaning') ?? pick('fuel')
  }

  return null
}

export function shouldOpenFuelScannerForScreen(screen: ScreenId): boolean {
  return screen === 'fueling-scanner'
}
