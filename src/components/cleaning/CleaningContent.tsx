import {
  ArrowLeft,
  Flag,
  Play,
} from 'lucide-react'
import type { CleaningStep } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { PumpConfirmedCard } from '../ui/PumpConfirmedCard'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { TextField } from '../ui/TextField'
import { WorkflowInProgressStatus } from '../ui/WorkflowInProgressStatus'
import { getCleaningProgress } from '../../utils/progress'
import { isUnavailablePump } from '../../utils/pump'
import { getFuelQuickSelectHint } from '../../utils/pumpQuickSelect'
import { PumpQuickSelect } from '../ui/PumpQuickSelect'
import { trackProps } from '../../utils/tracking'

type CleaningContentProps = {
  step: CleaningStep
  pumpNumber: string
  finalTime: string
  startedAt: number | null
  fuelActivePump?: string | null
  fuelQuickSelectInProgress?: boolean
  unavailablePumps?: number[]
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
  onQuickSelectPump: (pump: string) => void
  onClearPump: () => void
  onVerifyPump: () => void
  onWrongPump: () => void
  onStartCleaning: () => void
  onFinishCleaning: () => void
  onContinueCleaning: () => void
}

export function CleaningContent({
  step,
  pumpNumber,
  finalTime,
  startedAt,
  onScanPump,
  onManualEntry,
  onBackToScan,
  onPumpChange,
  onQuickSelectPump,
  onClearPump,
  onVerifyPump,
  onWrongPump,
  onStartCleaning,
  onFinishCleaning,
  onContinueCleaning,
  fuelActivePump = null,
  fuelQuickSelectInProgress = false,
  unavailablePumps = [],
}: CleaningContentProps) {
  const progress = getCleaningProgress(step)
  const canVerify =
    step === 'manual-entry-filled' && pumpNumber.trim().length > 0
  const showManualEntry = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ].includes(step)
  const fuelQuickSelectPump = (() => {
    const pump = fuelActivePump?.trim()
    if (!pump) return null
    if (isUnavailablePump(pump, unavailablePumps)) return null
    if (step === 'verify-pump') return pump
    if (showManualEntry && !pumpNumber.trim()) return pump
    return null
  })()
  const fuelQuickSelectHint = getFuelQuickSelectHint(fuelQuickSelectInProgress)

  return (
    <div className="workflow-stack">
      <ProgressIndicator {...progress} />

      {step === 'verify-pump' && (
        <PumpVerifyDefault
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          quickSelectPump={fuelQuickSelectPump ?? undefined}
          quickSelectHint={fuelQuickSelectHint}
          onQuickSelectPump={onQuickSelectPump}
          trackPrefix="cleaning.verify"
        />
      )}

      {showManualEntry && (
        <>
          {fuelQuickSelectPump && (
            <PumpQuickSelect
              pump={fuelQuickSelectPump}
              hint={fuelQuickSelectHint}
              onSelect={onQuickSelectPump}
              trackTag="cleaning.verify.quick-select"
            />
          )}

          <TextField
            label="Manual Entry"
            hint="Enter the pump number displayed on the pump"
            value={pumpNumber}
            placeholder="Enter pump no."
            inputMode="numeric"
            invalid={step === 'manual-entry-error'}
            error={step === 'manual-entry-error' ? 'Select another pump' : undefined}
            onChange={onPumpChange}
            onClear={onClearPump}
            clearTrackTag="cleaning.pump.clear"
          />

          <div className="workflow-stack">
            <button
              type="button"
              onClick={onVerifyPump}
              disabled={!canVerify}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
              {...trackProps('cleaning.verify-pump')}
            >
              Verify Pump
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined fleet-btn-start w-full"
            {...trackProps('cleaning.back-to-scan')}
          >
            <ArrowLeft className="h-5 w-5" />
            Back to QR Scanning
          </button>
        </>
      )}

      {step === 'pump-verified' && (
        <>
          <PumpConfirmedCard
            title={`You're at Pump ${pumpNumber}`}
            subtitle="Pump location confirmed. Begin cleaning when ready."
            actionLabel="Start Cleaning"
            onAction={onStartCleaning}
            actionIcon={<Play className="h-5 w-5 fill-current" />}
            trackAction="cleaning.start"
          />
          <button
            type="button"
            onClick={onWrongPump}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps('cleaning.wrong-pump')}
          >
            Cancel
          </button>
        </>
      )}

      {step === 'cleaning-in-progress' && (
        <>
          <WorkflowInProgressStatus
            pumpNumber={pumpNumber}
            startedAt={startedAt}
          />
          <button
            type="button"
            onClick={onFinishCleaning}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            {...trackProps('cleaning.finish')}
          >
            <Flag className="h-5 w-5" />
            Finish Cleaning
          </button>
        </>
      )}

      {step === 'cleaning-complete' && (
        <>
          <div className="overflow-hidden rounded">
            <div className="grid grid-cols-3 border-b-2 border-[var(--color-border)]">
              {['Pump', 'Status', 'Time'].map((heading) => (
                <p
                  key={heading}
                  className="px-4 py-4 text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  {heading}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center">
              <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">
                {pumpNumber}
              </p>
              <div className="px-4 py-4">
                <span className="inline-flex rounded-full bg-[var(--color-chip-complete-bg)] px-2 py-0.5 text-sm font-semibold text-[var(--color-text-success)]">
                  Complete
                </span>
              </div>
              <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">
                {finalTime || '00:01:14'}
              </p>
            </div>
          </div>

          <div className="workflow-stack rounded bg-[var(--color-fleet-info-surface)] px-4 py-3">
            <p className="text-left text-sm font-semibold text-[var(--color-text-primary)]">
              Need more time?
            </p>
            <p className="text-left text-sm font-medium text-[var(--color-text-primary)]">
              Continue cleaning if you&apos;d like to extend the timer.
            </p>
            <button
              type="button"
              onClick={onContinueCleaning}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
              {...trackProps('cleaning.continue')}
            >
              Continue Cleaning
            </button>
          </div>
        </>
      )}
    </div>
  )
}
