import {
  candidateFromOcrText,
  type GallonsRecognitionCandidate,
  shouldStopGallonsRetry,
} from './gallonsOcrShared'

type OcrWorker = Awaited<
  ReturnType<Awaited<typeof import('tesseract.js')>['createWorker']>
>

type PageSegMode = Awaited<typeof import('tesseract.js')>['PSM'][keyof Awaited<
  typeof import('tesseract.js')
>['PSM']]

let workerPromise: Promise<OcrWorker> | null = null
let lastWorkerMode: { pageSegMode: PageSegMode; digitsOnly: boolean } | null = null

const MAX_OCR_WIDTH = 720

/** Wayne-style LCD — left-center of a full pump photo. */
const FAST_LCD_REGIONS = [
  { x: 0.02, y: 0.14, width: 0.64, height: 0.3, scale: 2.5 },
  { x: 0.04, y: 0.2, width: 0.5, height: 0.2, scale: 2.75 },
] as const

type CropRegion = {
  x: number
  y: number
  width: number
  height: number
  scale?: number
}

async function getOcrWorker(): Promise<OcrWorker> {
  if (workerPromise) {
    try {
      return await workerPromise
    } catch {
      workerPromise = null
    }
  }

  workerPromise = (async () => {
    const { createWorker, PSM } = await import('tesseract.js')
    const worker = await createWorker('eng', 1, {
      logger: () => {},
    })
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789.',
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
    })
    lastWorkerMode = { pageSegMode: PSM.SINGLE_LINE, digitsOnly: true }
    return worker
  })()

  try {
    return await workerPromise
  } catch (error) {
    workerPromise = null
    throw error
  }
}

export function warmTesseractGallonsOcr() {
  void getOcrWorker().catch(() => {
    workerPromise = null
  })
}

function enhanceForPumpLcd(imageData: ImageData, threshold: number) {
  const { data } = imageData

  for (let index = 0; index < data.length; index += 4) {
    const gray =
      0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2]
    const contrast = Math.min(255, Math.max(0, (gray - 128) * 2.15 + 128))
    const denoised = contrast < threshold ? 0 : 255
    data[index] = denoised
    data[index + 1] = denoised
    data[index + 2] = denoised
  }
}

function prepareCanvas(
  bitmap: ImageBitmap,
  region: CropRegion,
  threshold: number,
): HTMLCanvasElement {
  const cropX = Math.round(bitmap.width * region.x)
  const cropY = Math.round(bitmap.height * region.y)
  const cropWidth = Math.max(1, Math.round(bitmap.width * region.width))
  const cropHeight = Math.max(1, Math.round(bitmap.height * region.height))
  let scale = region.scale ?? 1

  let outputWidth = Math.round(cropWidth * scale)
  let outputHeight = Math.round(cropHeight * scale)

  if (outputWidth > MAX_OCR_WIDTH) {
    const limitScale = MAX_OCR_WIDTH / outputWidth
    outputWidth = Math.round(outputWidth * limitScale)
    outputHeight = Math.round(outputHeight * limitScale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, outputWidth)
  canvas.height = Math.max(1, outputHeight)

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not prepare pump image')
  }

  context.imageSmoothingEnabled = true
  context.drawImage(
    bitmap,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  enhanceForPumpLcd(imageData, threshold)
  context.putImageData(imageData, 0, 0)

  return canvas
}

async function recognizeCanvas(
  canvas: HTMLCanvasElement,
  pageSegMode: PageSegMode,
  digitsOnly: boolean,
): Promise<GallonsRecognitionCandidate | null> {
  const worker = await getOcrWorker()
  const modeKey = { pageSegMode, digitsOnly }
  if (
    !lastWorkerMode ||
    lastWorkerMode.pageSegMode !== modeKey.pageSegMode ||
    lastWorkerMode.digitsOnly !== modeKey.digitsOnly
  ) {
    await worker.setParameters({
      tessedit_char_whitelist: digitsOnly ? '0123456789.' : '0123456789.GALONSThisale $',
      tessedit_pageseg_mode: pageSegMode,
    })
    lastWorkerMode = modeKey
  }

  const { data } = await worker.recognize(canvas)
  const engineConfidence = Number.isFinite(data.confidence) ? data.confidence : 0
  return candidateFromOcrText(data.text, engineConfidence)
}

async function runPass(
  bitmap: ImageBitmap,
  region: CropRegion,
  threshold: number,
  pageSegMode: PageSegMode,
  digitsOnly: boolean,
): Promise<GallonsRecognitionCandidate | null> {
  const canvas = prepareCanvas(bitmap, region, threshold)
  return recognizeCanvas(canvas, pageSegMode, digitsOnly)
}

export async function readGallonsWithTesseract(
  file: File,
): Promise<GallonsRecognitionCandidate[]> {
  const { PSM } = await import('tesseract.js')
  const bitmap = await createImageBitmap(file)

  try {
    const candidates: GallonsRecognitionCandidate[] = []

    for (const region of FAST_LCD_REGIONS) {
      const read = await runPass(bitmap, region, 145, PSM.SINGLE_LINE, true)
      if (read) {
        candidates.push(read)
        if (shouldStopGallonsRetry(read)) return candidates
      }
    }

    const labeledRead = await runPass(
      bitmap,
      FAST_LCD_REGIONS[0],
      145,
      PSM.SINGLE_LINE,
      false,
    )
    if (labeledRead) {
      candidates.push(labeledRead)
      if (shouldStopGallonsRetry(labeledRead)) return candidates
    }

    const fullFrame = { x: 0, y: 0, width: 1, height: 1, scale: 1.5 }
    const fullRead = await runPass(bitmap, fullFrame, 145, PSM.SINGLE_LINE, true)
    if (fullRead) {
      candidates.push(fullRead)
    }

    return candidates
  } finally {
    bitmap.close()
  }
}
