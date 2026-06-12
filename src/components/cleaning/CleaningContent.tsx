import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  Play,
  QrCode,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CleaningStep } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
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

function formatElapsed(totalSeconds: number) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return { hours, minutes, seconds }
}

function CleaningTimer({ startedAt }: { startedAt: number | null }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  const { hours, minutes, seconds } = formatElapsed(elapsed)

  return (
    <div className="flex items-center justify-center gap-1 text-3xl font-bold tabular-nums text-[var(--color-text-primary)]">
      <span>{hours}</span>
      <span>:</span>
      <span>{minutes}</span>
      <span>:</span>
      <span>{seconds}</span>
    </div>
  )
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
  const progress = getCleaningProgress(step)
  const canVerify =
    step === 'manual-entry-filled' && pumpNumber.trim().length > 0
  const showManualEntry = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ].includes(step)

  return (
    <div className="flex flex-col gap-2">
      <ProgressIndicator {...progress} />

      {step === 'verify-pump' && (
        <>
          <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-brand-info-border)] bg-white p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[var(--color-fleet-info-ring)] opacity-60" />
                <QrCode className="relative h-14 w-14 text-[var(--color-brand-primary)]" />
              </div>
              <p className="text-center text-base font-semibold text-[var(--color-brand-secondary)]">
                Scan Pump QR
              </p>
            </div>
            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              Scan the QR code at your pump
            </p>
            <button
              type="button"
              onClick={onScanPump}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            >
              <QrCode className="h-5 w-5" />
              Scan Pump
            </button>
          </div>

          <button
            type="button"
            onClick={onManualEntry}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          >
            Enter pump number
          </button>
        </>
      )}

      {showManualEntry && (
        <>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">Manual Entry</p>
            <p className="text-sm text-[var(--color-fleet-text-blue-secondary)]">
              Enter the Pump number displayed on the pump
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center rounded border px-3 ${
                step === 'manual-entry-error'
                  ? 'border-[var(--color-fleet-error)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              <input
                type="text"
                inputMode="numeric"
                value={pumpNumber}
                placeholder="Enter pump no."
                onChange={(e) => onPumpChange(e.target.value)}
                className="h-14 flex-1 bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
              />
              {pumpNumber && (
                <button
                  type="button"
                  onClick={onClearPump}
                  className="field-target flex shrink-0 items-center justify-center"
                  aria-label="Clear pump number"
                >
                  <X
                    className={`h-5 w-5 ${
                      step === 'manual-entry-error'
                        ? 'text-[var(--color-brand-error)]'
                        : 'text-[var(--color-brand-primary)]'
                    }`}
                  />
                </button>
              )}
            </div>
            {step === 'manual-entry-error' && (
              <p className="px-3.5 text-sm text-[var(--color-brand-error)]">
                Select another pump
              </p>
            )}

            <button
              type="button"
              onClick={onVerifyPump}
              disabled={!canVerify}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated h-[54px] w-full disabled:cursor-not-allowed disabled:bg-[rgba(45,47,49,0.12)] disabled:text-[rgba(45,47,49,0.38)] disabled:shadow-none"
            >
              Verify Pump
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to QR Scanning
          </button>
        </>
      )}

      {step === 'pump-verified' && (
        <>
          <div className="flex flex-col gap-2 rounded border border-[var(--color-brand-success)] bg-[var(--color-fleet-positive-surface)] px-4 py-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-[50px] w-[50px] shrink-0 text-[var(--color-brand-success)]" />
              <div>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                  Pump {pumpNumber} Verified
                </p>
                <p className="text-xs text-[var(--color-text-primary)]">
                  Your location has been verified
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onStartCleaning}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full"
            >
              <Play className="h-5 w-5 fill-white" />
              Start Cleaning
            </button>
          </div>
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
          <div className="rounded-lg bg-[var(--color-fleet-info-surface)] p-4">
            <div className="flex items-center">
              <div className="flex flex-1 flex-col items-center gap-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fleet-text-secondary)]">
                  Pump
                </p>
                <p className="text-[32px] font-bold leading-none text-[var(--color-fleet-text)]">
                  {pumpNumber}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 border-l border-[var(--color-border)] px-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fleet-text-secondary)]">
                  Time
                </p>
                <CleaningTimer startedAt={startedAt} />
              </div>
            </div>
          </div>
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

          <div className="flex flex-col gap-2 rounded bg-[var(--color-fleet-info-surface)] px-4 py-3">
            <p className="text-center text-sm font-semibold text-[var(--color-text-primary)]">
              Need more time?
            </p>
            <p className="text-center text-xs text-[var(--color-text-primary)]">
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
