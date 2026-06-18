import { FuelUnlockModeInfo } from '../fuel/FuelUnlockModeInfo'
import { PumpVerifyCard } from './PumpVerifyCard'
import { pumpVerifyCopy } from '../../utils/pumpVerifyCopy'

type PumpVerifyDefaultProps = {
  onScanPump: () => void
  onManualEntry: () => void
  scanLabel?: string
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
  manualEntryLabel,
  quickSelectPump,
  quickSelectHint,
  onQuickSelectPump,
  unlockMode,
  onSwitchUnlockMode,
  trackPrefix = 'pump.verify',
}: PumpVerifyDefaultProps) {
  const modeCopy = unlockMode ? pumpVerifyCopy[unlockMode] : pumpVerifyCopy.default

  return (
    <div className="workflow-stack">
      <PumpVerifyCard
        buttonLabel={scanLabel ?? modeCopy.scanLabel}
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

      {unlockMode && (
        <FuelUnlockModeInfo
          mode={unlockMode}
          onSwitch={onSwitchUnlockMode}
          trackPrefix={trackPrefix}
        />
      )}
    </div>
  )
}
