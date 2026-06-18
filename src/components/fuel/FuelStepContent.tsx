import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Check,
  Clock,
  Flag,
  Fuel,
  Lock,
  Play,
  RefreshCw,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { FuelStep, FuelTransaction } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { PumpConfirmedCard } from '../ui/PumpConfirmedCard'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { TextField } from '../ui/TextField'
import { UnlockingStatus } from '../ui/UnlockingStatus'
import {
  WorkflowInProgressStatus,
  NOZZLE_PICKUP_WINDOW_SECONDS,
} from '../ui/WorkflowInProgressStatus'
import { getFuelProgress } from '../../utils/progress'
import { pumpVerifyCopy } from '../../utils/pumpVerifyCopy'
import { isUnavailablePump } from '../../utils/pump'
import {
  getCleaningQuickSelectHint,
} from '../../utils/pumpQuickSelect'
import { FuelUnlockModeInfo } from './FuelUnlockModeInfo'
import { PumpIssueCard } from './PumpIssueCard'
import { PumpQuickSelect } from '../ui/PumpQuickSelect'
import { trackProps } from '../../utils/tracking'

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
  fuelGallonsPending?: boolean
  fuelPumpStatusReceived?: boolean
  unavailablePumps?: number[]
  cleaningActivePump?: string | null
  cleaningQuickSelectInProgress?: boolean
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
  onQuickSelectPump: (pump: string) => void
  onClearPump: () => void
  onUnlockPump: () => void
  onOnSiteUnlock: () => void
  onStartFueling: () => void
  onCancelUnlock: () => void
  onReportIssue: () => void
  onFinishFueling: () => void
  onCompleteRemoteFueling: () => void
  onSubmitMissingGallons: () => void
  onGallonsChange: (value: string) => void
  onRetry: () => void
}

type ManualFuelingVariant = 'on-site' | 'non-gasboy'

function formatGallonsDisplay(gallons: string): string {
  return gallons.trim() ? gallons : '--'
}

function FuelStatusChip({ status }: { status: FuelTransaction['status'] }) {
  if (status === 'complete') {
    return (
      <span className="inline-flex rounded-full bg-[var(--color-chip-complete-bg)] px-2 py-0.5 text-sm font-semibold text-[var(--color-text-success)]">
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
        clearTrackTag="fuel.missing-gallons.clear"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
        {...trackProps('fuel.missing-gallons.submit')}
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
          <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">
            {formatGallonsDisplay(row.gallons)}
          </p>
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
    <div className="fleet-issue-notification" role="alert">
      <div className="flex gap-3">
        <AlertTriangle className="h-8 w-8 shrink-0 text-[var(--color-brand-error)]" aria-hidden />
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
  trackTag = 'fuel.report-issue',
  variant = 'default',
}: {
  onReportIssue: () => void
  title: string
  description: string
  actionLabel?: string
  trackTag?: string
  variant?: 'default' | 'inline'
}) {
  const isInline = variant === 'inline'

  const actionButton = (
    <button
      type="button"
      onClick={onReportIssue}
      className={
        isInline
          ? 'fleet-btn fleet-btn-lg fleet-btn-elevated fleet-report-issue__action fleet-report-issue__action--inline w-full'
          : 'fleet-btn fleet-btn-lg fleet-btn-outlined fleet-report-issue__action w-full'
      }
      {...trackProps(trackTag)}
    >
      {actionLabel}
    </button>
  )

  return (
    <div
      className={`fleet-report-issue${isInline ? ' fleet-report-issue--inline' : ''}`}
    >
      <div className="fleet-report-issue__copy">
        <p className="fleet-report-issue__title">{title}</p>
        <p className="fleet-report-issue__message">{description}</p>
      </div>
      {actionButton}
    </div>
  )
}

function PriorFuelSummary({ rows }: { rows: FuelTransaction[] }) {
  return (
    <p className="prior-fuel-summary">
      <span className="prior-fuel-summary__label">Previous:</span>{' '}
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
  'fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full'

const verifyActionClass =
  'fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full'

const fuelIssueActionClass =
  'fleet-btn fleet-btn-lg fleet-btn-outlined fleet-issue-notification__action w-full'

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
      actionIcon={<Play className="h-5 w-5 fill-current" />}
      trackAction="fuel.start-fueling"
    />
  )
}

function useRemoteFuelingPickupPhase(
  sessionStartedAt: number | null,
  pumpStatusReceived: boolean,
) {
  const fallbackStartRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const startedAt = sessionStartedAt ?? fallbackStartRef.current

  useEffect(() => {
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  const remaining = Math.max(0, NOZZLE_PICKUP_WINDOW_SECONDS - elapsed)
  const isPickupPhase = !pumpStatusReceived && remaining > 0

  return { isPickupPhase, remaining }
}

function RemoteFuelingLockNotice({ remaining }: { remaining: number }) {
  return (
    <div
      className="remote-fueling-active__timer"
      role="status"
      aria-live="polite"
    >
      <Clock className="remote-fueling-active__timer-icon" aria-hidden />
      <p className="remote-fueling-active__timer-text">
        Fuel within {remaining} sec or pump locks.
      </p>
    </div>
  )
}

function RemoteFuelingActive({
  pumpNumber,
  fuelStartedAt,
  fuelPumpStatusReceived = false,
  onComplete,
  onReportIssue,
}: {
  pumpNumber: string
  fuelStartedAt: number | null
  fuelPumpStatusReceived?: boolean
  onComplete: () => void
  onReportIssue: () => void
}) {
  const pump = pumpNumber.trim() || '--'
  const { isPickupPhase, remaining } = useRemoteFuelingPickupPhase(
    fuelStartedAt,
    fuelPumpStatusReceived,
  )

  return (
    <div className="remote-fueling-active">
      <section className="remote-fueling-active__card" aria-label={`Pump ${pump}`}>
        <p className="remote-fueling-active__pump-label">Pump</p>
        <p className="remote-fueling-active__pump-value">{pump}</p>
        {isPickupPhase ? (
          <>
            <div className="remote-fueling-active__action">
              <p className="remote-fueling-active__action-title">Start fueling now</p>
              <p className="remote-fueling-active__action-hint">
                Pick up the nozzle to begin fueling.
              </p>
            </div>
            <RemoteFuelingLockNotice remaining={remaining} />
          </>
        ) : (
          <div className="remote-fueling-active__action remote-fueling-active__action--steady">
            <p className="remote-fueling-active__action-title">Fueling</p>
            <p className="remote-fueling-active__action-hint">
              If you&apos;ve finished fueling, tap Complete Fueling.
            </p>
          </div>
        )}
      </section>

      {isPickupPhase ? (
        <p className="remote-fueling-active__helper">
          <span className="remote-fueling-active__helper-lead">Finished Fueling?</span>{' '}
          Tap complete fueling
        </p>
      ) : null}

      <button
        type="button"
        onClick={onComplete}
        className="fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full"
        {...trackProps('fuel.complete-remote-fueling')}
      >
        <Check className="h-6 w-6" aria-hidden />
        Complete Fueling
      </button>

      <PumpIssueCard layout="horizontal" onReportIssue={onReportIssue} />
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
      <WorkflowInProgressStatus
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
          {...trackProps('fuel.finish-fueling')}
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
  unavailablePumps = [],
  onScanPump,
  onManualEntry,
  onBackToScan,
  onPumpChange,
  onQuickSelectPump,
  onClearPump,
  onUnlockPump,
  onOnSiteUnlock,
  onStartFueling,
  onCancelUnlock,
  onReportIssue,
  onFinishFueling,
  onCompleteRemoteFueling,
  onSubmitMissingGallons,
  onGallonsChange,
  onRetry,
  fuelGallonsPending = false,
  fuelPumpStatusReceived = false,
  cleaningActivePump = null,
  cleaningQuickSelectInProgress = false,
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
  const manualEntrySteps = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ] as const
  const isManualEntryStep = manualEntrySteps.includes(
    step as (typeof manualEntrySteps)[number],
  )
  const progress = {
    ...getFuelProgress(step),
    ...(isGasboyRemoteUnlockStep && {
      label: pumpVerifyCopy.remote.label,
      description: pumpVerifyCopy.remote.description,
    }),
    ...(locationType === 'gasboy' &&
      unlockMode === 'on-site' &&
      (step === 'verify-pump' || isManualEntryStep) && {
        description: pumpVerifyCopy['on-site'].description,
      }),
    ...((isRemoteInProgress || isManualFuelingInProgress) && {
      totalSteps: 4,
    }),
    ...(isRemoteInProgress && {
      label: 'Fueling Session Active',
      description: undefined,
    }),
  }
  const isUnavailable = isUnavailablePump(pumpNumber, unavailablePumps)
  const isUnavailableSelection =
    isUnavailable &&
    (step === 'manual-entry-filled' || step === 'manual-entry-error')
  const canUnlock =
    step === 'manual-entry-filled' && pumpNumber.trim().length > 0 && !isUnavailable
  const showGasboyVerifyDefault =
    step === 'verify-pump' &&
    locationType === 'gasboy' &&
    (unlockMode === 'remote' || unlockMode === 'on-site')
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
            gallons: fuelGallonsDispensed || (fuelGallonsPending ? '' : '5'),
            status: 'complete' as const,
          },
        ]
  const switchUnlockMode =
    unlockMode === 'remote' ? onOnSiteUnlock : onCancelUnlock
  const hasSyncedGallonData =
    fuelGallonsDispensed.trim().length > 0 ||
    fuelTransactions.some((row) => row.gallons.trim().length > 0)
  const showGallonsPendingNotice = fuelGallonsPending && !hasSyncedGallonData
  const cleaningQuickSelectPump = (() => {
    const pump = cleaningActivePump?.trim()
    if (!pump) return null
    if (unlockMode !== 'remote' || locationType !== 'gasboy') return null
    if (isUnavailablePump(pump, unavailablePumps)) return null
    if (step === 'verify-pump') return pump
    if (isManualEntryStep && !pumpNumber.trim()) return pump
    return null
  })()
  const cleaningQuickSelectHint = getCleaningQuickSelectHint(cleaningQuickSelectInProgress)

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
          trackPrefix="fuel.verify"
        />
      )}

      {showGasboyVerifyDefault && (
        <PumpVerifyDefault
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          unlockMode={unlockMode}
          onSwitchUnlockMode={switchUnlockMode}
          quickSelectPump={cleaningQuickSelectPump ?? undefined}
          quickSelectHint={cleaningQuickSelectHint}
          onQuickSelectPump={onQuickSelectPump}
          trackPrefix="fuel.verify"
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
          {cleaningQuickSelectPump && (
            <PumpQuickSelect
              pump={cleaningQuickSelectPump}
              hint={cleaningQuickSelectHint}
              onSelect={onQuickSelectPump}
              remoteAccent={unlockMode === 'remote'}
              trackTag="fuel.verify.quick-select"
            />
          )}

          <TextField
            label="Manual Entry"
            hint="Enter the pump number displayed on the pump"
            value={pumpNumber}
            placeholder="Enter pump no."
            inputMode="numeric"
            invalid={isUnavailableSelection}
            error={
              isUnavailableSelection
                ? isLocationVerifyFlow
                  ? 'This pump is unavailable. Select another pump.'
                  : 'This pump cannot be unlocked. Select another pump.'
                : undefined
            }
            onChange={onPumpChange}
            onClear={onClearPump}
            clearTrackTag="fuel.pump.clear"
          />

          <div className="workflow-stack">
            <button
              type="button"
              onClick={onUnlockPump}
              disabled={!canUnlock}
              aria-disabled={!canUnlock}
              className={
                showGasboyManualEntry && unlockMode === 'remote'
                  ? unlockActionClass
                  : verifyActionClass
              }
              {...trackProps(
                isLocationVerifyFlow ? 'fuel.verify-pump' : 'fuel.unlock-pump',
              )}
            >
              <Lock className="h-5 w-5" />
              {isLocationVerifyFlow ? 'Verify Pump' : 'Unlock Pump'}
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined fleet-btn-start w-full"
            {...trackProps('fuel.back-to-scan')}
          >
            <ArrowLeft className="h-5 w-5" />
            Back to scan
          </button>

          {showGasboyManualEntry && (
            <FuelUnlockModeInfo
              mode={unlockMode}
              onSwitch={switchUnlockMode}
              trackPrefix="fuel.unlock-mode"
            />
          )}
        </>
      )}

      {step === 'unlocking-pump' && (
        <div className="workflow-stack">
          <UnlockingStatus pumpNumber={pumpNumber} />
          <button
            type="button"
            onClick={onCancelUnlock}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps('fuel.cancel-unlock')}
          >
            Cancel Unlock
          </button>
        </div>
      )}

      {isRemoteInProgress && (
        <RemoteFuelingActive
          pumpNumber={pumpNumber}
          fuelStartedAt={fuelStartedAt}
          fuelPumpStatusReceived={fuelPumpStatusReceived}
          onComplete={onCompleteRemoteFueling}
          onReportIssue={onReportIssue}
        />
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
          {showGallonsPendingNotice && (
            <div className="workflow-stack rounded bg-[var(--color-fleet-info-surface)] px-4 py-3">
              <p className="text-left text-sm font-semibold text-[var(--color-text-primary)]">
                Gallons pending
              </p>
              <p className="text-left text-sm font-medium text-[var(--color-text-primary)]">
                Gallon data was not available yet. It will be added automatically
                when the pump report arrives.
              </p>
            </div>
          )}
          <div className="fuel-complete-summary">
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
              variant="inline"
              onReportIssue={onReportIssue}
              title="Need more fuel?"
              description="Report a problem to request additional fueling."
              actionLabel="Report & Continue"
              trackTag="fuel.report-issue.complete"
            />
          </div>
        </>
      )}

      {step === 'connection-lost' && (
        <FuelIssueNotification
          title="Connection Lost"
          message={`Connection to Pump ${pumpNumber || '5'} was lost. Try lifting the nozzle or use on-site unlock.`}
          footer={
            <button
              type="button"
              onClick={onOnSiteUnlock}
              className={fuelIssueActionClass}
              {...trackProps('fuel.connection-lost.on-site-unlock')}
            >
              <Fuel className="h-6 w-6" />
              On-Site Unlock
            </button>
          }
        />
      )}

      {step === 'no-response' && (
        <FuelIssueNotification
          title="No Response"
          message={`Pump ${pumpNumber || '5'} did not respond. Try lifting the nozzle or retry unlock.`}
          footer={
            <div className="workflow-stack">
              <button
                type="button"
                onClick={onRetry}
                className={fuelIssueActionClass}
                {...trackProps('fuel.no-response.retry')}
              >
                <RefreshCw className="h-6 w-6" />
                Retry Unlock Pump
              </button>
              <FuelUnlockModeInfo
                mode="remote"
                onSwitch={onOnSiteUnlock}
                trackPrefix="fuel.no-response.unlock-mode"
              />
            </div>
          }
        />
      )}

      {step === 'pump-timeout' && (
        <FuelIssueNotification
          title="Unlock Expired"
          message={`The 60-second unlock window for Pump ${pumpNumber || '5'} has ended.`}
          footer={
            <div className="workflow-stack">
              <button
                type="button"
                onClick={onRetry}
                className={fuelIssueActionClass}
                {...trackProps('fuel.pump-timeout.retry')}
              >
                <RefreshCw className="h-6 w-6" />
                Retry Unlock Pump
              </button>
              <button
                type="button"
                onClick={onRetry}
                className={fuelIssueActionClass}
                {...trackProps('fuel.pump-timeout.change-pump')}
              >
                <ArrowLeftRight className="h-6 w-6" />
                Change Pump
              </button>
            </div>
          }
        />
      )}

      {step === 'pump-unavailable' && (
        <FuelIssueNotification
          title="Pump Unavailable"
          message="This pump is currently unavailable. Try another pump or enter manually."
          footer={
            <button
              type="button"
              onClick={onRetry}
              className={fuelIssueActionClass}
              {...trackProps('fuel.pump-unavailable.choose-another')}
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
