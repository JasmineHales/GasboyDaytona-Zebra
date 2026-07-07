import type {
  PlateAlprDebugImages,
  PlateAlprPipelineResult,
  PlateBoundingBox,
  PlateOcrAttempt,
} from './plateAlprTypes'
import { detectLicensePlateRegions, createCenterPlateFallbackRegion } from './plateDetector'
import { correctPlateOcrText, pickBestPlateFromText } from './plateFormatRules'
import {
  canvasToDataUrl,
  cropPlateRegion,
  estimateDeskewAngle,
  PLATE_PREPROCESS_VARIANTS,
  preprocessPlateCrop,
  rotateCanvas,
} from './plateImageProcessing'
import { getPlateOcrWorkerState, recognizePlateCrop, warmPlateOcrWorker } from './plateOcrEngine'
import { warmPlateDetector } from './platePaddleDetector'

const READ_BUDGET_MS = 18_000
const MIN_USABLE_FORMAT_SCORE = 45

async function waitForPlateOcrReady(timeoutMs = 12_000): Promise<boolean> {
  const started = Date.now()
  warmPlateOcrWorker()

  while (Date.now() - started < timeoutMs) {
    const state = getPlateOcrWorkerState()
    if (state === 'ready') return true
    if (state === 'failed') return false
    await new Promise((resolve) => window.setTimeout(resolve, 150))
  }

  return getPlateOcrWorkerState() === 'ready'
}

export function getLicensePlateOcrInitState():
  | 'idle'
  | 'loading'
  | 'ready'
  | 'failed' {
  const worker = getPlateOcrWorkerState()
  if (worker === 'failed') return 'failed'
  if (worker === 'loading') return 'loading'
  if (worker === 'ready') return 'ready'
  return 'idle'
}

export function warmLicensePlateOcrWorker() {
  warmPlateOcrWorker()
  // Paddle ONNX is optional; warm in background without blocking scan UX.
  warmPlateDetector()
}

function pickBestAttempt(attempts: PlateOcrAttempt[]): PlateOcrAttempt | null {
  if (attempts.length === 0) return null
  return [...attempts].sort((a, b) => b.totalScore - a.totalScore)[0] ?? null
}

async function ocrDetectedPlate(
  sourceCanvas: HTMLCanvasElement,
  detection: PlateBoundingBox,
  startedAt: number,
): Promise<PlateOcrAttempt[]> {
  const crop = cropPlateRegion(
    sourceCanvas,
    sourceCanvas.width,
    sourceCanvas.height,
    detection,
  )
  const deskewAngle = estimateDeskewAngle(crop)
  const deskewed = rotateCanvas(crop, deskewAngle + detection.angleDeg)

  const attempts: PlateOcrAttempt[] = []

  for (const variant of PLATE_PREPROCESS_VARIANTS) {
    if (Date.now() - startedAt > READ_BUDGET_MS) break
    const processed = preprocessPlateCrop(deskewed, variant)
    const attempt = await recognizePlateCrop(processed, variant, deskewAngle)
    attempts.push(attempt)

    if (attempt.formatScore >= 100) break
  }

  return attempts
}

function logPlateAlprDebug(
  result: PlateAlprPipelineResult,
  debugImages: PlateAlprDebugImages,
) {
  if (!import.meta.env.DEV) return

  console.groupCollapsed('[plate-alpr] pipeline result')
  console.log('detection', result.detection)
  console.log('raw OCR', result.ocrRawText)
  console.log('corrected plate', result.plate)
  console.log('confidence', result.ocrConfidence)
  console.log('best attempt', result.bestAttempt)
  console.log('attempts', result.attempts)
  if (debugImages.original) console.log('original', debugImages.original)
  if (debugImages.detectedCrop) console.log('detected crop', debugImages.detectedCrop)
  if (debugImages.processedCrop) console.log('processed crop', debugImages.processedCrop)
  console.groupEnd()
}

export async function runPlateAlprPipeline(file: File): Promise<PlateAlprPipelineResult> {
  const startedAt = Date.now()
  await waitForPlateOcrReady()

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = bitmap.width
  sourceCanvas.height = bitmap.height
  const sourceContext = sourceCanvas.getContext('2d')
  if (!sourceContext) {
    bitmap.close()
    throw new Error('Could not decode plate photo')
  }
  sourceContext.drawImage(bitmap, 0, 0)
  bitmap.close()

  const debugImages: PlateAlprDebugImages = {
    original: canvasToDataUrl(sourceCanvas),
  }

  const detections = await detectLicensePlateRegions(sourceCanvas)
  const attempts: PlateOcrAttempt[] = []
  let bestDetection: PlateBoundingBox | null = null

  for (const detection of detections) {
    if (Date.now() - startedAt > READ_BUDGET_MS) break
    try {
      const detectionAttempts = await ocrDetectedPlate(sourceCanvas, detection, startedAt)
      attempts.push(...detectionAttempts)

      const bestForDetection = pickBestAttempt(detectionAttempts)
      const currentBest = pickBestAttempt(attempts)
      if (
        bestForDetection &&
        (!currentBest || bestForDetection.totalScore >= currentBest.totalScore)
      ) {
        bestDetection = detection
      }

      if (bestForDetection && bestForDetection.formatScore >= 100) break
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[plate-alpr] OCR attempt failed for detection', detection, error)
      }
    }
  }

  const interimBest = pickBestAttempt(attempts)
  const interimCorrected =
    interimBest?.correctedText ||
    pickBestPlateFromText(attempts.map((item) => item.rawText).join('\n'))?.plate ||
    ''

  if (
    !interimCorrected ||
    (interimBest?.formatScore ?? 0) < MIN_USABLE_FORMAT_SCORE
  ) {
    try {
      const fallbackDetection = createCenterPlateFallbackRegion(
        sourceCanvas.width,
        sourceCanvas.height,
      )
      const fallbackAttempts = await ocrDetectedPlate(sourceCanvas, fallbackDetection, startedAt)
      attempts.push(...fallbackAttempts)

      const fallbackBest = pickBestAttempt(fallbackAttempts)
      const currentBest = pickBestAttempt(attempts)
      if (
        fallbackBest &&
        (!currentBest || fallbackBest.totalScore >= currentBest.totalScore)
      ) {
        bestDetection = fallbackDetection
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[plate-alpr] center fallback OCR failed', error)
      }
    }
  }

  const bestAttempt = pickBestAttempt(attempts)
  if (bestDetection) {
    const crop = cropPlateRegion(
      sourceCanvas,
      sourceCanvas.width,
      sourceCanvas.height,
      bestDetection,
    )
    debugImages.detectedCrop = canvasToDataUrl(crop)
    if (bestAttempt) {
      const variant = PLATE_PREPROCESS_VARIANTS.find(
        (item) => item.id === bestAttempt.variantId,
      )
      if (variant) {
        const deskewed = rotateCanvas(crop, bestAttempt.angleDeg)
        debugImages.processedCrop = canvasToDataUrl(preprocessPlateCrop(deskewed, variant))
      }
    }
  }

  const rawTexts = attempts.map((attempt) => attempt.rawText).filter(Boolean)
  const ocrRawText = rawTexts.join('\n').trim()
  const corrected =
    pickBestPlateFromText(ocrRawText)?.plate ||
    correctPlateOcrText(ocrRawText).corrected ||
    bestAttempt?.correctedText ||
    ''

  const result: PlateAlprPipelineResult = {
    plate: corrected,
    ocrRawText,
    ocrConfidence: bestAttempt?.confidence ?? 0,
    detection: bestDetection,
    bestAttempt,
    attempts,
    debug: debugImages,
  }

  logPlateAlprDebug(result, debugImages)
  return result
}
