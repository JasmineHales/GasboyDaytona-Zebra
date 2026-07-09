const STORAGE_KEY = 'remote-off.recent-operator-sites'
const MAX_RECENT = 8

export function getRecentOperatorSites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export function recordRecentOperatorSite(site: string): void {
  const trimmed = site.trim()
  if (!trimmed) return

  const recent = getRecentOperatorSites().filter((item) => item !== trimmed)
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([trimmed, ...recent].slice(0, MAX_RECENT)),
    )
  } catch {
    // ignore
  }
}

export function sortOperatorSiteNamesByRecency(
  sites: string[],
  recent: string[],
): string[] {
  return [...sites].sort((a, b) => {
    const aIndex = recent.indexOf(a)
    const bIndex = recent.indexOf(b)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })
}
