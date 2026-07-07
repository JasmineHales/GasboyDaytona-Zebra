import type { InferenceSession } from 'onnxruntime-common'
import {
  DEFAULT_MODEL_URLS,
  DetectionService,
  type Box,
} from 'ppu-paddle-ocr/web'
import { mergePlateDetections, scorePlateBoundingBox } from './plateDetectorShared'
import type { PlateBoundingBox } from './plateAlprTypes'
import { fetchArrayBufferWithRetry, isLikelyOnnxBuffer, safeAsync, withTimeout } from './plateAlprUtils'

const PADDLE_DETECT_TIMEOUT_MS = 4_000

let detectorPromise: Promise<DetectionService | null> | null = null
let detectorState: 'idle' | 'loading' | 'ready' | 'failed' | 'disabled' = 'idle'

async function createDetectionSession(): Promise<InferenceSession | null> {
  const buffer = await fetchArrayBufferWithRetry(DEFAULT_MODEL_URLS.detection, {
    timeoutMs: 12_000,
    retries: 1,
  })
  if (!isLikelyOnnxBuffer(buffer)) {
    throw new Error('Plate detection model response was not a valid ONNX file')
  }

  const ort = await import('onnxruntime-web')
  return ort.InferenceSession.create(buffer, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  })
}

async function getPaddlePlateDetector(): Promise<DetectionService | null> {
  if (detectorState === 'disabled' || detectorState === 'failed') return null
  if (detectorPromise) return detectorPromise

  detectorState = 'loading'
  detectorPromise = safeAsync(
    'paddle-detector-init',
    async () => {
      const session = await withTimeout(
        createDetectionSession(),
        PADDLE_DETECT_TIMEOUT_MS,
        'paddle detector init',
      )
      if (!session) return null
      detectorState = 'ready'
      return new DetectionService(session, {
        maxSideLength: 960,
        minimumAreaThreshold: 40,
      })
    },
    null,
  ).then((detector) => {
    if (!detector) {
      detectorState = 'failed'
      detectorPromise = null
    }
    return detector
  })

  return detectorPromise
}

export function getPlateDetectorInitState(): 'idle' | 'loading' | 'ready' | 'failed' {
  if (detectorState === 'disabled') return 'failed'
  return detectorState
}

export function warmPlateDetector() {
  if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_PLATE_ONNX === 'true') {
    detectorState = 'disabled'
    return
  }
  void getPaddlePlateDetector()
}

function boxToPlateDetection(box: Box, imageWidth: number, imageHeight: number): PlateBoundingBox | null {
  return scorePlateBoundingBox(box, imageWidth, imageHeight, 'paddle-onnx', 0.62)
}

export async function detectPlatesWithPaddleOnnx(
  canvas: HTMLCanvasElement,
): Promise<PlateBoundingBox[]> {
  return safeAsync(
    'paddle-detect',
    async () => {
      const detector = await getPaddlePlateDetector()
      if (!detector) return []

      const boxes = await withTimeout(
        detector.run(canvas),
        PADDLE_DETECT_TIMEOUT_MS,
        'paddle detect',
      )

      const scored = boxes
        .map((box) => boxToPlateDetection(box, canvas.width, canvas.height))
        .filter((value): value is PlateBoundingBox => Boolean(value))

      return mergePlateDetections(scored, 5)
    },
    [],
  )
}
