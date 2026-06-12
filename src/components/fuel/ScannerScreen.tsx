import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBar } from '../ui/StatusBar'

type ScannerScreenProps = {
  onBack: () => void
  onManualEntry: () => void
  onScanComplete?: () => void
  title?: string
}

export function ScannerScreen({
  onBack,
  onManualEntry,
  onScanComplete,
  title = 'Scan Pump QR',
}: ScannerScreenProps) {
  return (
    <div className="app-overlay scanner-screen">
      <StatusBar />

      <div className="scanner-screen__header">
        <button
          type="button"
          onClick={onBack}
          className="field-target flex h-14 w-14 items-center justify-center rounded-full text-white"
          aria-label="Close scanner"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <p className="text-base font-semibold text-white">{title}</p>
      </div>

      <button
        type="button"
        onClick={onManualEntry}
        className="scanner-vehicle-strip"
        aria-label="Enter pump number manually"
      >
        <div className="scanner-vehicle-strip__copy">
          <p className="scanner-vehicle-strip__title">Having trouble scanning</p>
          <p className="scanner-vehicle-strip__description">
            Enter pump number manually
          </p>
        </div>
        <ChevronRight className="scanner-vehicle-strip__chevron" aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => onScanComplete?.()}
        className="scanner-viewfinder-area"
        aria-label="Tap to scan pump QR code"
      >
        <div className="scanner-viewfinder" aria-hidden>
          <ScannerCorner position="tl" />
          <ScannerCorner position="tr" />
          <ScannerCorner position="bl" />
          <ScannerCorner position="br" />
          <div className="scanner-viewfinder__line" />
        </div>
      </button>

      <p className="scanner-screen__hint">Align the QR code within the frame</p>
    </div>
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
