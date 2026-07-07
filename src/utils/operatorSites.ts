import {
  DEFAULT_OPERATOR_SITE,
  getOperatorSiteEntry,
  getOperatorSiteNames,
  isKnownOperatorSite,
  normalizeOperatorSiteName,
} from './operatorSiteCatalog'

export type { OperatorSiteEntry } from './operatorSiteCatalog'
export {
  DEFAULT_OPERATOR_SITE,
  getOperatorSiteNames,
  isKnownOperatorSite,
  OPERATOR_SITE_CATALOG,
} from './operatorSiteCatalog'

export const OPERATOR_SITES = getOperatorSiteNames() as readonly string[]

export type OperatorSiteId = (typeof OPERATOR_SITES)[number]

const OPERATOR_SITE_KEY = 'remote-off.operator-site'

export function isOperatorSite(value: string): value is OperatorSiteId {
  return isKnownOperatorSite(value)
}

export function readOperatorSite(): string | null {
  try {
    const value = localStorage.getItem(OPERATOR_SITE_KEY)?.trim()
    return value || null
  } catch {
    return null
  }
}

export function persistOperatorSite(site: string) {
  const normalized = normalizeOperatorSiteName(site)
  try {
    localStorage.setItem(OPERATOR_SITE_KEY, normalized)
  } catch {
    // ignore
  }
}

export function resolveOperatorSite(fallback: string = DEFAULT_OPERATOR_SITE): string {
  const stored = readOperatorSite()
  if (stored) {
    const entry = getOperatorSiteEntry(stored)
    if (entry) return entry.name
  }
  const fallbackEntry = getOperatorSiteEntry(fallback)
  if (fallbackEntry) return fallbackEntry.name
  return DEFAULT_OPERATOR_SITE
}
