import { ChevronRight, ScanQrCode } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
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

export function PumpVerifyCard({
  title,
  subtitle,
  buttonLabel,
  scanHint,
  onClick,
  manualEntryLabel,
  onManualEntry,
  quickSelectPump,
  quickSelectHint,
  onQuickSelectPump,
  unlockMode,
  trackScan = 'pump.verify.scan',
  trackManual = 'pump.verify.manual-entry',
  trackQuickSelect = 'pump.verify.quick-select',
}: PumpVerifyCardProps) {
  const { messages, t } = useI18n()
  const quickSelectCopy = messages.fuel.quickSelect
  const resolvedButtonLabel = buttonLabel ?? messages.fuel.scanPump
  const resolvedManualEntryLabel =
    manualEntryLabel ?? messages.fuel.pumpVerify.default.manualEntryLabel
  const resolvedQuickSelectHint =
    quickSelectHint ?? quickSelectCopy.cleaningInProgress

  return (
    <div className="pump-verify-card">
      {(title || subtitle) && (
        <div className="pump-verify-card__copy">
          {title && <p className="pump-verify-card__title">{title}</p>}
          {subtitle && <p className="pump-verify-card__subtitle">{subtitle}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        className={`pump-verify-scan-graphic${
          scanHint ? ' pump-verify-scan-graphic--with-hint' : ''
        }${
          unlockMode === 'remote'
            ? ' pump-verify-scan-graphic--remote'
            : unlockMode === 'on-site'
              ? ' pump-verify-scan-graphic--on-site'
              : ''
        }`}
        aria-label={
          scanHint ? `${resolvedButtonLabel}. ${scanHint}` : resolvedButtonLabel
        }
        {...trackProps(trackScan)}
      >
        <span className="pump-verify-scan-graphic__icon-slot" aria-hidden>
          <ScanQrCode className="pump-verify-scan-graphic__icon" strokeWidth={2.25} />
        </span>
        <span className="pump-verify-scan-graphic__divider" aria-hidden />
        <div className="pump-verify-scan-graphic__copy">
          <span className="pump-verify-scan-graphic__label">{resolvedButtonLabel}</span>
          {scanHint && (
            <span className="pump-verify-scan-graphic__hint">{scanHint}</span>
          )}
        </div>
        <ChevronRight className="pump-verify-scan-graphic__chevron" aria-hidden />
      </button>

      {onManualEntry && (
        <button
          type="button"
          onClick={onManualEntry}
          className="pump-verify-manual"
          {...trackProps(trackManual)}
        >
          <span className="pump-verify-manual__label">{resolvedManualEntryLabel}</span>
          <ChevronRight className="pump-verify-manual__chevron" aria-hidden />
        </button>
      )}

      {quickSelectPump && onQuickSelectPump && (
        <div className="pump-verify-quick-select">
          <p className="pump-verify-quick-select__label">{quickSelectCopy.label}</p>
          <button
            type="button"
            onClick={() => onQuickSelectPump(quickSelectPump)}
            className={`pump-verify-quick-select__option${
              unlockMode === 'remote' ? ' pump-verify-quick-select__option--remote' : ''
            }`}
            {...trackProps(trackQuickSelect)}
          >
            <span className="pump-verify-quick-select__pump">
              {t('fuel.quickSelect.pump', { pump: quickSelectPump })}
            </span>
            {resolvedQuickSelectHint && (
              <span className="pump-verify-quick-select__hint">{resolvedQuickSelectHint}</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
