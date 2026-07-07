export type DesignVersion = 'v2' | 'v3'

export const DESIGN_VERSIONS: DesignVersion[] = ['v2', 'v3']

export const DEFAULT_DESIGN_VERSION: DesignVersion = 'v2'

const DEV_VERSION_KEY = 'remote-off.dev.design-version'

export function isDesignVersion(value: string | null): value is DesignVersion {
  return value === 'v2' || value === 'v3'
}

/** Legacy V1 sessions fall back to V2 (V1 is hosted separately). */
function normalizeDesignVersion(value: string | null): DesignVersion | null {
  if (value === 'v1') return 'v2'
  return isDesignVersion(value) ? value : null
}

export function readDesignVersionDevOverride(): DesignVersion | null {
  try {
    const stored = sessionStorage.getItem(DEV_VERSION_KEY)
    return normalizeDesignVersion(stored)
  } catch {
    return null
  }
}

export function writeDesignVersionDevOverride(version: DesignVersion) {
  try {
    sessionStorage.setItem(DEV_VERSION_KEY, version)
  } catch {
    // ignore
  }
}

function stripDesignVersionParamFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('design')) return
  url.searchParams.delete('design')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function readDesignVersionFromUrl(): DesignVersion | null {
  const fromUrl = new URLSearchParams(window.location.search).get('design')
  return normalizeDesignVersion(fromUrl)
}

export function resolveDesignVersion(): DesignVersion {
  const fromUrl = readDesignVersionFromUrl()
  if (fromUrl) {
    writeDesignVersionDevOverride(fromUrl)
    stripDesignVersionParamFromUrl()
    return fromUrl
  }

  return readDesignVersionDevOverride() ?? DEFAULT_DESIGN_VERSION
}
