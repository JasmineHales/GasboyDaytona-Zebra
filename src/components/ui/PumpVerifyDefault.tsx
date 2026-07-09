import { useI18n } from '../../i18n/I18nProvider'
import { FuelUnlockModeInfo } from '../fuel/FuelUnlockModeInfo'
import { PumpVerifyCard } from './PumpVerifyCard'
import { getPumpVerifyCopy } from '../../utils/pumpVerifyCopy'

type PumpVerifyDefaultProps = {
  onScanPump: () => void
  onManualEntry: () => void
  scanLabel?: string
  scanHint?: string
  manualEntryLabel?: string
  quickSelectPump?: string
  quickSelectHint?: string
  onQuickSelectPump?: (pump: string) => void
  unlockMode?: 'remote' | 'on-site'
  onSwitchUnlockMode?: () => void
  trackPrefix?: string
}

export function PumpVerifyDefault({
  onScanPump,
  onManualEntry,
  scanLabel,
  scanHint,
  manualEntryLabel,
  quickSelectPump,
  quickSelectHint,
  onQuickSelectPump,
  unlockMode,
  onSwitchUnlockMode,
  trackPrefix = 'pump.verify',
}: PumpVerifyDefaultProps) {
  const { messages } = useI18n()
  const pumpVerifyCopy = getPumpVerifyCopy(messages.fuel.pumpVerify)
  const modeCopy = unlockMode ? pumpVerifyCopy[unlockMode] : pumpVerifyCopy.default

  return (
    <div className="workflow-stack">
      {unlockMode && (
        <FuelUnlockModeInfo
          mode={unlockMode}
          onModeChange={(next) => {
            if (next !== unlockMode) onSwitchUnlockMode?.()
          }}
          trackPrefix={trackPrefix}
        />
      )}

      <PumpVerifyCard
        buttonLabel={scanLabel ?? modeCopy.scanLabel}
        scanHint={scanHint ?? modeCopy.scanHint}
        manualEntryLabel={manualEntryLabel ?? modeCopy.manualEntryLabel}
        onClick={onScanPump}
        onManualEntry={onManualEntry}
        quickSelectPump={quickSelectPump}
        quickSelectHint={quickSelectHint}
        onQuickSelectPump={onQuickSelectPump}
        unlockMode={unlockMode}
        trackScan={`${trackPrefix}.scan`}
        trackManual={`${trackPrefix}.manual-entry`}
        trackQuickSelect={`${trackPrefix}.quick-select`}
      />
    </div>
  )
}
