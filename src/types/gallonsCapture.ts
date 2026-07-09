export type GallonsCaptureMethod = 'scan' | 'manual'

export type GallonsCaptureRecord = {
  gallonsValue: string
  captureMethod: GallonsCaptureMethod
  ocrRawText?: string
  ocrConfidence?: number
  imageUri?: string
  timestamp: string
  userId: string
  vehicleId: string
  jobId: string
}

export type GallonsOcrSuccess = {
  ok: true
  gallons: string
  ocrRawText: string
  ocrConfidence: number
  imageUri: string
  confident: boolean
}

export type GallonsOcrFailure = {
  ok: false
  ocrRawText?: string
  ocrConfidence?: number
  imageUri?: string
}

export type GallonsOcrResult = GallonsOcrSuccess | GallonsOcrFailure

/** Normalized guide-box crop aligned with the on-screen viewfinder. */
export const PUMP_GALLONS_GUIDE_BOX = {
  x: 0.06,
  y: 0.22,
  width: 0.88,
  height: 0.42,
} as const

export const GALLONS_OCR_CONFIDENCE_THRESHOLD = 65
