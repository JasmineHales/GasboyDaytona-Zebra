import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Flag,
  Fuel,
  Lock,
  Play,
  RefreshCw,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { FuelStep, FuelTransaction } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { PumpConfirmedCard } from '../ui/PumpConfirmedCard'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { TextField } from '../ui/TextField'
import { WorkflowInProgressStatus } from '../ui/WorkflowInProgressStatus'
import { getFuelProgress } from '../../utils/progress'
import { FuelUnlockModeInfo } from './FuelUnlockModeInfo'

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
    <div className="workflow-stack">
      <TextField
        label="Gallons Pumped"
        value={fuelGallons}
        placeholder="Enter gallons dispensed"
        inputMode="decimal"
        onChange={onGallonsChange}
        onClear={() => onGallonsChange('')}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`fleet-btn fleet-btn-lg w-full ${
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
          <p className="fleet-issue-notification__title">{title}</p>
          <p className="fleet-issue-notification__message">{message}</p>
        </div>
      </div>
      {footer}
    </div>
  )
}

function ReportIssueLink({
  onReportIssue,
  title,
  description,
  actionLabel = 'Report it',
}: {
  onReportIssue: () => void
  title: string
  description: string
  actionLabel?: string
}) {
  return (
    <div className="fleet-report-issue">
      <div className="fleet-report-issue__copy">
        <p className="fleet-report-issue__title">{title}</p>
        <p className="fleet-report-issue__message">{description}</p>
      </div>
      <button
        type="button"
        onClick={onReportIssue}
        className="fleet-btn fleet-btn-lg fleet-btn-outlined fleet-report-issue__action w-full"
      >
        <Flag className="h-4 w-4" />
        {actionLabel}
      </button>
    </div>
  )
}

function PriorFuelSummary({ rows }: { rows: FuelTransaction[] }) {
  return (
    <p className="text-sm text-[var(--color-fleet-text-secondary)]">
      Previous:{' '}
      {rows
        .map((row) => `Pump ${row.pump} · ${row.gallons} gal`)
        .join(' · ')}
    </p>
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

const unlockActionClass =
  'fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full disabled:cursor-not-allowed disabled:bg-[rgba(45,47,49,0.12)] disabled:text-[rgba(45,47,49,0.38)] disabled:shadow-none'

const verifyActionClass =
  'fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full disabled:cursor-not-allowed disabled:bg-[rgba(45,47,49,0.12)] disabled:text-[rgba(45,47,49,0.38)] disabled:shadow-none'

function ManualPumpConfirmedCard({
  pumpNumber,
  onStartFueling,
}: {
  pumpNumber: string
  onStartFueling: () => void
}) {
  const title = `You're at Pump ${pumpNumber}`
  const subtitle = 'Begin fueling, then record gallons when done.'

  return (
    <PumpConfirmedCard
      title={title}
      subtitle={subtitle}
      actionLabel="Start Fueling"
      onAction={onStartFueling}
      actionIcon={<Play className="h-5 w-5 fill-white" />}
    />
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
      <WorkflowInProgressStatus
        icon={<Fuel className="h-6 w-6" />}
        title="Fueling at the pump"
        subtitle="Record gallons when you're done fueling"
        note="Enter the amount from the pump display before finishing"
        pumpNumber={pumpNumber}
        startedAt={fuelStartedAt}
      />
      <div className="workflow-stack">
        <TextField
          label="Gallons Pumped"
          value={fuelGallons}
          placeholder="Enter gallons dispensed"
          inputMode="decimal"
          onChange={onGallonsChange}
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
  const isRemoteUnlockFlow = locationType === 'gasboy' && unlockMode === 'remote'
  const isGasboyRemoteUnlockStep =
    isRemoteUnlockFlow &&
    (step === 'verify-pump' ||
      step === 'manual-entry' ||
      step === 'manual-entry-filled' ||
      step === 'manual-entry-error')
  const manualVariant = getManualFuelingVariant(unlockMode, locationType)
  const isManualFuelingFlow = manualVariant !== null
  const isRemoteInProgress =
    !isManualFuelingFlow &&
    unlockMode === 'remote' &&
    (step === 'fueling-in-progress' || step === 'pump-unlocked')
  const isManualFuelingInProgress =
    isManualFuelingFlow && step === 'fueling-in-progress'
  const progress = {
    ...getFuelProgress(step),
    ...(isGasboyRemoteUnlockStep && { label: 'Remote Unlock' }),
    ...(isRemoteUnlockFlow && { tone: 'remote' as const }),
    ...(isManualFuelingInProgress && {
      tone: 'info' as const,
      progressFillClass: 'bg-[var(--color-fleet-info)]',
    }),
    ...((isRemoteInProgress || isManualFuelingInProgress) && {
      stepText: 'Step 3 of 4',
    }),
  }
  const canUnlock = step === 'manual-entry-filled' && pumpNumber.trim().length > 0
  const showGasboyVerifyDefault =
    step === 'verify-pump' &&
    locationType === 'gasboy' &&
    (unlockMode === 'remote' || unlockMode === 'on-site')
  const manualEntrySteps = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ] as const
  const isManualEntryStep = manualEntrySteps.includes(
    step as (typeof manualEntrySteps)[number],
  )
  const showNonGasboyVerifyDefault =
    step === 'verify-pump' && locationType === 'non-gasboy'
  const showNonGasboyManualEntry =
    locationType === 'non-gasboy' && isManualEntryStep
  const showGasboyManualEntry =
    locationType === 'gasboy' &&
    (unlockMode === 'remote' || unlockMode === 'on-site') &&
    isManualEntryStep
  const isLocationVerifyFlow =
    locationType === 'non-gasboy' || unlockMode === 'on-site'
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
  const switchUnlockMode =
    unlockMode === 'remote' ? onOnSiteUnlock : onCancelUnlock

  return (
    <div className="workflow-stack">
      {showIssueHistory && fuelTransactions.length > 0 && (
        <PriorFuelSummary rows={fuelTransactions} />
      )}

      <ProgressIndicator {...progress} />

      {showNonGasboyVerifyDefault && (
        <PumpVerifyDefault
          scanLabel="Scan Pump"
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
        />
      )}

      {showGasboyVerifyDefault && (
        <PumpVerifyDefault
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          unlockMode={unlockMode}
          onSwitchUnlockMode={switchUnlockMode}
        />
      )}

      {step === 'pump-verified' && isManualFuelingFlow && manualVariant && (
        <ManualPumpConfirmedCard
          pumpNumber={pumpNumber}
          onStartFueling={onStartFueling}
        />
      )}

      {(showGasboyManualEntry || showNonGasboyManualEntry) && (
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
              <FuelIssueNotification
                title="Pump Unavailable"
                message={
                  isLocationVerifyFlow
                    ? 'This pump cannot be used. Select another pump.'
                    : 'This pump cannot be unlocked. Select another pump.'
                }
              />
            )}

            <button
              type="button"
              onClick={onUnlockPump}
              disabled={!canUnlock}
              className={
                showGasboyManualEntry && unlockMode === 'remote'
                  ? unlockActionClass
                  : verifyActionClass
              }
            >
              <Lock className="h-5 w-5" />
              {isLocationVerifyFlow ? 'Verify Pump' : 'Unlock Pump'}
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined fleet-btn-start w-full"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to scan
          </button>

          {showGasboyManualEntry && (
            <FuelUnlockModeInfo mode={unlockMode} onSwitch={switchUnlockMode} />
          )}
        </>
      )}

      {step === 'unlocking-pump' && (
        <div className="workflow-stack">
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  isRemoteUnlockFlow
                    ? 'border-[var(--color-fleet-positive-100)]'
                    : 'border-[var(--color-fleet-info-ring)]'
                }`}
              />
              <div
                className={`absolute inset-2 animate-pulse rounded-full border-2 opacity-40 ${
                  isRemoteUnlockFlow
                    ? 'border-[var(--color-fleet-positive-500)]'
                    : 'border-[var(--color-brand-primary)]'
                }`}
              />
              <Lock
                className={`relative h-8 w-8 ${
                  isRemoteUnlockFlow
                    ? 'text-[var(--color-fleet-positive-500)]'
                    : 'text-[var(--color-brand-primary)]'
                }`}
              />
            </div>
            <p className="text-center text-base font-bold text-[var(--color-text-primary)]">
              Unlocking Pump {pumpNumber || '5'}…
            </p>
            <p className="text-center text-sm text-[var(--color-fleet-text-secondary)]">
              This may take a few seconds
            </p>
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
          <WorkflowInProgressStatus
            tone="remote"
            icon={<Fuel className="h-6 w-6" />}
            title="Fueling at the pump"
            subtitle="Fuel now — this screen updates when you're done"
            note="Updates may be delayed — stay at the pump until fueling finishes"
            pumpNumber={pumpNumber}
            startedAt={fuelStartedAt}
          />
          <ReportIssueLink
            onReportIssue={onReportIssue}
            title="Pump issue?"
            description="Let us know if the pump stopped early or isn't dispensing correctly."
          />
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
          <ReportIssueLink
            onReportIssue={onReportIssue}
            title="Didn't get enough fuel?"
            description="Tell us if the gallons don't match what you expected at the pump."
          />
        </>
      )}

      {step === 'connection-lost' && (
        <>
          <div className="flex flex-col gap-4">
            <FuelIssueNotification
              title="Connection Lost"
              message={`Connection to Pump ${pumpNumber || '5'} was lost. Try lifting the nozzle or use on-site unlock.`}
            />
            <button
              type="button"
              onClick={onOnSiteUnlock}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            >
              <Fuel className="h-6 w-6" />
              On-Site Unlock
            </button>
          </div>
        </>
      )}

      {step === 'no-response' && (
        <div className="flex flex-col gap-4">
          <FuelIssueNotification
            title="No Response"
            message={`Pump ${pumpNumber || '5'} did not respond. Try lifting the nozzle or retry unlock.`}
          />
          <div className="workflow-stack">
            <button
              type="button"
              onClick={onRetry}
              className="fleet-btn fleet-btn-lg w-full border border-[var(--color-fleet-info)] bg-white text-[var(--color-fleet-text-blue)]"
            >
              <RefreshCw className="h-6 w-6" />
              Retry Unlock Pump
            </button>
            <FuelUnlockModeInfo mode="remote" onSwitch={onOnSiteUnlock} />
          </div>
        </div>
      )}

      {step === 'pump-timeout' && (
        <>
          <div className="flex flex-col gap-4">
            <FuelIssueNotification
              title="Unlock Expired"
              message={`The 60-second unlock window for Pump ${pumpNumber || '5'} has ended.`}
              footer={
                <div className="workflow-stack">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="fleet-btn fleet-btn-lg fleet-btn-elevated w-full bg-[var(--color-fleet-warning)] text-white"
                  >
                    <RefreshCw className="h-6 w-6" />
                    Retry Unlock Pump
                  </button>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="fleet-btn fleet-btn-lg w-full text-[var(--color-fleet-text-orange)]"
                  >
                    <ArrowLeftRight className="h-6 w-6" />
                    Change Pump
                  </button>
                </div>
              }
            />
          </div>
        </>
      )}

      {step === 'pump-unavailable' && (
        <FuelIssueNotification
          title="Pump Unavailable"
          message="This pump is currently unavailable. Try another pump or enter manually."
          footer={
            <button
              type="button"
              onClick={onRetry}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            >
              <Fuel className="h-6 w-6" />
              Choose Another Pump
            </button>
          }
        />
      )}
    </div>
  )
}
