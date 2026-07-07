import type { PlateOcrAttempt, PlatePreprocessVariant } from './plateAlprTypes'
import { correctPlateOcrText } from './plateFormatRules'

type OcrWorker = Awaited<
  ReturnType<Awaited<typeof import('tesseract.js')>['createWorker']>
>

type PageSegMode = Awaited<typeof import('tesseract.js')>['PSM'][keyof Awaited<
  typeof import('tesseract.js')
>['PSM']]

let workerPromise: Promise<OcrWorker> | null = null
let lastWorkerMode: PageSegMode | null = null
let workerState: 'idle' | 'loading' | 'ready' | 'failed' = 'idle'

async function getPlateOcrWorker(): Promise<OcrWorker> {
  if (workerPromise) {
    try {
      return await workerPromise
    } catch {
      workerPromise = null
      workerState = 'failed'
    }
  }

  workerState = 'loading'
  workerPromise = (async () => {
    const { createWorker, PSM } = await import('tesseract.js')
    const worker = await createWorker('eng', 1, {
      logger: () => {},
    })
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
    })
    lastWorkerMode = PSM.SINGLE_LINE
    workerState = 'ready'
    return worker
  })()

  try {
    return await workerPromise
  } catch (error) {
    workerPromise = null
    workerState = 'failed'
    throw error
  }
}

export function getPlateOcrWorkerState(): 'idle' | 'loading' | 'ready' | 'failed' {
  return workerState
}

export function warmPlateOcrWorker() {
  void getPlateOcrWorker().catch(() => {
    workerPromise = null
    workerState = 'failed'
  })
}

async function recognizeCanvas(
  canvas: HTMLCanvasElement,
  pageSegMode: PageSegMode,
): Promise<{ text: string; confidence: number }> {
  const worker = await getPlateOcrWorker()
  if (lastWorkerMode !== pageSegMode) {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
      tessedit_pageseg_mode: pageSegMode,
    })
    lastWorkerMode = pageSegMode
  }

  const { data } = await worker.recognize(canvas)
  return {
    text: data.text.trim(),
    confidence: Number.isFinite(data.confidence) ? data.confidence : 0,
  }
}

export async function recognizePlateCrop(
  canvas: HTMLCanvasElement,
  variant: PlatePreprocessVariant,
  angleDeg: number,
): Promise<PlateOcrAttempt> {
  const { PSM } = await import('tesseract.js')
  const lineRead = await recognizeCanvas(canvas, PSM.SINGLE_LINE)
  const blockRead =
    lineRead.text.length < 4
      ? await recognizeCanvas(canvas, PSM.SINGLE_BLOCK)
      : lineRead

  const rawText = blockRead.text || lineRead.text
  const confidence = Math.max(lineRead.confidence, blockRead.confidence)
  const corrected = correctPlateOcrText(rawText)
  const totalScore = corrected.formatScore + confidence * 0.65

  return {
    variantId: variant.id,
    angleDeg,
    rawText,
    confidence: confidence / 100,
    correctedText: corrected.corrected,
    formatScore: corrected.formatScore,
    totalScore,
  }
}
