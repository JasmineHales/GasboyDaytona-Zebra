export type OperatorSiteEntry = {
  id: string
  name: string
  code: string
}

export const DEFAULT_OPERATOR_SITE = 'Daytona'

export const OPERATOR_SITE_CATALOG: OperatorSiteEntry[] = [
  { id: 'albany', name: 'Albany', code: 'ALBPL' },
  { id: 'albuquerque', name: 'Albuquerque', code: 'ABQPL' },
  { id: 'allentown', name: 'Allentown', code: 'PHLPL' },
  { id: 'boston-logan', name: 'Boston Logan', code: 'BOSPL' },
  { id: 'chicago-ohare', name: "Chicago O'Hare", code: 'ORDPL' },
  { id: 'dallas-fort-worth', name: 'Dallas Fort Worth', code: 'DFWPL' },
  { id: 'daytona', name: 'Daytona', code: 'DABPL' },
  { id: 'denver', name: 'Denver', code: 'DENPL' },
  { id: 'los-angeles', name: 'Los Angeles', code: 'LAXPL' },
  { id: 'miami', name: 'Miami', code: 'MIAPL' },
  { id: 'newark', name: 'Newark', code: 'EWRPL' },
  { id: 'orlando', name: 'Orlando', code: 'MCOPL' },
  { id: 'phoenix', name: 'Phoenix', code: 'PHXPL' },
  { id: 'san-francisco', name: 'San Francisco', code: 'SFOPL' },
]

const CATALOG_BY_NAME = new Map(
  OPERATOR_SITE_CATALOG.map((entry) => [entry.name.toLowerCase(), entry]),
)

const LEGACY_NAME_ALIASES: Record<string, string> = {
  'albany ap': 'Albany',
  'denver ap': 'Denver',
  'los angeles ap': 'Los Angeles',
  'miami ap': 'Miami',
  'newark ap': 'Newark',
  'phoenix ap': 'Phoenix',
  'san francisco ap': 'San Francisco',
}

export function getOperatorSiteNames(): string[] {
  return OPERATOR_SITE_CATALOG.map((entry) => entry.name)
}

export function normalizeOperatorSiteName(name: string): string {
  const trimmed = name.trim()
  const alias = LEGACY_NAME_ALIASES[trimmed.toLowerCase()]
  if (alias) return alias
  return trimmed
}

export function isKnownOperatorSite(name: string): boolean {
  const normalized = normalizeOperatorSiteName(name)
  return CATALOG_BY_NAME.has(normalized.toLowerCase())
}

export function getOperatorSiteEntry(name: string): OperatorSiteEntry | undefined {
  const normalized = normalizeOperatorSiteName(name)
  return CATALOG_BY_NAME.get(normalized.toLowerCase())
}

export function filterOperatorSites(query: string): OperatorSiteEntry[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return [...OPERATOR_SITE_CATALOG]

  return OPERATOR_SITE_CATALOG.filter(
    (entry) =>
      entry.name.toLowerCase().includes(trimmed) ||
      entry.code.toLowerCase().includes(trimmed),
  )
}

export function sortOperatorSitesByRecency(
  entries: OperatorSiteEntry[],
  recentNames: string[],
): OperatorSiteEntry[] {
  const normalizedRecent = recentNames.map((name) => normalizeOperatorSiteName(name))

  return [...entries].sort((a, b) => {
    const aIndex = normalizedRecent.indexOf(a.name)
    const bIndex = normalizedRecent.indexOf(b.name)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.name.localeCompare(b.name)
  })
}
