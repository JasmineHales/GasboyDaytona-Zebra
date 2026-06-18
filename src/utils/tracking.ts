export type TrackEvent = {
  tag: string
  timestamp: number
  view?: string
  screen?: string
  metadata?: Record<string, string>
}

const CLICK_LOG_KEY = 'remote-off-click-log'
const MAX_LOG_ENTRIES = 500

const clickLogListeners = new Set<() => void>()

function notifyClickLogListeners() {
  clickLogListeners.forEach((listener) => listener())
}

export function subscribeClickLog(listener: () => void) {
  clickLogListeners.add(listener)
  return () => {
    clickLogListeners.delete(listener)
  }
}

type ClickLogWindow = {
  getClickLog: typeof getClickLog
  clearClickLog: typeof clearClickLog
}

function readLog(): TrackEvent[] {
  try {
    const raw = sessionStorage.getItem(CLICK_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TrackEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLog(events: TrackEvent[]) {
  try {
    sessionStorage.setItem(CLICK_LOG_KEY, JSON.stringify(events.slice(-MAX_LOG_ENTRIES)))
  } catch {
    // Ignore quota / private-mode storage errors.
  }
}

export function slugifyTrackValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function trackProps(
  tag: string,
  metadata?: Record<string, string | number | boolean | undefined>,
) {
  const props: Record<string, string> = { 'data-track': tag }

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined) {
        props[`data-track-${key}`] = String(value)
      }
    }
  }

  return props
}

export function recordClick(event: TrackEvent) {
  const next = [...readLog(), event]
  writeLog(next)
  notifyClickLogListeners()

  if (import.meta.env.DEV) {
    const meta = event.metadata ? ` ${JSON.stringify(event.metadata)}` : ''
    const context = [event.view, event.screen].filter(Boolean).join(' · ')
    console.info(`[track] ${event.tag}${context ? ` (${context})` : ''}${meta}`)
  }
}

export function getClickLog(): TrackEvent[] {
  return readLog()
}

export function clearClickLog() {
  sessionStorage.removeItem(CLICK_LOG_KEY)
  notifyClickLogListeners()
}

function getTrackingContext(target: HTMLElement) {
  const shell = target.closest('[data-current-view]')
  const view = shell?.getAttribute('data-current-view') ?? undefined
  const screen = shell?.getAttribute('data-current-screen') ?? undefined

  const metadata: Record<string, string> = Object.fromEntries(
    [...target.attributes]
      .filter((attribute) => attribute.name.startsWith('data-track-'))
      .map((attribute) => [
        attribute.name.replace('data-track-', ''),
        attribute.value,
      ]),
  )

  return { view, screen, metadata: Object.keys(metadata).length > 0 ? metadata : undefined }
}

export function initClickTracking() {
  const handler = (event: MouseEvent) => {
    const target = event.target
    // Clicks often land on SVG icons or text nodes inside buttons.
    if (!(target instanceof Element)) return

    const tracked = target.closest<HTMLElement>('[data-track]')
    if (!tracked || tracked.hasAttribute('disabled') || tracked.getAttribute('aria-disabled') === 'true') {
      return
    }

    const tag = tracked.getAttribute('data-track')
    if (!tag) return

    const { view, screen, metadata } = getTrackingContext(tracked)
    recordClick({
      tag,
      timestamp: Date.now(),
      view,
      screen,
      metadata,
    })
  }

  document.addEventListener('click', handler, true)

  if (import.meta.env.DEV) {
    const debugWindow = window as typeof window & { __clickLog?: ClickLogWindow }
    debugWindow.__clickLog = {
      getClickLog,
      clearClickLog,
    }
  }

  return () => document.removeEventListener('click', handler, true)
}
