import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId } from 'react'
import { FullScreenOverlay } from '../ui/FullScreenOverlay'
import { StatusBar } from '../ui/StatusBar'
import { trackProps } from '../../utils/tracking'

type ScannerScreenProps = {
  open?: boolean
  onBack: () => void
  onManualEntry: () => void
  onScanComplete?: () => void
  title?: string
  hint?: string
  manualEntryTitle?: string
  manualEntryDescription?: string
  manualEntryAriaLabel?: string
  scanAriaLabel?: string
  trackPrefix?: string
}

export function ScannerScreen({
  open = true,
  onBack,
  onManualEntry,
  onScanComplete,
  title = 'Scan pump QR',
  hint = 'Align the QR code within the frame',
  manualEntryTitle = 'Having trouble scanning',
  manualEntryDescription = 'Enter pump number manually',
  manualEntryAriaLabel = manualEntryDescription,
  scanAriaLabel = title,
  trackPrefix = 'scanner',
}: ScannerScreenProps) {
  const titleId = useId()

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
          className="field-target flex shrink-0 items-center justify-center rounded-full text-white"
          aria-label="Close scanner"
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
        onClick={() => onScanComplete?.()}
        className="scanner-viewfinder-area"
        aria-label={scanAriaLabel}
        {...trackProps(`${trackPrefix}.scan-complete`)}
      >
        <div className="scanner-viewfinder" aria-hidden>
          <ScannerCorner position="tl" />
          <ScannerCorner position="tr" />
          <ScannerCorner position="bl" />
          <ScannerCorner position="br" />
          <div className="scanner-viewfinder__line" />
        </div>
      </button>

      <p className="scanner-screen__hint">{hint}</p>
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
