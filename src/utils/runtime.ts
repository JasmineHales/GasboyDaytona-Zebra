export type RuntimeMode = 'browser' | 'hertz-device'

const RUNTIME_OVERRIDE_KEY = 'remote-off.runtime'

declare global {
  interface Window {
    __HERTZ_DEVICE__?: boolean
  }
}

export function getRuntimeMode(): RuntimeMode {
  if (typeof window === 'undefined') return 'browser'

  const params = new URLSearchParams(window.location.search)
  const deviceParam = params.get('device')?.toLowerCase()
  const runtimeParam = params.get('runtime')?.toLowerCase()
  const modeParam = params.get('mode')?.toLowerCase()

  if (
    params.has('hertz-device') ||
    params.has('device') ||
    deviceParam === 'hertz' ||
    deviceParam === 'device' ||
    deviceParam === 'true' ||
    deviceParam === '1' ||
    runtimeParam === 'device' ||
    runtimeParam === 'hertz' ||
    modeParam === 'device'
  ) {
    return 'hertz-device'
  }

  if (window.__HERTZ_DEVICE__ === true) {
    return 'hertz-device'
  }

  try {
    if (localStorage.getItem(RUNTIME_OVERRIDE_KEY) === 'hertz-device') {
      return 'hertz-device'
    }
  } catch {
    // ignore
  }

  return 'browser'
}

export function isHertzDevice(): boolean {
  return getRuntimeMode() === 'hertz-device'
}

export function isBrowserRuntime(): boolean {
  return getRuntimeMode() === 'browser'
}
