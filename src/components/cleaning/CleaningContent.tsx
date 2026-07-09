import type { CleaningStep } from '../../types/flow'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { TextField, textFieldKeySubmit } from '../ui/TextField'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type CleaningContentProps = {
  step: CleaningStep
  pumpNumber: string
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
  onQuickSelectPump: (pump: string) => void
  onClearPump: () => void
}

export function CleaningContent({
  step,
  pumpNumber,
  onScanPump,
  onManualEntry,
  onBackToScan,
  onPumpChange,
  onQuickSelectPump,
  onClearPump,
}: CleaningContentProps) {
  const { messages } = useI18n()
  const cleaningCopy = messages.cleaning
  const showManualEntry = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ].includes(step)

  const submitPumpNumber = () => {
    const value = pumpNumber.trim()
    if (value) onQuickSelectPump(value)
  }

  return (
    <div className="workflow-stack">
      {step === 'verify-pump' && (
        <PumpVerifyDefault
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          scanLabel={cleaningCopy.scanWorkstation}
          scanHint={cleaningCopy.scanWorkstationHint}
          manualEntryLabel={cleaningCopy.enterWorkstationNumber}
          trackPrefix="cleaning.verify"
        />
      )}

      {showManualEntry && (
        <>
          <TextField
            value={pumpNumber}
            placeholder={cleaningCopy.enterWorkstationNo}
            aria-label={cleaningCopy.enterWorkstationNo}
            inputMode="numeric"
            invalid={step === 'manual-entry-error'}
            error={step === 'manual-entry-error' ? cleaningCopy.selectAnotherWorkstation : undefined}
            onChange={onPumpChange}
            onBlur={submitPumpNumber}
            onKeyDown={(event) => textFieldKeySubmit(event, onQuickSelectPump)}
            onClear={onClearPump}
            clearTrackTag="cleaning.pump.clear"
          />

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-borderless workflow-scan-link workflow-scan-link--start w-full"
            {...trackProps('cleaning.back-to-scan')}
          >
            {cleaningCopy.backToScan}
          </button>
        </>
      )}

      {step === 'cleaning-complete' && (
        <TextField
          label={cleaningCopy.manualEntry}
          value={pumpNumber}
          readOnly
          onClear={onClearPump}
          clearTrackTag="cleaning.pump.clear"
        />
      )}
    </div>
  )
}
