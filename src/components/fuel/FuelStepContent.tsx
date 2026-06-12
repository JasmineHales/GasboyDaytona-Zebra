import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  Flag,
  Fuel,
  Info,
  Lock,
  Play,
  QrCode,
  RefreshCw,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { FuelStep, FuelTransaction } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { getFuelProgress } from '../../utils/progress'

type FuelStepContentProps = {
  step: FuelStep
  pumpNumber: string
  unlockMode: 'remote' | 'on-site'
  locationType: 'gasboy' | 'non-gasboy'
  fuelGallons: string
  fuelGallonsDispensed: string
  fuelFinalTime: string
  fuelStartedAt: number | null
  isAdditionalFueling: boolean
  fuelTransactions: FuelTransaction[]
  unavailablePumps: number[]
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
  onClearPump: () => void
  onUnlockPump: () => void
  onOnSiteUnlock: () => void
  onStartFueling: () => void
  onCancelUnlock: () => void
  onReportIssue: () => void
  onFinishFueling: () => void
  onSubmitMissingGallons: () => void
  onGallonsChange: (value: string) => void
  onRetry: () => void
}

type ManualFuelingVariant = 'on-site' | 'non-gasboy'

function formatElapsed(totalSeconds: number) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return { hours, minutes, seconds }
}

function FuelTimer({ startedAt }: { startedAt: number | null }) {
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

function FuelStatusChip({ status }: { status: FuelTransaction['status'] }) {
  if (status === 'complete') {
    return (
      <span className="inline-flex rounded-full bg-[var(--color-chip-complete-bg)] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-text-success)]">
        Complete
      </span>
    )
  }
  return (
    <span className="fleet-chip fleet-chip-warning">
      Issue
    </span>
  )
}

function ManualFuelingSummaryTable({
  pump,
  time,
  gallons,
}: {
  pump: string
  time: string
  gallons: string
}) {
  const gallonDisplay = gallons.trim() ? gallons : '--'

  return (
    <div className="overflow-hidden rounded">
      <div className="grid grid-cols-[60px_108px_1fr_1fr] border-b-2 border-[var(--color-border)]">
        {['Pump', 'Status', 'Time', 'Gal'].map((heading) => (
          <p
            key={heading}
            className="px-4 py-4 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {heading}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-[60px_108px_1fr_1fr] items-center">
        <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">{pump}</p>
        <div className="px-4 py-4">
          <FuelStatusChip status="complete" />
        </div>
        <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">{time}</p>
        <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">{gallonDisplay}</p>
      </div>
    </div>
  )
}

function MissingGallonsForm({
  fuelGallons,
  onGallonsChange,
  onSubmit,
}: {
  fuelGallons: string
  onGallonsChange: (value: string) => void
  onSubmit: () => void
}) {
  const canSubmit = fuelGallons.trim().length > 0

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-[var(--color-text-primary)]">Gallons Pumped</p>
      <div className="flex items-center rounded border border-[var(--color-border)] px-3">
        <input
          type="text"
          inputMode="decimal"
          value={fuelGallons}
          placeholder="Enter gallons dispensed"
          onChange={(e) => onGallonsChange(e.target.value)}
          className="h-14 flex-1 bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
        />
        {fuelGallons && (
          <button
            type="button"
            onClick={() => onGallonsChange('')}
            className="field-target flex shrink-0 items-center justify-center"
            aria-label="Clear gallons"
          >
            <X className="h-6 w-6 text-[var(--color-text-secondary)]" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`fleet-btn fleet-btn-md h-12 w-full ${
          canSubmit
            ? 'fleet-btn-contained-info fleet-btn-elevated text-white'
            : 'cursor-not-allowed bg-[rgba(45,47,49,0.12)] text-[rgba(45,47,49,0.38)]'
        }`}
      >
        Submit
      </button>
    </div>
  )
}

function FuelSummaryTable({ rows }: { rows: FuelTransaction[] }) {
  return (
    <div className="overflow-hidden rounded">
      <div className="grid grid-cols-3 border-b-2 border-[var(--color-border)]">
        {['Pump', 'Status', 'Gal'].map((heading) => (
          <p
            key={heading}
            className="px-4 py-4 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {heading}
          </p>
        ))}
      </div>
      {rows.map((row, index) => (
        <div key={`${row.pump}-${row.gallons}-${index}`} className="grid grid-cols-3 items-center">
          <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">{row.pump}</p>
          <div className="px-4 py-4">
            <FuelStatusChip status={row.status} />
          </div>
          <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">{row.gallons}</p>
        </div>
      ))}
    </div>
  )
}

function FuelIssueNotification({
  title,
  message,
  footer,
}: {
  title: string
  message: string
  footer?: ReactNode
}) {
  return (
    <div className="fleet-issue-notification">
      <div className="flex gap-3">
        <AlertTriangle className="h-8 w-8 shrink-0 text-[var(--color-brand-error)]" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-[var(--color-brand-secondary)]">{title}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{message}</p>
        </div>
      </div>
      {footer}
    </div>
  )
}

const reportIssueButtonClass =
  'fleet-btn fleet-btn-lg h-12 w-full border border-[var(--color-fleet-error)] bg-white text-[var(--color-fleet-text-red)]'

function ReportIssueCard({ onReportIssue }: { onReportIssue: () => void }) {
  return (
    <FuelIssueNotification
      title="Pump issue?"
      message="Report the issue to continue fuelling."
      footer={
        <button type="button" onClick={onReportIssue} className={reportIssueButtonClass}>
          Report Issue
          <ChevronRight className="h-5 w-5" />
        </button>
      }
    />
  )
}

function NotEnoughFuelCard({ onReportIssue }: { onReportIssue: () => void }) {
  return (
    <FuelIssueNotification
      title="Didn't get enough fuel?"
      message="Report the issue to continue fuelling at another pump."
      footer={
        <button type="button" onClick={onReportIssue} className={reportIssueButtonClass}>
          Report Issue
          <ChevronRight className="h-5 w-5" />
        </button>
      }
    />
  )
}

function getManualFuelingVariant(
  unlockMode: 'remote' | 'on-site',
  locationType: 'gasboy' | 'non-gasboy',
): ManualFuelingVariant | null {
  if (locationType === 'non-gasboy') return 'non-gasboy'
  if (unlockMode === 'on-site') return 'on-site'
  return null
}

function ManualFuelingInfoBanner({ variant }: { variant: ManualFuelingVariant }) {
  const message =
    variant === 'on-site'
      ? 'Unlock the pump on-site, then verify the pump number and record gallons dispensed.'
      : 'Remote unlock is unavailable at this location. Enter the pump number and gallons dispensed manually.'

  return (
    <div className="flex items-start gap-3 rounded bg-[var(--color-fleet-info-surface)] px-4 py-3">
      <Info className="mt-0.5 h-[22px] w-[22px] shrink-0 text-[var(--color-brand-primary)]" />
      <p className="text-xs text-[var(--color-brand-secondary)]">{message}</p>
    </div>
  )
}

function PumpTimerSummary({
  pumpNumber,
  startedAt,
}: {
  pumpNumber: string
  startedAt: number | null
}) {
  return (
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
          <FuelTimer startedAt={startedAt} />
        </div>
      </div>
    </div>
  )
}

function ManualVerifyPumpForm({
  pumpNumber,
  hasError,
  onPumpChange,
  onClearPump,
  onVerifyPump,
}: {
  pumpNumber: string
  hasError: boolean
  onPumpChange: (value: string) => void
  onClearPump: () => void
  onVerifyPump: () => void
}) {
  const canVerify = pumpNumber.trim().length > 0

  return (
    <>
      <div>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">Manual Entry</p>
        <p className="text-sm text-[var(--color-fleet-text-blue-secondary)]">
          Enter the pump number displayed on the pump
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={`flex items-center rounded border px-3 ${
            hasError
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
                  hasError
                    ? 'text-[var(--color-brand-error)]'
                    : 'text-[var(--color-brand-primary)]'
                }`}
              />
            </button>
          )}
        </div>

        {hasError && (
          <FuelIssueNotification
            title="Pump Unavailable"
            message="This pump cannot be used. Select another pump."
          />
        )}

        <button
          type="button"
          onClick={onVerifyPump}
          disabled={!canVerify}
          className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated h-[54px] w-full disabled:cursor-not-allowed disabled:bg-[rgba(45,47,49,0.12)] disabled:text-[rgba(45,47,49,0.38)] disabled:shadow-none"
        >
          <Lock className="h-5 w-5" />
          Verify Pump
        </button>
      </div>
    </>
  )
}

function ManualPumpConfirmedCard({
  pumpNumber,
  variant,
  onStartFueling,
}: {
  pumpNumber: string
  variant: ManualFuelingVariant
  onStartFueling: () => void
}) {
  const title =
    variant === 'non-gasboy'
      ? `Pump ${pumpNumber} Verified`
      : `Pump ${pumpNumber} Unlocked`
  const subtitle =
    variant === 'non-gasboy'
      ? 'Your location has been verified'
      : 'Begin fueling, then record gallons dispensed when complete'

  return (
    <div className="flex flex-col gap-2 rounded border border-[var(--color-brand-success)] bg-[var(--color-fleet-positive-surface)] px-4 py-3">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-[50px] w-[50px] shrink-0 text-[var(--color-brand-success)]" />
        <div>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{title}</p>
          <p className="text-xs text-[var(--color-text-primary)]">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onStartFueling}
        className="fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full"
      >
        <Play className="h-5 w-5 fill-white" />
        Start Fueling
      </button>
    </div>
  )
}

function ManualFuelingInProgress({
  pumpNumber,
  fuelGallons,
  fuelStartedAt,
  onGallonsChange,
  onFinishFueling,
}: {
  pumpNumber: string
  fuelGallons: string
  fuelStartedAt: number | null
  onGallonsChange: (value: string) => void
  onFinishFueling: () => void
}) {
  return (
    <>
      <PumpTimerSummary pumpNumber={pumpNumber} startedAt={fuelStartedAt} />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-[var(--color-fleet-text)]">Gallons Pumped</p>
        <input
          type="text"
          inputMode="decimal"
          value={fuelGallons}
          placeholder="Enter gallons dispensed"
          onChange={(e) => onGallonsChange(e.target.value)}
          className="h-14 rounded border border-[var(--color-border)] px-3 text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
        />
        <button
          type="button"
          onClick={onFinishFueling}
          className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
        >
          <Flag className="h-5 w-5" />
          Finish Fueling
        </button>
      </div>
    </>
  )
}

function OnSiteUnlockRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="field-target flex min-h-14 w-full items-center gap-3 rounded border border-[var(--color-border)] text-left"
    >
      <div className="flex flex-1 items-center gap-3 px-4 py-3">
        <Lock className="h-6 w-6 shrink-0" />
        <span className="text-sm font-semibold">On-Site Unlock</span>
      </div>
      <ChevronRight className="mr-2 h-6 w-6 shrink-0 text-[var(--color-text-secondary)]" />
    </button>
  )
}

export function FuelStepContent({
  step,
  pumpNumber,
  unlockMode,
  locationType,
  fuelGallons,
  fuelGallonsDispensed,
  fuelFinalTime,
  fuelStartedAt,
  isAdditionalFueling,
  fuelTransactions,
  unavailablePumps,
  onScanPump,
  onManualEntry,
  onBackToScan,
  onPumpChange,
  onClearPump,
  onUnlockPump,
  onOnSiteUnlock,
  onStartFueling,
  onCancelUnlock,
  onReportIssue,
  onFinishFueling,
  onSubmitMissingGallons,
  onGallonsChange,
  onRetry,
}: FuelStepContentProps) {
  const progress = getFuelProgress(step)
  const manualVariant = getManualFuelingVariant(unlockMode, locationType)
  const isManualFuelingFlow = manualVariant !== null
  const canUnlock = step === 'manual-entry-filled' && pumpNumber.trim().length > 0
  const showRemoteManualEntry =
    !isManualFuelingFlow &&
    ['manual-entry', 'manual-entry-filled', 'manual-entry-error'].includes(step)
  const manualVerifyHasError =
    isManualFuelingFlow &&
    step === 'verify-pump' &&
    pumpNumber.trim().length > 0 &&
    unavailablePumps.includes(Number(pumpNumber.trim()))
  const isManualFuelingInProgress =
    isManualFuelingFlow && step === 'fueling-in-progress'
  const isRemoteInProgress =
    !isManualFuelingFlow &&
    unlockMode === 'remote' &&
    (step === 'fueling-in-progress' || step === 'pump-unlocked')
  const showIssueHistory =
    isAdditionalFueling &&
    step !== 'fueling-complete' &&
    step !== 'additional-fueling-complete'
  const completeRows =
    fuelTransactions.length > 0
      ? fuelTransactions
      : [
          {
            pump: pumpNumber || '8',
            gallons: fuelGallonsDispensed || '5',
            status: 'complete' as const,
          },
        ]

  return (
    <div className="flex flex-col gap-2">
      {showIssueHistory && fuelTransactions.length > 0 && (
        <FuelSummaryTable rows={fuelTransactions} />
      )}

      <ProgressIndicator {...progress} />

      {isManualFuelingFlow && manualVariant && ['verify-pump', 'pump-unlocked'].includes(step) && (
        <ManualFuelingInfoBanner variant={manualVariant} />
      )}

      {step === 'verify-pump' && isManualFuelingFlow && manualVariant && (
        <ManualVerifyPumpForm
          pumpNumber={pumpNumber}
          hasError={manualVerifyHasError}
          onPumpChange={onPumpChange}
          onClearPump={onClearPump}
          onVerifyPump={onUnlockPump}
        />
      )}

      {step === 'verify-pump' && !isManualFuelingFlow && (
        <>
          <button
            type="button"
            onClick={onScanPump}
            className="flex w-full flex-col gap-4 rounded-xl border border-[var(--color-brand-info-border)] bg-white px-6 pb-5 pt-6 text-left"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[var(--color-fleet-info-ring)] opacity-60" />
                <QrCode className="relative h-14 w-14 text-[var(--color-fleet-info)]" />
              </div>
              <p className="text-center text-base font-semibold text-[var(--color-fleet-text-blue-secondary)]">
                Scan Pump QR
              </p>
            </div>
            <p className="text-center text-xs text-[var(--color-fleet-text-secondary)]">
              Scan the QR code at your pump
            </p>
            <span className="fleet-btn fleet-btn-md fleet-btn-contained-info fleet-btn-elevated w-full">
              <QrCode className="h-5 w-5" />
              Scan Pump
            </span>
          </button>
          <button
            type="button"
            onClick={onManualEntry}
            className="fleet-btn fleet-btn-md h-10 w-full text-[var(--color-fleet-text-blue)]"
          >
            Manually Enter Pump Number
          </button>
          <OnSiteUnlockRow onClick={onOnSiteUnlock} />
        </>
      )}

      {step === 'pump-unlocked' && isManualFuelingFlow && manualVariant && (
        <ManualPumpConfirmedCard
          pumpNumber={pumpNumber}
          variant={manualVariant}
          onStartFueling={onStartFueling}
        />
      )}

      {showRemoteManualEntry && (
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
              <FuelIssueNotification
                title="Pump Unavailable"
                message="This pump cannot be unlocked. Select another pump."
              />
            )}

            <button
              type="button"
              onClick={onUnlockPump}
              disabled={!canUnlock}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated h-[54px] w-full disabled:cursor-not-allowed disabled:bg-[rgba(45,47,49,0.12)] disabled:text-[rgba(45,47,49,0.38)] disabled:shadow-none"
            >
              <Lock className="h-5 w-5" />
              Unlock
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
          <OnSiteUnlockRow onClick={onOnSiteUnlock} />
        </>
      )}

      {step === 'unlocking-pump' && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative flex h-[141px] w-[141px] items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-fleet-info-ring)]" />
              <div className="absolute inset-4 animate-pulse rounded-full border-2 border-[var(--color-brand-primary)] opacity-40" />
              <Lock className="relative h-12 w-12 text-[var(--color-brand-primary)]" />
            </div>
            <p className="text-center text-xl font-bold text-[var(--color-text-primary)]">
              Unlocking Pump {pumpNumber || '5'}
            </p>
            <p className="text-center text-sm text-[var(--color-text-primary)]">
              Please wait
            </p>
            <div className="flex w-full items-start gap-3 rounded bg-[var(--color-fleet-info-surface)] px-4 py-3">
              <Info className="mt-0.5 h-[22px] w-[22px] shrink-0 text-[var(--color-brand-primary)]" />
              <p className="text-xs text-[var(--color-brand-secondary)]">
                This may take a few seconds. Please do not leave the screen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelUnlock}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          >
            Cancel Unlock
          </button>
        </div>
      )}

      {isRemoteInProgress && (
        <>
          <p className="text-center text-lg font-bold text-[var(--color-text-primary)]">
            Pump {pumpNumber} · Fueling…
          </p>
          <div className="flex items-start gap-3 border-t-2 border-[var(--color-border)] px-4 py-3">
            <Info className="mt-0.5 h-[22px] w-[22px] shrink-0 text-[var(--color-brand-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Updates may be delayed
              </p>
              <p className="text-sm text-[var(--color-text-primary)]">
                Data will update automatically when available
              </p>
            </div>
          </div>
          <ReportIssueCard onReportIssue={onReportIssue} />
        </>
      )}

      {isManualFuelingInProgress && (
        <ManualFuelingInProgress
          pumpNumber={pumpNumber}
          fuelGallons={fuelGallons}
          fuelStartedAt={fuelStartedAt}
          onGallonsChange={onGallonsChange}
          onFinishFueling={onFinishFueling}
        />
      )}

      {step === 'fueling-complete-missing' && (
        <>
          <ManualFuelingSummaryTable
            pump={pumpNumber || '8'}
            time={fuelFinalTime || '00:01:14'}
            gallons={fuelGallonsDispensed}
          />
          <MissingGallonsForm
            fuelGallons={fuelGallons}
            onGallonsChange={onGallonsChange}
            onSubmit={onSubmitMissingGallons}
          />
        </>
      )}

      {(step === 'fueling-complete' || step === 'additional-fueling-complete') && (
        <>
          {isManualFuelingFlow ? (
            <ManualFuelingSummaryTable
              pump={pumpNumber || '8'}
              time={fuelFinalTime || '00:01:14'}
              gallons={fuelGallonsDispensed}
            />
          ) : (
            <FuelSummaryTable rows={completeRows} />
          )}
          <NotEnoughFuelCard onReportIssue={onReportIssue} />
        </>
      )}

      {step === 'connection-lost' && (
        <>
          <div className="flex flex-col gap-4">
            <FuelIssueNotification
              title="Connection Lost"
              message={`Connection to Pump ${pumpNumber || '5'} was lost. Try lifting the nozzle or use on-site unlock.`}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[var(--color-fleet-text)]">Pump locked?</p>
              <button
                type="button"
                onClick={onOnSiteUnlock}
                className="fleet-btn fleet-btn-lg h-12 fleet-btn-contained-info fleet-btn-elevated w-full"
              >
                <Fuel className="h-6 w-6" />
                On-Site Unlock
              </button>
            </div>
          </div>
          <OnSiteUnlockRow onClick={onOnSiteUnlock} />
        </>
      )}

      {step === 'no-response' && (
        <>
          <div className="flex flex-col gap-4">
            <FuelIssueNotification
              title="No Response"
              message={`Pump ${pumpNumber || '5'} did not respond. Try lifting the nozzle or retry unlock.`}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[var(--color-fleet-text)]">Pump locked?</p>
              <button
                type="button"
                onClick={onRetry}
                className="fleet-btn fleet-btn-lg h-12 w-full border border-[var(--color-fleet-info)] bg-white text-[var(--color-fleet-text-blue)]"
              >
                <RefreshCw className="h-6 w-6" />
                Retry Unlock Pump
              </button>
            </div>
          </div>
          <OnSiteUnlockRow onClick={onOnSiteUnlock} />
        </>
      )}

      {step === 'pump-timeout' && (
        <>
          <div className="flex flex-col gap-4">
            <FuelIssueNotification
              title="Unlock Expired"
              message={`The 60-second unlock window for Pump ${pumpNumber || '5'} has ended.`}
              footer={
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="fleet-btn fleet-btn-lg h-12 fleet-btn-elevated w-full bg-[var(--color-fleet-warning)] text-white"
                  >
                    <RefreshCw className="h-6 w-6" />
                    Retry Unlock Pump
                  </button>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="fleet-btn fleet-btn-lg h-12 w-full text-[var(--color-fleet-text-orange)]"
                  >
                    <ArrowLeftRight className="h-6 w-6" />
                    Change Pump
                  </button>
                </div>
              }
            />
          </div>
          <OnSiteUnlockRow onClick={onOnSiteUnlock} />
        </>
      )}

      {step === 'pump-unavailable' && (
        <>
          <FuelIssueNotification
            title="Pump Unavailable"
            message="This pump is currently unavailable. Try another pump or enter manually."
            footer={
              <button
                type="button"
                onClick={onRetry}
                className="fleet-btn fleet-btn-lg h-12 fleet-btn-contained-info fleet-btn-elevated w-full"
              >
                <Fuel className="h-6 w-6" />
                Choose Another Pump
              </button>
            }
          />
          <OnSiteUnlockRow onClick={onOnSiteUnlock} />
        </>
      )}
    </div>
  )
}
