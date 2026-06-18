import { QrCode } from 'lucide-react'
import { trackProps } from '../../utils/tracking'

type PumpVerifyCardProps = {
  title?: string
  subtitle?: string
  buttonLabel?: string
  scanHint?: string
  onClick: () => void
  manualEntryLabel?: string
  onManualEntry?: () => void
  quickSelectPump?: string
  quickSelectHint?: string
  onQuickSelectPump?: (pump: string) => void
  unlockMode?: 'remote' | 'on-site'
  trackScan?: string
  trackManual?: string
  trackQuickSelect?: string
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
  title,
  subtitle,
  buttonLabel = 'Scan Pump',
  scanHint,
  onClick,
  manualEntryLabel = 'Enter pump number',
  onManualEntry,
  quickSelectPump,
  quickSelectHint = 'Cleaning in progress at this pump',
  onQuickSelectPump,
  unlockMode,
  trackScan = 'pump.verify.scan',
  trackManual = 'pump.verify.manual-entry',
  trackQuickSelect = 'pump.verify.quick-select',
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
        {...trackProps(trackScan)}
      >
        <div className="pump-verify-scan-graphic__frame" aria-hidden>
          <ScanCorner position="tl" />
          <ScanCorner position="tr" />
          <ScanCorner position="bl" />
          <ScanCorner position="br" />
          <div className="pump-verify-scan-graphic__ring" />
          <QrCode className="pump-verify-scan-graphic__icon" />
          <div className="pump-verify-scan-graphic__line" />
        </div>
        <div className="pump-verify-scan-graphic__copy">
          <span className="pump-verify-scan-graphic__label">{buttonLabel}</span>
          {scanHint && (
            <span className="pump-verify-scan-graphic__hint">{scanHint}</span>
          )}
        </div>
      </button>

      {onManualEntry && (
        <button
          type="button"
          onClick={onManualEntry}
          className="pump-verify-manual"
          {...trackProps(trackManual)}
        >
          {manualEntryLabel}
        </button>
      )}

      {quickSelectPump && onQuickSelectPump && (
        <div className="pump-verify-quick-select">
          <p className="pump-verify-quick-select__label">Quick select</p>
          <button
            type="button"
            onClick={() => onQuickSelectPump(quickSelectPump)}
            className={`pump-verify-quick-select__option${unlockMode === 'remote' ? ' pump-verify-quick-select__option--remote' : ''}`}
            {...trackProps(trackQuickSelect)}
          >
            <span className="pump-verify-quick-select__pump">
              Pump {quickSelectPump}
            </span>
            {quickSelectHint && (
              <span className="pump-verify-quick-select__hint">{quickSelectHint}</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
