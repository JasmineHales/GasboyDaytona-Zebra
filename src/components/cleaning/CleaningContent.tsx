import {
  ArrowLeft,
  Flag,
  Play,
  Sparkles,
} from 'lucide-react'
import type { CleaningStep } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { PumpConfirmedCard } from '../ui/PumpConfirmedCard'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { TextField } from '../ui/TextField'
import { WorkflowInProgressStatus } from '../ui/WorkflowInProgressStatus'
import { getCleaningProgress } from '../../utils/progress'

type CleaningContentProps = {
  step: CleaningStep
  pumpNumber: string
  finalTime: string
  startedAt: number | null
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
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
  onClearPump,
  onVerifyPump,
  onWrongPump,
  onStartCleaning,
  onFinishCleaning,
  onContinueCleaning,
}: CleaningContentProps) {
  const progress = {
    ...getCleaningProgress(step),
    ...(step === 'cleaning-in-progress' && {
      tone: 'info' as const,
      progressFillClass: 'bg-[var(--color-fleet-info)]',
    }),
  }
  const canVerify =
    step === 'manual-entry-filled' && pumpNumber.trim().length > 0
  const showManualEntry = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ].includes(step)

  return (
    <div className="workflow-stack">
      <ProgressIndicator {...progress} />

      {step === 'verify-pump' && (
        <PumpVerifyDefault onScanPump={onScanPump} onManualEntry={onManualEntry} />
      )}

      {showManualEntry && (
        <>
          <TextField
            label="Manual Entry"
            hint="Enter the pump number displayed on the pump"
            value={pumpNumber}
            placeholder="Enter pump no."
            inputMode="numeric"
            invalid={step === 'manual-entry-error'}
            onChange={onPumpChange}
            onClear={onClearPump}
          />

          <div className="workflow-stack">
            {step === 'manual-entry-error' && (
              <p className="px-3.5 text-sm text-[var(--color-brand-error)]">
                Select another pump
              </p>
            )}

            <button
              type="button"
              onClick={onVerifyPump}
              disabled={!canVerify}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full disabled:cursor-not-allowed disabled:bg-[rgba(45,47,49,0.12)] disabled:text-[rgba(45,47,49,0.38)] disabled:shadow-none"
            >
              Verify Pump
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined fleet-btn-start w-full"
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
            actionIcon={<Play className="h-5 w-5 fill-white" />}
          />
          <button
            type="button"
            onClick={onWrongPump}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full text-[var(--color-brand-error)]"
          >
            Wrong Pump Selected
          </button>
        </>
      )}

      {step === 'cleaning-in-progress' && (
        <>
          <WorkflowInProgressStatus
            icon={<Sparkles className="h-6 w-6" />}
            title="Cleaning in progress"
            subtitle="Take your time — tap finish when you're done"
            note="The timer tracks how long you've been cleaning at this pump"
            pumpNumber={pumpNumber}
            startedAt={startedAt}
          />
          <button
            type="button"
            onClick={onFinishCleaning}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
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
                <span className="inline-flex rounded-full bg-[var(--color-chip-complete-bg)] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-text-success)]">
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
            <p className="text-left text-xs text-[var(--color-text-primary)]">
              Continue cleaning if you&apos;d like to extend the timer.
            </p>
            <button
              type="button"
              onClick={onContinueCleaning}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            >
              Continue Cleaning
            </button>
          </div>
        </>
      )}
    </div>
  )
}
