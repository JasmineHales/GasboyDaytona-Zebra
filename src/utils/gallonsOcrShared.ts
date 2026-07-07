import {
  extractGallonsWithConfidence,
  isTrustworthyGallonsExtraction,
} from './gallonsInput'

export type GallonsRecognitionCandidate = {
  gallons: string
  ocrRawText: string
  ocrConfidence: number
  labeled: boolean
}

export function candidateFromOcrText(
  text: string,
  engineConfidence = 0,
): GallonsRecognitionCandidate | null {
  const extraction = extractGallonsWithConfidence(text)
  if (!extraction) return null

  const normalizedEngine = Math.min(100, Math.max(0, engineConfidence))
  const ocrConfidence = Math.round(
    extraction.confidence * 0.65 + normalizedEngine * 0.35,
  )

  return {
    gallons: extraction.gallons,
    ocrRawText: extraction.rawText || text.trim(),
    ocrConfidence: Math.max(ocrConfidence, extraction.confidence),
    labeled: extraction.labeled,
  }
}

export function pickBestGallonsCandidate(
  candidates: GallonsRecognitionCandidate[],
): GallonsRecognitionCandidate | null {
  if (candidates.length === 0) return null

  const counts = new Map<
    string,
    { count: number; confidence: number; rawText: string; labeled: boolean }
  >()

  for (const candidate of candidates) {
    const existing = counts.get(candidate.gallons)
    if (existing) {
      existing.count += 1
      existing.confidence = Math.max(existing.confidence, candidate.ocrConfidence)
      existing.labeled = existing.labeled || candidate.labeled
      if (candidate.ocrRawText.length > existing.rawText.length) {
        existing.rawText = candidate.ocrRawText
      }
      continue
    }

    counts.set(candidate.gallons, {
      count: 1,
      confidence: candidate.ocrConfidence,
      rawText: candidate.ocrRawText,
      labeled: candidate.labeled,
    })
  }

  const ranked = [...counts.entries()].sort((left, right) => {
    if (left[1].labeled !== right[1].labeled) return left[1].labeled ? -1 : 1
    if (right[1].count !== left[1].count) return right[1].count - left[1].count
    return right[1].confidence - left[1].confidence
  })

  const best = ranked[0]
  if (!best) return null

  return {
    gallons: best[0],
    ocrRawText: best[1].rawText,
    ocrConfidence: best[1].confidence,
    labeled: best[1].labeled,
  }
}

export function isAcceptableGallonsRead(
  best: GallonsRecognitionCandidate,
  candidates: GallonsRecognitionCandidate[],
): boolean {
  const agreementCount = candidates.filter(
    (candidate) => candidate.gallons === best.gallons,
  ).length

  return isTrustworthyGallonsExtraction(
    {
      gallons: best.gallons,
      confidence: best.ocrConfidence,
      rawText: best.ocrRawText,
      labeled: best.labeled,
    },
    agreementCount,
  )
}

export function shouldStopGallonsRetry(candidate: GallonsRecognitionCandidate | null) {
  return Boolean(candidate && (candidate.labeled || candidate.ocrConfidence >= 85))
}

/** Good enough to show the user without waiting for slower engines. */
export function isFastEnoughGallonsRead(candidate: GallonsRecognitionCandidate | null) {
  return Boolean(
    candidate && (candidate.labeled || candidate.ocrConfidence >= 68),
  )
}
