import { VEHICLE_SEARCH_CATALOG } from '../vehicleSearchCatalog'

/** Compact plate: letters and digits only. */
export function normalizePlateCompact(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** Display plate: uppercase, strip junk but keep a single hyphen when present. */
export function normalizePlateDisplay(value: string): string {
  const upper = value.toUpperCase().replace(/[^A-Z0-9-\s]/g, '').replace(/\s+/g, ' ').trim()
  if (upper.includes('-')) return upper.replace(/\s+/g, '')
  return upper.replace(/\s+/g, '')
}

/** US / fleet demo patterns seen in the prototype catalog. */
export const US_PLATE_PATTERNS: RegExp[] = [
  /^[A-Z]{3}[0-9]{4}$/, // DNJ0955
  /^[A-Z]{2}[0-9]{5}$/, // BC18351
  /^[0-9][A-Z]{3}[0-9]{3}$/, // 8LAK631
  /^[A-Z][0-9]{3}[A-Z]{2}$/, // V576AE
  /^[0-9]{3}[A-Z]{2}[0-9]$/, // 215BG2
  /^[0-9]{3}[0-9]{3}$/, // 570-184 (RI and similar)
  /^[A-Z]{3}[0-9]{4}$/, // HXW7509
  /^[A-Z]{3}[0-9A-Z]{4}$/, // F3L60E4
  /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/, // FN278YZ
  /^[A-Z]{2,4}-?[0-9]{2,6}$/,
  /^[A-Z0-9]{5,8}$/,
]

const OCR_CONFUSION_PAIRS: Array<[string, string]> = [
  ['O', '0'],
  ['I', '1'],
  ['S', '5'],
  ['B', '8'],
  ['1', '7'],
  ['2', '5'],
  ['0', '8'],
  ['6', '8'],
  ['3', '8'],
  ['4', '9'],
]

/** Likely OCR misreads → plausible true characters (directional). */
const OCR_LIKELY_MISREAD_TO: Record<string, string[]> = {
  O: ['0'],
  I: ['1'],
  S: ['5'],
  B: ['8'],
  '2': ['5'],
  '5': ['2'],
  '1': ['7'],
  '7': ['1'],
  '8': ['0', '6'],
  '6': ['8'],
  '3': ['8'],
  '9': ['4'],
  '4': ['9'],
}

const MAX_CONFUSION_DEPTH = 3

function isConfusionPair(a: string, b: string): boolean {
  return OCR_CONFUSION_PAIRS.some(([from, to]) => (a === from && b === to) || (a === to && b === from))
}

export function matchesPlatePattern(compact: string): boolean {
  if (compact.length < 4 || compact.length > 8) return false
  return US_PLATE_PATTERNS.some((pattern) => pattern.test(compact))
}

export function scorePlateFormat(compact: string): number {
  if (compact.length < 4) return 0
  if (compact.length > 8) return 10

  let score = Math.min(compact.length, 8) * 6
  if (matchesPlatePattern(compact)) score += 35
  if (/[A-Z]/.test(compact) && /\d/.test(compact)) score += 10
  return Math.min(score, 95)
}

function applySubstitution(compact: string, index: number, replacement: string): string {
  return `${compact.slice(0, index)}${replacement}${compact.slice(index + 1)}`
}

function protectedSuffixLength(raw: string): number {
  const dash = raw.toUpperCase().indexOf('-')
  if (dash < 0) return 0
  return normalizePlateCompact(raw.slice(dash + 1)).length
}

function generateSubstitutions(
  compact: string,
  raw: string,
  maxDepth = MAX_CONFUSION_DEPTH,
): string[] {
  const results = new Set<string>([compact])
  let frontier = [compact]
  const editableUntil = Math.max(0, compact.length - protectedSuffixLength(raw))

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const next: string[] = []
    for (const current of frontier) {
      for (let index = 0; index < editableUntil; index += 1) {
        const char = current[index]
        const replacements = OCR_LIKELY_MISREAD_TO[char] ?? []
        for (const replacement of replacements) {
          const variant = applySubstitution(current, index, replacement)
          if (results.has(variant)) continue
          results.add(variant)
          next.push(variant)
        }
      }
    }
    frontier = next
    if (frontier.length === 0) break
  }

  return [...results]
}

function rankPlateCandidate(
  original: string,
  candidate: string,
  formatScore: number,
  editableUntil: number,
) {
  const rawEdits = candidate
    .split('')
    .filter((char, index) => char !== original[index]).length
  let prefixCorrections = 0
  for (let index = 0; index < editableUntil; index += 1) {
    if (original[index] === candidate[index]) continue
    if (isConfusionPair(original[index], candidate[index])) prefixCorrections += 1
  }

  if (candidate === original) {
    return formatScore * 100_000 - 3_000
  }

  return formatScore * 100_000 - rawEdits * 500 + prefixCorrections * 800
}

export function matchCatalogPlate(compact: string): string | null {
  const match = VEHICLE_SEARCH_CATALOG.find(
    (entry) => normalizePlateCompact(entry.licensePlate) === compact,
  )
  return match?.licensePlate ?? null
}

export function correctPlateOcrText(raw: string): {
  corrected: string
  compact: string
  formatScore: number
  catalogPlate: string | null
} {
  const compact = normalizePlateCompact(raw)
  if (!compact) {
    return { corrected: '', compact: '', formatScore: 0, catalogPlate: null }
  }

  const catalogDirect = matchCatalogPlate(compact)
  if (catalogDirect) {
    return {
      corrected: catalogDirect,
      compact,
      formatScore: 100,
      catalogPlate: catalogDirect,
    }
  }

  let bestCompact = compact
  let bestScore = scorePlateFormat(compact)
  const editableUntil = Math.max(0, compact.length - protectedSuffixLength(raw))
  let bestRank = rankPlateCandidate(compact, compact, bestScore, editableUntil)

  for (const candidate of generateSubstitutions(compact, raw)) {
    const catalog = matchCatalogPlate(candidate)
    if (!catalog && !matchesPlatePattern(candidate)) continue

    const formatScore = catalog ? 100 : scorePlateFormat(candidate)
    const rank = rankPlateCandidate(compact, candidate, formatScore, editableUntil)
    if (rank > bestRank) {
      bestRank = rank
      bestScore = formatScore
      bestCompact = candidate
      if (catalog) {
        return {
          corrected: catalog,
          compact: candidate,
          formatScore,
          catalogPlate: catalog,
        }
      }
    }
  }

  const display = formatPlateFromCompact(bestCompact)
  return {
    corrected: display,
    compact: bestCompact,
    formatScore: bestScore,
    catalogPlate: matchCatalogPlate(bestCompact),
  }
}

export function formatPlateFromCompact(compact: string): string {
  const catalog = matchCatalogPlate(compact)
  if (catalog) return catalog

  if (/^[0-9]{6}$/.test(compact)) {
    return `${compact.slice(0, 3)}-${compact.slice(3)}`
  }

  if (/^[A-Z]{3}[0-9A-Z]{4}$/.test(compact)) {
    return `${compact.slice(0, 3)}-${compact.slice(3)}`
  }

  if (/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(compact)) {
    return `${compact.slice(0, 2)} ${compact.slice(2, 5)} ${compact.slice(5)}`
  }

  if (compact.length >= 5 && /^[A-Z]{2,3}[0-9]/.test(compact)) {
    return `${compact.slice(0, 3)}-${compact.slice(3)}`
  }

  return compact
}

const PLATE_TOKEN_PATTERN = /\b[A-Z0-9]{2,4}-?[A-Z0-9]{2,6}\b/g
const PLATE_NUMERIC_DASH_PATTERN = /\b[0-9]{3}-[0-9]{3}\b/g
const PLATE_COMPACT_PATTERN = /\b[A-Z]{2,4}[0-9]{2,5}\b/g

export function extractPlateCandidatesFromText(text: string): string[] {
  const upper = text.toUpperCase()
  const candidates = new Set<string>()

  for (const match of upper.match(PLATE_TOKEN_PATTERN) ?? []) {
    candidates.add(normalizePlateDisplay(match))
  }
  for (const match of upper.match(PLATE_NUMERIC_DASH_PATTERN) ?? []) {
    candidates.add(match)
  }
  for (const match of upper.match(PLATE_COMPACT_PATTERN) ?? []) {
    candidates.add(formatPlateFromCompact(match))
  }

  const compact = normalizePlateCompact(text)
  if (compact.length >= 4 && compact.length <= 8) {
    candidates.add(formatPlateFromCompact(compact))
  }

  return [...candidates]
}

export function pickBestPlateFromText(text: string): {
  plate: string
  formatScore: number
} | null {
  const candidates = extractPlateCandidatesFromText(text)
  let best: { plate: string; formatScore: number } | null = null

  for (const candidate of candidates) {
    const { corrected, formatScore, catalogPlate } = correctPlateOcrText(candidate)
    const plate = catalogPlate ?? corrected
    const score = formatScore + (catalogPlate ? 50 : 0)
    if (!best || score > best.formatScore) {
      best = { plate, formatScore: score }
    }
  }

  return best
}
