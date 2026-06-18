const STORAGE_KEY = 'recent-locations'
const MAX_RECENT = 8

export function getRecentLocations(): string[] {
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

export function recordRecentLocation(location: string): void {
  const trimmed = location.trim()
  if (!trimmed) return

  const recent = getRecentLocations().filter((item) => item !== trimmed)
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([trimmed, ...recent].slice(0, MAX_RECENT)),
  )
}

export function sortLocationsByRecency(
  locations: string[],
  recent: string[],
): string[] {
  return [...locations].sort((a, b) => {
    const aIndex = recent.indexOf(a)
    const bIndex = recent.indexOf(b)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })
}
