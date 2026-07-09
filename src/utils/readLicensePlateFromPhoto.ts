import type { PlateAlprDebugImages } from './alpr/plateAlprTypes'
import {
  getLicensePlateOcrInitState,
  runPlateAlprPipeline,
  warmLicensePlateOcrWorker,
} from './alpr/plateAlprPipeline'
import {
  correctPlateOcrText,
  extractPlateCandidatesFromText,
  matchCatalogPlate,
  normalizePlateCompact,
  pickBestPlateFromText,
} from './alpr/plateFormatRules'

export type LicensePlateOcrResult = {
  plate: string
  ocrRawText: string
  ocrConfidence: number
  imageUri: string
  debug?: LicensePlateOcrDebug
}

export type LicensePlateOcrDebug = {
  detectionMethod?: string
  detectionScore?: number
  preprocessVariant?: string
  debugImages?: PlateAlprDebugImages
  attempts?: number
}

export {
  getLicensePlateOcrInitState,
  warmLicensePlateOcrWorker,
}

export function matchCatalogPlateFromOcrText(text: string): string | null {
  const compact = normalizePlateCompact(text)
  const direct = matchCatalogPlate(compact)
  if (direct) return direct

  const upper = text.toUpperCase()
  let bestMatch: { plate: string; length: number } | null = null

  for (const candidate of extractPlateCandidatesFromText(text)) {
    const catalog = matchCatalogPlate(normalizePlateCompact(candidate))
    if (!catalog) continue
    const plateCompact = normalizePlateCompact(catalog)
    const matched =
      upper.includes(catalog.toUpperCase()) ||
      (plateCompact.length >= 4 && compact.includes(plateCompact))

    if (matched && (!bestMatch || plateCompact.length > bestMatch.length)) {
      bestMatch = { plate: catalog, length: plateCompact.length }
    }
  }

  return bestMatch?.plate ?? null
}

export function extractLicensePlateFromText(text: string): string | null {
  const best = pickBestPlateFromText(text)?.plate
  if (best) return best
  const corrected = correctPlateOcrText(text).corrected
  return corrected || null
}

export async function readLicensePlateFromPhoto(file: File): Promise<LicensePlateOcrResult> {
  const imageUri = URL.createObjectURL(file)

  if (file.size < 500) {
    return {
      plate: '',
      ocrRawText: '',
      ocrConfidence: 0,
      imageUri,
    }
  }

  try {
    const pipeline = await runPlateAlprPipeline(file)
    return {
      plate: pipeline.plate,
      ocrRawText: pipeline.ocrRawText,
      ocrConfidence: pipeline.ocrConfidence,
      imageUri,
      debug: import.meta.env.DEV
        ? {
            detectionMethod: pipeline.detection?.method,
            detectionScore: pipeline.detection?.score,
            preprocessVariant: pipeline.bestAttempt?.variantId,
            debugImages: pipeline.debug,
            attempts: pipeline.attempts.length,
          }
        : undefined,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[plate-ocr]', error)
    }
    return {
      plate: '',
      ocrRawText: '',
      ocrConfidence: 0,
      imageUri,
    }
  }
}

export function revokeLicensePlateImageUri(imageUri?: string) {
  if (imageUri?.startsWith('blob:')) {
    URL.revokeObjectURL(imageUri)
  }
}
