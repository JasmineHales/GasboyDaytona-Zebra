/** Normalize manual gallon entry to digits with at most one decimal point. */
export function normalizeGallonsInput(
  value: string,
  options?: { maxDecimals?: number },
): string {
  const maxDecimals = options?.maxDecimals ?? 3
  let normalized = value.replace(/[^\d.]/g, '')
  const firstDecimal = normalized.indexOf('.')

  if (firstDecimal === -1) {
    return normalized
  }

  const whole = normalized.slice(0, firstDecimal)
  const fraction = normalized.slice(firstDecimal + 1).replace(/\./g, '').slice(0, maxDecimals)
  return `${whole}.${fraction}`
}

export function formatGallons(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

export function isValidGallonsValue(value: string, options?: { maxDecimals?: number }): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  const maxDecimals = options?.maxDecimals ?? 3
  const decimalPattern =
    maxDecimals === 2
      ? /^\d+(?:\.\d{1,2})?$/
      : /^\d+(?:\.\d{1,3})?$/
  if (!decimalPattern.test(trimmed)) return false

  const gallons = Number.parseFloat(trimmed)
  return Number.isFinite(gallons) && gallons > 0 && gallons <= 100
}

function isPlausibleGallons(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= 100
}

/** Minimum score for unlabeled numeric guesses — below this we refuse to report a read. */
const MIN_UNLABELED_SCORE = 52

/** Normalize OCR tokens like 10000 -> 10.000 when the decimal was dropped. */
export function normalizeOcrGallonToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) return trimmed

  if (/^\d+\.\d+$/.test(trimmed)) {
    return trimmed
  }

  if (/^\d{1,2}0{3}$/.test(trimmed)) {
    return `${trimmed.slice(0, trimmed.length - 3)}.000`
  }

  if (/^\d{1,2}0{2}$/.test(trimmed)) {
    return `${trimmed.slice(0, trimmed.length - 2)}.00`
  }

  return trimmed
}

type ScoredToken = {
  token: string
  score: number
  labeled: boolean
}

export type GallonsExtraction = {
  gallons: string
  confidence: number
  rawText: string
  labeled: boolean
}

function toConfidence(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function looksLikeGallonLabel(text: string): boolean {
  return /gall?o?n?s?/i.test(text.replace(/0/g, 'O'))
}

function isLikelyPriceReading(
  gallons: number,
  decimalPlaces: number,
  context: string,
): boolean {
  const lower = context.toLowerCase()

  if (/\$/.test(context)) return true
  if (/(?:price|amount|total|this sale)/i.test(lower) && !looksLikeGallonLabel(lower)) {
    if (decimalPlaces === 2 && gallons >= 15) return true
  }

  // Dollar totals are usually higher 2-decimal values (e.g. 30.49, 45.00).
  if (decimalPlaces === 2 && gallons >= 28 && !looksLikeGallonLabel(lower)) {
    return true
  }

  if (decimalPlaces === 2 && gallons >= 40) {
    return true
  }

  return false
}

function scoreGallonCandidate(
  token: string,
  fullText: string,
  matchIndex: number,
  labeled: boolean,
): ScoredToken | null {
  const normalizedToken = normalizeOcrGallonToken(token)
  const gallons = Number.parseFloat(normalizedToken)
  if (!isPlausibleGallons(gallons)) return null

  const decimalPlaces = normalizedToken.includes('.')
    ? normalizedToken.split('.')[1]?.length ?? 0
    : 0

  const contextStart = Math.max(0, matchIndex - 48)
  const contextEnd = Math.min(fullText.length, matchIndex + normalizedToken.length + 48)
  const context = fullText.slice(contextStart, contextEnd)

  if (!labeled && isLikelyPriceReading(gallons, decimalPlaces, context)) {
    return null
  }

  let score = labeled ? 72 : 0

  if (decimalPlaces === 3) score += 50
  else if (decimalPlaces === 2) score += gallons >= 1 && gallons <= 35 ? 28 : -18
  else if (decimalPlaces === 1) score += 6

  if (looksLikeGallonLabel(context)) score += 55

  const afterText = fullText.slice(
    matchIndex + normalizedToken.length,
    matchIndex + normalizedToken.length + 14,
  )
  if (/^\s*(?:gal(?:lon)?s?)\b/i.test(afterText)) score += 75

  const beforeText = fullText.slice(Math.max(0, matchIndex - 14), matchIndex)
  if (/\b(?:gal(?:lon)?s?)\b\s*$/i.test(beforeText)) score += 75

  if (/(?:this sale|sale)/i.test(context) && !looksLikeGallonLabel(context)) score -= 28
  if (/(?:price|amount|total)/i.test(context) && !looksLikeGallonLabel(context)) score -= 32

  if (gallons <= 35) score += 10
  if (decimalPlaces === 2 && gallons >= 0.5 && gallons <= 25 && !labeled) score += 22
  if (gallons >= 20 && decimalPlaces === 2 && !labeled) score -= 35

  return { token: normalizedToken, score, labeled }
}

function extractLabeledGallons(normalized: string): GallonsExtraction | null {
  const labeledBefore = normalized.match(
    /(\d+\.\d{1,3}|\d+)\s*(?:gal(?:lon)?s?)\b/i,
  )
  if (labeledBefore?.[1]) {
    const token = normalizeOcrGallonToken(labeledBefore[1])
    const gallons = Number.parseFloat(token)
    if (isPlausibleGallons(gallons)) {
      return {
        gallons: formatGallons(gallons),
        confidence: toConfidence(92),
        rawText: normalized.trim(),
        labeled: true,
      }
    }
  }

  const labeledAfter = normalized.match(
    /\b(?:gal(?:lon)?s?)\b[^\d]{0,20}(\d+\.\d{1,3}|\d+)/i,
  )
  if (labeledAfter?.[1]) {
    const token = normalizeOcrGallonToken(labeledAfter[1])
    const gallons = Number.parseFloat(token)
    if (isPlausibleGallons(gallons)) {
      return {
        gallons: formatGallons(gallons),
        confidence: toConfidence(90),
        rawText: normalized.trim(),
        labeled: true,
      }
    }
  }

  for (const line of normalized.split('\n')) {
    if (!looksLikeGallonLabel(line)) continue

    for (const match of line.matchAll(/\d+\.\d{1,3}|\d+/g)) {
      const token = normalizeOcrGallonToken(match[0])
      const gallons = Number.parseFloat(token)
      if (!isPlausibleGallons(gallons)) continue

      const decimalPlaces = token.includes('.') ? token.split('.')[1]?.length ?? 0 : 0
      if (isLikelyPriceReading(gallons, decimalPlaces, line)) continue

      return {
        gallons: formatGallons(gallons),
        confidence: toConfidence(88),
        rawText: normalized.trim(),
        labeled: true,
      }
    }
  }

  return null
}

/** Pick the dispensed-gallon value from OCR text on a pump sale display. */
export function extractGallonsFromOcrText(text: string): string | null {
  return extractGallonsWithConfidence(text)?.gallons ?? null
}

/** Pick gallons and a confidence score from OCR text on a pump sale display. */
export function extractGallonsWithConfidence(text: string): GallonsExtraction | null {
  const normalized = text.replace(/\r/g, '\n').replace(/[|]/g, '1')

  const labeled = extractLabeledGallons(normalized)
  if (labeled) return labeled

  let best: ScoredToken | null = null
  for (const match of normalized.matchAll(/\d+\.\d{1,3}|\d+/g)) {
    const candidate = scoreGallonCandidate(match[0], normalized, match.index ?? 0, false)
    if (!candidate) continue
    if (!best || candidate.score > best.score) {
      best = candidate
    }
  }

  if (!best || best.score < MIN_UNLABELED_SCORE) return null

  return {
    gallons: formatGallons(Number.parseFloat(best.token)),
    confidence: toConfidence(best.score),
    rawText: normalized.trim(),
    labeled: false,
  }
}

/** Whether an extraction is trustworthy enough to show the user as a scan result. */
export function isTrustworthyGallonsExtraction(
  extraction: GallonsExtraction,
  agreementCount = 1,
): boolean {
  if (extraction.labeled) return true
  if (agreementCount >= 2) return true
  const gallons = Number.parseFloat(extraction.gallons)
  if (
    !extraction.labeled &&
    gallons >= 0.5 &&
    gallons <= 35 &&
    extraction.confidence >= 58
  ) {
    return true
  }
  return extraction.confidence >= 68
}

const MIN_BEST_EFFORT_SCORE = 35

/** Best-effort gallons pick when strict parsing finds nothing. */
export function extractBestEffortGallons(text: string): GallonsExtraction | null {
  const strict = extractGallonsWithConfidence(text)
  if (strict) return strict

  const normalized = text.replace(/\r/g, '\n').replace(/[|]/g, '1')

  let best: ScoredToken | null = null
  for (const match of normalized.matchAll(/\d+\.\d{1,3}|\d+/g)) {
    const candidate = scoreGallonCandidate(match[0], normalized, match.index ?? 0, false)
    if (!candidate) continue
    if (!best || candidate.score > best.score) {
      best = candidate
    }
  }

  if (!best || best.score < MIN_BEST_EFFORT_SCORE) return null

  return {
    gallons: formatGallons(Number.parseFloat(best.token)),
    confidence: toConfidence(best.score),
    rawText: normalized.trim(),
    labeled: best.labeled,
  }
}
