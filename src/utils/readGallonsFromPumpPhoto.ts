import {
  GALLONS_OCR_CONFIDENCE_THRESHOLD,
  type GallonsOcrSuccess,
} from '../types/gallonsCapture'
import { extractBestEffortGallons, formatGallons } from './gallonsInput'
import {
  isFastEnoughGallonsRead,
  pickBestGallonsCandidate,
  type GallonsRecognitionCandidate,
} from './gallonsOcrShared'
import {
  getPaddleOcrInitState,
  isPaddleReady,
  readGallonsWithPaddle,
  warmPaddleGallonsOcr,
} from './paddleGallonsOcr'
import { readGallonsWithTesseract, warmTesseractGallonsOcr } from './tesseractGallonsOcr'

export { getPaddleOcrInitState }

const READ_BUDGET_MS = 6_000

export function warmGallonsOcrWorker() {
  warmTesseractGallonsOcr()
  warmPaddleGallonsOcr()
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function readAllEngines(file: File): Promise<GallonsRecognitionCandidate[]> {
  const collected: GallonsRecognitionCandidate[] = []
  let finished = false

  const merge = (incoming: GallonsRecognitionCandidate[]) => {
    collected.push(...incoming)
    return pickBestGallonsCandidate(collected)
  }

  const tryFinishEarly = () => {
    const best = pickBestGallonsCandidate(collected)
    return isFastEnoughGallonsRead(best) ? best : null
  }

  const tesseractTask = readGallonsWithTesseract(file).then((results) => {
    merge(results)
    return tryFinishEarly()
  })

  const paddleTask = (isPaddleReady() ? readGallonsWithPaddle(file) : Promise.resolve([])).then(
    (results) => {
      merge(results)
      return tryFinishEarly()
    },
  )

  const earlyWinner = await Promise.race([
    tesseractTask,
    paddleTask,
    sleep(READ_BUDGET_MS).then(() => null),
  ])

  if (earlyWinner) {
    finished = true
  }

  if (!finished) {
    await Promise.allSettled([tesseractTask, paddleTask])
  }

  return collected
}

export async function readGallonsFromPumpPhoto(file: File): Promise<GallonsOcrSuccess> {
  const imageUri = URL.createObjectURL(file)

  if (file.size < 500) {
    return {
      ok: true,
      gallons: '',
      ocrRawText: '',
      ocrConfidence: 0,
      imageUri,
      confident: false,
    }
  }

  try {
    const candidates = await readAllEngines(file)
    let best = pickBestGallonsCandidate(candidates)

    if (!best) {
      const rawText = candidates.map((candidate) => candidate.ocrRawText).join('\n').trim()
      const fallback = rawText ? extractBestEffortGallons(rawText) : null
      if (fallback) {
        best = {
          gallons: fallback.gallons,
          ocrRawText: fallback.rawText,
          ocrConfidence: fallback.confidence,
          labeled: fallback.labeled,
        }
      }
    }

    const gallons = best ? formatGallons(Number.parseFloat(best.gallons)) : ''
    const ocrRawText = best?.ocrRawText ?? candidates.map((c) => c.ocrRawText).join('\n').trim()
    const ocrConfidence = best?.ocrConfidence ?? 0
    const confident = Boolean(
      best && (best.labeled || best.ocrConfidence >= GALLONS_OCR_CONFIDENCE_THRESHOLD),
    )

    return {
      ok: true,
      gallons,
      ocrRawText,
      ocrConfidence,
      imageUri,
      confident,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[gallons-ocr]', error)
    }
    return {
      ok: true,
      gallons: '',
      ocrRawText: '',
      ocrConfidence: 0,
      imageUri,
      confident: false,
    }
  }
}

export function revokeGallonsImageUri(imageUri?: string) {
  if (imageUri?.startsWith('blob:')) {
    URL.revokeObjectURL(imageUri)
  }
}
