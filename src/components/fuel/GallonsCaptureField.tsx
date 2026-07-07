import { Camera } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useCameraCapture } from '../../hooks/useCameraCapture'
import type { GallonsCaptureRecord } from '../../types/gallonsCapture'
import {
  buildGallonsCaptureAudit,
  persistGallonsCaptureAudit,
} from '../../utils/gallonsCaptureAudit'
import {
  isValidGallonsValue,
  normalizeGallonsInput,
} from '../../utils/gallonsInput'
import {
  revokeGallonsImageUri,
  warmGallonsOcrWorker,
} from '../../utils/readGallonsFromPumpPhoto'
import { trackProps } from '../../utils/tracking'
import { TextField } from '../ui/TextField'
import {
  PumpGallonsScannerScreen,
  type PumpGallonsScanConfirmPayload,
} from './PumpGallonsScannerScreen'

const MANUAL_GALLONS_OPTIONS = { maxDecimals: 2 } as const

type GallonsCaptureFieldProps = {
  value: string
  onChange: (value: string) => void
  onCaptureRecord?: (record: GallonsCaptureRecord) => void
  vehicleId?: string
  jobId?: string
  clearTrackTag?: string
  trackPrefix?: string
}

export function GallonsCaptureField({
  value,
  onChange,
  onCaptureRecord,
  vehicleId,
  jobId,
  clearTrackTag = 'fuel.gallons.clear',
  trackPrefix = 'fuel.gallons',
}: GallonsCaptureFieldProps) {
  const { messages } = useI18n()
  const fuelCopy = messages.fuel
  const scannerCopy = fuelCopy.gallonsScanner
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [captureSession, setCaptureSession] = useState(0)
  const [readError, setReadError] = useState<string | null>(null)
  const lastManualAuditRef = useRef<string | null>(null)

  useEffect(() => {
    warmGallonsOcrWorker()
  }, [])

  const closeScanner = useCallback(() => {
    setCapturedFile(null)
  }, [])

  const handlePhotoSelected = useCallback((file: File) => {
    setCapturedFile(file)
    setCaptureSession((session) => session + 1)
  }, [])

  const { openCamera, inputRef, handleInputChange } = useCameraCapture({
    onCapture: handlePhotoSelected,
    onCancel: closeScanner,
  })

  const saveCaptureRecord = (record: GallonsCaptureRecord) => {
    persistGallonsCaptureAudit(record)
    onCaptureRecord?.(record)
  }

  const handleManualChange = (nextValue: string) => {
    setReadError(null)
    const normalized = normalizeGallonsInput(nextValue, MANUAL_GALLONS_OPTIONS)
    onChange(normalized)

    if (
      isValidGallonsValue(normalized, MANUAL_GALLONS_OPTIONS) &&
      lastManualAuditRef.current !== normalized
    ) {
      lastManualAuditRef.current = normalized
      saveCaptureRecord(
        buildGallonsCaptureAudit({
          gallonsValue: normalized,
          captureMethod: 'manual',
          vehicleId,
          jobId,
        }),
      )
    }
  }

  const handleScanConfirm = (payload: PumpGallonsScanConfirmPayload) => {
    setReadError(null)
    onChange(payload.gallons)
    saveCaptureRecord(
      buildGallonsCaptureAudit({
        gallonsValue: payload.gallons,
        captureMethod: 'scan',
        ocrRawText: payload.ocrRawText,
        ocrConfidence: payload.ocrConfidence,
        imageUri: payload.imageUri,
        vehicleId,
        jobId,
      }),
    )
    revokeGallonsImageUri(payload.imageUri)
    closeScanner()
  }

  const startScan = () => {
    openCamera()
  }

  const requestRetake = () => {
    openCamera()
  }

  return (
    <>
      <div className="workflow-stack">
        <TextField
          label={fuelCopy.gallonsPumped}
          value={value}
          placeholder={fuelCopy.enterGallons}
          inputMode="decimal"
          error={readError ?? undefined}
          invalid={Boolean(readError)}
          onChange={handleManualChange}
          onClear={() => {
            setReadError(null)
            lastManualAuditRef.current = null
            onChange('')
          }}
          clearTrackTag={clearTrackTag}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="fleet-sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={startScan}
          className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          {...trackProps(`${trackPrefix}.scan`)}
        >
          <Camera className="h-5 w-5" aria-hidden />
          {scannerCopy.scanButton}
        </button>
      </div>

      {capturedFile ? (
        <PumpGallonsScannerScreen
          key={captureSession}
          file={capturedFile}
          onBack={closeScanner}
          onRequestRetake={requestRetake}
          onConfirm={handleScanConfirm}
          trackPrefix={`${trackPrefix}.scanner`}
        />
      ) : null}
    </>
  )
}
