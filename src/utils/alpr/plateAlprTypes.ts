export type PlateDetectionMethod = 'paddle-onnx' | 'contour' | 'yolo-onnx' | 'heuristic-region'

export type PlateBoundingBox = {
  x: number
  y: number
  width: number
  height: number
  score: number
  method: PlateDetectionMethod
  angleDeg: number
}

export type PlatePreprocessVariantId =
  | 'adaptive-110'
  | 'adaptive-135'
  | 'adaptive-160'
  | 'contrast-sharpen'
  | 'upscale-sharpen'

export type PlatePreprocessVariant = {
  id: PlatePreprocessVariantId
  threshold: number
  sharpen: boolean
  upscale: boolean
}

export type PlateOcrAttempt = {
  variantId: PlatePreprocessVariantId
  angleDeg: number
  rawText: string
  confidence: number
  correctedText: string
  formatScore: number
  totalScore: number
}

export type PlateAlprDebugImages = {
  original?: string
  detectedCrop?: string
  processedCrop?: string
}

export type PlateAlprPipelineResult = {
  plate: string
  ocrRawText: string
  ocrConfidence: number
  detection: PlateBoundingBox | null
  bestAttempt: PlateOcrAttempt | null
  attempts: PlateOcrAttempt[]
  debug: PlateAlprDebugImages
}
