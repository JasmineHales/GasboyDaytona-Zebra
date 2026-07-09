import { ChevronLeft, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  getLicensePlateOcrInitState,
  readLicensePlateFromPhoto,
  revokeLicensePlateImageUri,
  warmLicensePlateOcrWorker,
} from '../../utils/readLicensePlateFromPhoto'
import { trackProps } from '../../utils/tracking'
import { FullScreenOverlay } from '../ui/FullScreenOverlay'
import { StatusBar } from '../ui/StatusBar'
import { TextField } from '../ui/TextField'

export type VehiclePlateScanConfirmPayload = {
  plate: string
  ocrRawText: string
  ocrConfidence: number
  imageUri: string
}

type ScannerPhase = 'processing' | 'review'

const PROCESSING_TIMEOUT_MS = 30_000

type VehiclePlateScannerScreenProps = {
  file: File
  onBack: () => void
  onRequestRetake: () => void
  onConfirm: (payload: VehiclePlateScanConfirmPayload) => void
  trackPrefix?: string
}

function normalizePlateInput(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
}

function isValidPlateValue(value: string) {
  const normalized = normalizePlateInput(value)
  return normalized.length >= 4 && normalized.length <= 12
}

export function VehiclePlateScannerScreen({
  file,
  onBack,
  onRequestRetake,
  onConfirm,
  trackPrefix = 'vehicle-search.plate-scanner',
}: VehiclePlateScannerScreenProps) {
  const { messages } = useI18n()
  const copy = messages.vehicleSearch.plateScanner
  const titleId = useId()
  const imageUriRef = useRef<string | undefined>(undefined)
  const [phase, setPhase] = useState<ScannerPhase>('processing')
  const [plateDraft, setPlateDraft] = useState('')
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [ocrMeta, setOcrMeta] = useState<{ ocrRawText: string; ocrConfidence: number } | null>(
    null,
  )
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [manualFallback, setManualFallback] = useState(false)

  useEffect(() => {
    warmLicensePlateOcrWorker()
    setModelsLoading(getLicensePlateOcrInitState() === 'loading')

    const intervalId = window.setInterval(() => {
      const state = getLicensePlateOcrInitState()
      setModelsLoading(state === 'loading')
      if (state === 'ready' || state === 'failed') {
        window.clearInterval(intervalId)
      }
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(
    () => () => {
      revokeLicensePlateImageUri(imageUriRef.current)
    },
    [],
  )

  useEffect(() => {
    let settled = false
    const storedImageUri = URL.createObjectURL(file)

    const finishReview = (options: {
      plate: string
      ocrRawText: string
      ocrConfidence: number
      manual: boolean
    }) => {
      if (settled) return
      settled = true

      revokeLicensePlateImageUri(imageUriRef.current)
      imageUriRef.current = storedImageUri
      setPreviewUri(storedImageUri)
      setPlateDraft(options.plate)
      setOcrMeta({
        ocrRawText: options.ocrRawText,
        ocrConfidence: options.ocrConfidence,
      })
      setManualFallback(options.manual)
      setPhase('review')
    }

    setPhase('processing')
    setFieldError(null)
    setPlateDraft('')
    setOcrMeta(null)
    setManualFallback(false)
    setPreviewUri(null)

    const timeoutId = window.setTimeout(() => {
      finishReview({
        plate: '',
        ocrRawText: '',
        ocrConfidence: 0,
        manual: true,
      })
    }, PROCESSING_TIMEOUT_MS)

    void readLicensePlateFromPhoto(file)
      .then((result) => {
        window.clearTimeout(timeoutId)
        if (result.imageUri !== storedImageUri) {
          revokeLicensePlateImageUri(result.imageUri)
        }
        finishReview({
          plate: result.plate,
          ocrRawText: result.ocrRawText,
          ocrConfidence: result.ocrConfidence,
          manual: !result.plate,
        })
      })
      .catch(() => {
        window.clearTimeout(timeoutId)
        finishReview({
          plate: '',
          ocrRawText: '',
          ocrConfidence: 0,
          manual: true,
        })
      })

    return () => {
      settled = true
      window.clearTimeout(timeoutId)
      if (imageUriRef.current !== storedImageUri) {
        revokeLicensePlateImageUri(storedImageUri)
      }
    }
  }, [file])

  const handleConfirm = useCallback(() => {
    const normalized = normalizePlateInput(plateDraft)
    if (!isValidPlateValue(normalized)) {
      setFieldError(copy.enterPlateHint)
      return
    }

    if (!imageUriRef.current) return

    onConfirm({
      plate: normalized,
      ocrRawText: ocrMeta?.ocrRawText ?? '',
      ocrConfidence: ocrMeta?.ocrConfidence ?? 0,
      imageUri: imageUriRef.current,
    })
  }, [copy.enterPlateHint, ocrMeta, onConfirm, plateDraft])

  const handleRetake = useCallback(() => {
    onBack()
    onRequestRetake()
  }, [onBack, onRequestRetake])

  const reviewLead = manualFallback ? copy.manualFallbackLead : copy.reviewLead
  const reviewFieldHint = manualFallback ? copy.manualFallbackHint : copy.reviewFieldHint

  return (
    <FullScreenOverlay
      open
      onDismiss={phase === 'processing' ? onBack : handleRetake}
      labelId={titleId}
      className="scanner-screen"
    >
      <StatusBar />

      <div className="scanner-screen__header">
        <button
          type="button"
          onClick={phase === 'processing' ? onBack : handleRetake}
          className="field-target flex shrink-0 items-center justify-center rounded text-white"
          aria-label={messages.common.back}
          {...trackProps(`${trackPrefix}.back`)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 id={titleId} className="text-base font-semibold text-white">
          {copy.title}
        </h2>
      </div>

      <div className="scanner-photo-stage">
        {phase === 'processing' ? (
          <div className="scanner-viewfinder-processing" role="status">
            <Loader2 className="scanner-viewfinder-processing__icon" aria-hidden />
            <span>{modelsLoading ? copy.loadingModels : copy.processing}</span>
          </div>
        ) : null}

        {phase === 'review' ? (
          <div className="scanner-photo-stage__review">
            {previewUri ? (
              <img
                src={previewUri}
                alt=""
                className="scanner-photo-stage__preview"
              />
            ) : null}
            <p
              className={`scanner-photo-stage__review-lead${
                manualFallback ? ' scanner-photo-stage__review-lead--manual' : ''
              }`}
            >
              {reviewLead}
            </p>
            <TextField
              label={copy.detectedLabel}
              hint={reviewFieldHint}
              value={plateDraft}
              placeholder={copy.enterPlatePlaceholder}
              autoComplete="off"
              error={fieldError ?? undefined}
              invalid={Boolean(fieldError)}
              onChange={(value) => {
                setFieldError(null)
                setPlateDraft(normalizePlateInput(value))
              }}
            />
          </div>
        ) : null}
      </div>

      {phase === 'review' ? (
        <div className="scanner-gallons-actions">
          <button
            type="button"
            onClick={handleConfirm}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            {...trackProps(`${trackPrefix}.confirm`)}
          >
            {copy.confirm}
          </button>
          <button
            type="button"
            onClick={handleRetake}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps(`${trackPrefix}.retake`)}
          >
            {copy.retake}
          </button>
        </div>
      ) : null}
    </FullScreenOverlay>
  )
}
