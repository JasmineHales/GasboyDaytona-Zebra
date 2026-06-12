import { QrCode } from 'lucide-react'

type PumpVerifyCardProps = {
  title?: string
  subtitle?: string
  buttonLabel?: string
  scanHint?: string
  onClick: () => void
  manualEntryLabel?: string
  onManualEntry?: () => void
  unlockMode?: 'remote' | 'on-site'
}

function ScanCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positionClass = {
    tl: 'pump-verify-scan-corner--tl',
    tr: 'pump-verify-scan-corner--tr',
    bl: 'pump-verify-scan-corner--bl',
    br: 'pump-verify-scan-corner--br',
  }[position]

  return <span className={`pump-verify-scan-corner ${positionClass}`} aria-hidden />
}

export function PumpVerifyCard({
  title = 'Scan pump QR',
  subtitle = 'Point at the QR on your pump',
  buttonLabel = 'Scan Pump',
  scanHint = 'Point at the QR on your pump',
  onClick,
  manualEntryLabel = 'Enter pump number',
  onManualEntry,
  unlockMode,
}: PumpVerifyCardProps) {
  return (
    <div
      className={`pump-verify-card${unlockMode === 'remote' ? ' pump-verify-card--remote' : ''}`}
    >
      {(title || subtitle) && (
        <div className="pump-verify-card__copy">
          {title && <p className="pump-verify-card__title">{title}</p>}
          {subtitle && <p className="pump-verify-card__subtitle">{subtitle}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        className={`pump-verify-scan-graphic${unlockMode === 'remote' ? ' pump-verify-scan-graphic--remote' : ''}`}
        aria-label={buttonLabel}
      >
        <div className="pump-verify-scan-graphic__frame" aria-hidden>
          <ScanCorner position="tl" />
          <ScanCorner position="tr" />
          <ScanCorner position="bl" />
          <ScanCorner position="br" />
          <div className="pump-verify-scan-graphic__ring" />
          <QrCode className="pump-verify-scan-graphic__icon" />
        </div>
        <span className="pump-verify-scan-graphic__label">{buttonLabel}</span>
        <span className="pump-verify-scan-graphic__hint">{scanHint}</span>
      </button>

      {onManualEntry && (
        <button type="button" onClick={onManualEntry} className="pump-verify-manual">
          {manualEntryLabel}
        </button>
      )}
    </div>
  )
}
