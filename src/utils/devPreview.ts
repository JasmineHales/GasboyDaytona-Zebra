const DEMO_SESSION_KEY = 'remote-off.demo-panel'

/** True in Vite dev, on Vercel demo hosts, or when ?demo=1 / VITE_ENABLE_DEMO_PANEL is set. */
export function isDevPreviewEnabled(): boolean {
  if (import.meta.env.DEV) return true
  if (import.meta.env.VITE_ENABLE_DEMO_PANEL === 'true') return true

  if (typeof window === 'undefined') return false

  try {
    if (sessionStorage.getItem(DEMO_SESSION_KEY) === '1') return true
  } catch {
    // ignore
  }

  const params = new URLSearchParams(window.location.search)
  if (
    params.has('demo') ||
    params.get('demo') === '1' ||
    params.get('dev') === '1'
  ) {
    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, '1')
    } catch {
      // ignore
    }
    return true
  }

  const host = window.location.hostname
  if (host.endsWith('.vercel.app') || host === 'vercel.app') {
    return true
  }

  return false
}
