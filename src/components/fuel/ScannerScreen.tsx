import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useLiveCamera } from '../../hooks/useLiveCamera'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { useQrScanner } from '../../hooks/useQrScanner'
import { parsePumpNumberFromQr } from '../../utils/parsePumpQr'
import { trackProps } from '../../utils/tracking'
import { FullScreenOverlay } from '../ui/FullScreenOverlay'
import { StatusBar } from '../ui/StatusBar'

type ScannerScreenProps = {
  open?: boolean
  onBack: () => void
  onManualEntry: () => void
  onScanComplete?: (value: string) => void
  parseResult?: (text: string) => string | null
  scanFormat?: 'qr' | 'barcode'
  title?: string
  hint?: string
  manualEntryTitle?: string
  manualEntryDescription?: string
  manualEntryAriaLabel?: string
  scanAriaLabel?: string
  readFailedMessage?: string
  readFailedHint?: string
  noCodeDetectedMessage?: string
  noCodeDetectedHint?: string
  trackPrefix?: string
}

type ScannerFeedback = 'none' | 'parse-failed' | 'no-code'

export function ScannerScreen({
  open = true,
  onBack,
  onManualEntry,
  onScanComplete,
  parseResult = parsePumpNumberFromQr,
  scanFormat = 'qr',
  title = 'Scan pump QR',
  hint = 'Align the QR code within the frame',
  manualEntryTitle = 'Having trouble scanning',
  manualEntryDescription = 'Enter pump number manually',
  manualEntryAriaLabel = manualEntryDescription,
  scanAriaLabel = title,
  readFailedMessage,
  readFailedHint,
  noCodeDetectedMessage,
  noCodeDetectedHint,
  trackPrefix = 'scanner',
}: ScannerScreenProps) {
  const { messages, t } = useI18n()
  const cameraCopy = messages.fuel.qrScanner
  const qrCopy = messages.fuel.qrScanner
  const titleId = useId()
  const [detected, setDetected] = useState(false)
  const [feedback, setFeedback] = useState<ScannerFeedback>('none')
  const readFailed = feedback !== 'none'
  const { videoRef, status } = useLiveCamera(open && !detected)

  useEffect(() => {
    if (!open) {
      setDetected(false)
      setFeedback('none')
    }
  }, [open])

  useEffect(() => {
    if (!readFailed) return

    const timer = window.setTimeout(() => setFeedback('none'), 3500)
    return () => window.clearTimeout(timer)
  }, [readFailed])

  const handleDetect = useCallback(
    (value: string) => {
      setDetected(true)
      onScanComplete?.(value)
    },
    [onScanComplete],
  )

  const handleParseFailed = useCallback(() => {
    setFeedback('parse-failed')
  }, [])

  const handleStageTap = useCallback(() => {
    if (detected || status !== 'live') return
    setFeedback('no-code')
  }, [detected, status])

  useQrScanner(
    videoRef,
    open && scanFormat === 'qr' && status === 'live' && !detected,
    parseResult,
    handleDetect,
    handleParseFailed,
  )

  useBarcodeScanner(
    videoRef,
    open && scanFormat === 'barcode' && status === 'live' && !detected,
    parseResult,
    handleDetect,
    handleParseFailed,
  )

  const failedMessage =
    feedback === 'no-code'
      ? (noCodeDetectedMessage ?? qrCopy.noCodeDetected)
      : (readFailedMessage ?? qrCopy.readFailed)
  const failedHint =
    feedback === 'no-code'
      ? (noCodeDetectedHint ?? qrCopy.noCodeDetectedHint)
      : (readFailedHint ?? qrCopy.readFailedHint)

  const showFallbackMessage =
    status === 'unsupported' || status === 'denied' || status === 'error'

  const fallbackMessage =
    status === 'denied'
      ? cameraCopy.cameraDenied
      : status === 'unsupported'
        ? cameraCopy.cameraUnsupported
        : cameraCopy.cameraError

  return (
    <FullScreenOverlay
      open={open}
      onDismiss={onBack}
      labelId={titleId}
      className="scanner-screen"
    >
      <StatusBar />

      <div className="scanner-screen__header">
        <button
          type="button"
          onClick={onBack}
          className="field-target flex shrink-0 items-center justify-center rounded text-white"
          aria-label={t('common.closeScanner')}
          disabled={detected}
          {...trackProps(`${trackPrefix}.back`)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 id={titleId} className="text-base font-semibold text-white">
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onManualEntry}
        className="scanner-vehicle-strip"
        disabled={detected}
        aria-label={manualEntryAriaLabel}
        {...trackProps(`${trackPrefix}.manual-entry`)}
      >
        <div className="scanner-vehicle-strip__copy">
          <p className="scanner-vehicle-strip__title">{manualEntryTitle}</p>
          <p className="scanner-vehicle-strip__description">
            {manualEntryDescription}
          </p>
        </div>
        <ChevronRight className="scanner-vehicle-strip__chevron" aria-hidden />
      </button>

      <button
        type="button"
        className={`scanner-camera-stage scanner-camera-stage--qr${
          scanFormat === 'barcode' ? ' scanner-camera-stage--barcode' : ''
        }${status === 'live' && !detected ? ' scanner-camera-stage--interactive' : ''}`}
        aria-label={scanAriaLabel}
        disabled={detected || status !== 'live'}
        onClick={handleStageTap}
        {...trackProps(`${trackPrefix}.viewfinder-tap`)}
      >
        <video
          ref={videoRef}
          className={`scanner-camera-stage__video${
            status === 'live' ? ' scanner-camera-stage__video--live' : ''
          }`}
          playsInline
          muted
          autoPlay
          aria-hidden
        />

        {status === 'starting' && (
          <div className="scanner-camera-stage__status" role="status">
            <Loader2 className="scanner-viewfinder-processing__icon" aria-hidden />
            <span>{cameraCopy.cameraStarting}</span>
          </div>
        )}

        {showFallbackMessage && (
          <div className="scanner-camera-stage__status" role="status">
            <p className="scanner-camera-stage__message">{fallbackMessage}</p>
          </div>
        )}

        <div
          className={`scanner-camera-stage__frame${
            scanFormat === 'barcode'
              ? ' scanner-camera-stage__frame--barcode'
              : ' scanner-camera-stage__frame--qr'
          }${readFailed ? ' scanner-camera-stage__frame--error' : ''}`}
          aria-hidden
        >
          <ScannerCorner position="tl" />
          <ScannerCorner position="tr" />
          <ScannerCorner position="bl" />
          <ScannerCorner position="br" />
          <div className="scanner-viewfinder__line" />
        </div>

        {readFailed ? (
          <div className="scanner-camera-stage__read-feedback" role="alert">
            <AlertCircle className="scanner-camera-stage__read-feedback-icon" aria-hidden />
            <p>{failedMessage}</p>
          </div>
        ) : null}

        {detected ? (
          <div className="scanner-viewfinder-processing" role="status">
            <span>{messages.common.done}</span>
          </div>
        ) : null}
      </button>

      <p
        className={`scanner-screen__hint${readFailed ? ' scanner-screen__hint--error' : ''}`}
        role={readFailed ? 'alert' : undefined}
      >
        {readFailed ? failedHint : hint}
      </p>
    </FullScreenOverlay>
  )
}

function ScannerCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positionClass = {
    tl: 'scanner-corner--tl',
    tr: 'scanner-corner--tr',
    bl: 'scanner-corner--bl',
    br: 'scanner-corner--br',
  }[position]

  return <div className={`scanner-corner ${positionClass}`} />
}
