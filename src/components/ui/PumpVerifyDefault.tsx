import { FuelUnlockModeInfo } from '../fuel/FuelUnlockModeInfo'
import { PumpVerifyCard } from './PumpVerifyCard'

type PumpVerifyDefaultProps = {
  onScanPump: () => void
  onManualEntry: () => void
  scanLabel?: string
  manualEntryLabel?: string
  unlockMode?: 'remote' | 'on-site'
  onSwitchUnlockMode?: () => void
}

const cardCopy = {
  remote: {
    title: 'Remote unlock',
    subtitle: 'Scan or enter the pump number to unlock in this app',
    scanLabel: 'Scan Pump',
    scanHint: 'Point at the QR on your pump',
    manualEntryLabel: 'Enter pump number',
  },
  'on-site': {
    title: 'Verify pump',
    subtitle: 'After unlocking at the terminal',
    scanLabel: 'Scan Pump',
    scanHint: 'Confirm you are at the correct pump',
    manualEntryLabel: 'Enter pump number',
  },
} as const

export function PumpVerifyDefault({
  onScanPump,
  onManualEntry,
  scanLabel,
  manualEntryLabel,
  unlockMode,
  onSwitchUnlockMode,
}: PumpVerifyDefaultProps) {
  const modeCopy = unlockMode ? cardCopy[unlockMode] : null

  return (
    <div className="workflow-stack">
      <PumpVerifyCard
        title={modeCopy?.title}
        subtitle={modeCopy?.subtitle}
        buttonLabel={scanLabel ?? modeCopy?.scanLabel ?? 'Scan Pump'}
        scanHint={modeCopy?.scanHint ?? 'Point at the QR on your pump'}
        manualEntryLabel={
          manualEntryLabel ?? modeCopy?.manualEntryLabel ?? 'Enter pump number'
        }
        onClick={onScanPump}
        onManualEntry={onManualEntry}
        unlockMode={unlockMode}
      />

      {unlockMode && (
        <FuelUnlockModeInfo mode={unlockMode} onSwitch={onSwitchUnlockMode} />
      )}
    </div>
  )
}
