import type { GallonsCaptureRecord } from '../types/gallonsCapture'
import { readSsoUser } from './auth'
import { isTutorialModeActive } from './tutorialModeState'

const AUDIT_LOG_KEY = 'remote-off-gallons-capture-audit'

type BuildGallonsCaptureAuditInput = {
  gallonsValue: string
  captureMethod: GallonsCaptureRecord['captureMethod']
  ocrRawText?: string
  ocrConfidence?: number
  imageUri?: string
  vehicleId?: string
  jobId?: string
}

export function buildGallonsCaptureAudit(
  input: BuildGallonsCaptureAuditInput,
): GallonsCaptureRecord {
  const user = readSsoUser()

  return {
    gallonsValue: input.gallonsValue,
    captureMethod: input.captureMethod,
    ocrRawText: input.ocrRawText,
    ocrConfidence: input.ocrConfidence,
    imageUri: input.imageUri,
    timestamp: new Date().toISOString(),
    userId: user?.email ?? user?.name ?? 'unknown',
    vehicleId: input.vehicleId ?? '',
    jobId: input.jobId ?? '',
  }
}

export function persistGallonsCaptureAudit(record: GallonsCaptureRecord) {
  if (isTutorialModeActive()) return

  try {
    const raw = sessionStorage.getItem(AUDIT_LOG_KEY)
    const existing = raw ? (JSON.parse(raw) as GallonsCaptureRecord[]) : []
    sessionStorage.setItem(
      AUDIT_LOG_KEY,
      JSON.stringify([...existing, record].slice(-100)),
    )
  } catch {
    // Ignore storage errors in private mode / quota limits.
  }

  if (import.meta.env.DEV) {
    console.info('[gallons-capture]', record)
  }
}

export function readGallonsCaptureAuditLog(): GallonsCaptureRecord[] {
  try {
    const raw = sessionStorage.getItem(AUDIT_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GallonsCaptureRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
