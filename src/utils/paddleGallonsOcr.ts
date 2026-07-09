import type { PaddleOcrResult } from 'ppu-paddle-ocr/web'
import {
  candidateFromOcrText,
  type GallonsRecognitionCandidate,
} from './gallonsOcrShared'
import { extractBestEffortGallons } from './gallonsInput'

type PaddleOcrService = import('ppu-paddle-ocr/web').PaddleOcrService

export type PaddleOcrInitState = 'idle' | 'loading' | 'ready' | 'failed'

const PADDLE_INIT_TIMEOUT_MS = 8_000
const PADDLE_READ_TIMEOUT_MS = 12_000
const MAX_PADDLE_SIDE = 1200

let paddleServicePromise: Promise<PaddleOcrService | null> | null = null
let initState: PaddleOcrInitState = 'idle'

export function getPaddleOcrInitState(): PaddleOcrInitState {
  return initState
}

export function isPaddleReady(): boolean {
  return initState === 'ready'
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    }),
  ])
}

async function getPaddleOcrService(): Promise<PaddleOcrService | null> {
  if (initState === 'failed') {
    return null
  }

  if (paddleServicePromise) {
    return paddleServicePromise
  }

  initState = 'loading'
  paddleServicePromise = (async () => {
    try {
      const { PaddleOcrService } = await import('ppu-paddle-ocr/web')
      const service = new PaddleOcrService({
        processing: { engine: 'canvas-native' },
        debugging: { verbose: false },
        session: {
          executionProviders: ['wasm'],
        },
        detection: {
          maxSideLength: 640,
        },
      })
      await withTimeout(service.initialize(), PADDLE_INIT_TIMEOUT_MS, 'Paddle init')
      initState = 'ready'
      return service
    } catch (error) {
      initState = 'failed'
      paddleServicePromise = null
      if (import.meta.env.DEV) {
        console.warn('[paddle-gallons-ocr] unavailable', error)
      }
      return null
    }
  })()

  return paddleServicePromise
}

export function warmPaddleGallonsOcr() {
  void getPaddleOcrService()
}

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file)

  try {
    let width = bitmap.width
    let height = bitmap.height
    const longestSide = Math.max(width, height)

    if (longestSide > MAX_PADDLE_SIDE) {
      const scale = MAX_PADDLE_SIDE / longestSide
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not prepare pump image')
    }

    context.drawImage(bitmap, 0, 0, width, height)
    return canvas
  } finally {
    bitmap.close()
  }
}

function collectTextVariants(result: PaddleOcrResult): string[] {
  const variants = new Set<string>()

  const fullText = result.text.trim()
  if (fullText) variants.add(fullText)

  for (const line of result.lines) {
    const lineText = line.map((item) => item.text).join(' ').trim()
    if (lineText) variants.add(lineText)
  }

  return [...variants]
}

function candidatesFromPaddleResult(result: PaddleOcrResult): GallonsRecognitionCandidate[] {
  const engineConfidence = Math.round(result.confidence * 100)
  const candidates: GallonsRecognitionCandidate[] = []
  const seen = new Set<string>()

  for (const text of collectTextVariants(result)) {
    const candidate =
      candidateFromOcrText(text, engineConfidence) ??
      bestEffortCandidate(text, engineConfidence)
    if (candidate && !seen.has(candidate.gallons)) {
      seen.add(candidate.gallons)
      candidates.push(candidate)
    }
  }

  return candidates
}

function bestEffortCandidate(
  text: string,
  engineConfidence: number,
): GallonsRecognitionCandidate | null {
  const extraction = extractBestEffortGallons(text)
  if (!extraction) return null

  const ocrConfidence = Math.round(
    extraction.confidence * 0.65 + Math.min(100, engineConfidence) * 0.35,
  )

  return {
    gallons: extraction.gallons,
    ocrRawText: extraction.rawText || text.trim(),
    ocrConfidence: Math.max(ocrConfidence, extraction.confidence),
    labeled: extraction.labeled,
  }
}

export async function readGallonsWithPaddle(
  file: File,
): Promise<GallonsRecognitionCandidate[]> {
  if (!isPaddleReady()) {
    return []
  }

  try {
    const service = await getPaddleOcrService()
    if (!service) return []

    const canvas = await fileToCanvas(file)
    const result = await withTimeout(
      service.recognize(canvas),
      PADDLE_READ_TIMEOUT_MS,
      'Paddle read',
    )

    return candidatesFromPaddleResult(result)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[paddle-gallons-ocr] read failed', error)
    }
    return []
  }
}
